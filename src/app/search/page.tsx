'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import NextImage from 'next/image';

// Importa dinamicamente il componente LeafletMap
const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

const translations = {
  it: {
    generaAvventura: 'Genera la tua Avventura',
    da: 'Da',
    a: 'A',
    tipologia: 'Tipologia',
    alloggio: 'Alloggio',
    noleggio: 'Noleggio',
    voli: 'Voli',
    risultati: 'Risultati',
    nessunRisultato: 'Nessun risultato trovato.',
    caricamentoRisultati: 'Caricamento risultati...',
    erroreCaricamento: 'Errore durante il caricamento dei risultati.',
  },
  en: {
    generaAvventura: 'Generate Your Adventure',
    da: 'From',
    a: 'To',
    tipologia: 'Type',
    alloggio: 'Accommodation',
    noleggio: 'Rental',
    voli: 'Flights',
    risultati: 'Results',
    nessunRisultato: 'No results found.',
    caricamentoRisultati: 'Loading results...',
    erroreCaricamento: 'Error loading results.',
  },
  es: {
    generaAvventura: 'Generar Tu Aventura',
    da: 'Desde',
    a: 'Hasta',
    tipologia: 'Tipo',
    alloggio: 'Alojamiento',
    noleggio: 'Alquiler',
    voli: 'Flights',
    risultati: 'Results',
    nessunRisultato: 'No se encontraron resultados.',
    caricamentoRisultati: 'Cargando resultados...',
    erroreCaricamento: 'Error al cargar resultados.',
  },
  fr: {
    generaAvventura: 'Générer Toi Aventure',
    da: 'De',
    a: 'À',
    tipologia: 'Catégorie',
    alloggio: 'Accommodation',
    noleggio: 'Rental',
    voli: 'Flights',
    risultati: 'Results',
    nessunRisultato: 'No result found.',
    caricamentoRisultati: 'Loading results...',
    erroreCaricamento: 'Error loading results.',
  },
};

// Funzione per ottenere le coordinate tramite Nominatim
async function getCoordinates(city: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error('Error in getCoordinates:', error);
    return null;
  }
}

// Funzione per calcolare la distanza con la formula di Haversine
function haversineDistance(coord1: [number, number], coord2: [number, number]): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Funzione per calcolare il totale dei km del percorso
async function calculateRouteDistance(coords: [number, number][]): Promise<number> {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return Math.round(total);
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q');

  // Stato per la lingua (default 'en')
  const [language, setLanguage] = useState('en');
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(storedLanguage);
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail);
    };
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // Stati per i risultati (esempio)
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchSearchResults = async (term: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/search?term=${encodeURIComponent(term)}&lang=${encodeURIComponent(language)}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Errore nella ricerca:', error);
        setError(translations[language].erroreCaricamento);
      } finally {
        setIsLoading(false);
      }
    };
    if (searchTerm) {
      fetchSearchResults(searchTerm);
    }
  }, [searchTerm, language]);

  // Stati per l'itinerario: array di città aggiuntive e input corrente
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  // Stati per le coordinate della rotta e il totale dei km
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [totalKm, setTotalKm] = useState(0);
  const [isCalculatingKm, setIsCalculatingKm] = useState(false);

  // Aggiorna le coordinate della rotta e il totale dei km quando il punto di partenza o l'itinerario cambiano
  useEffect(() => {
    async function updateRoute() {
      setIsCalculatingKm(true);
      if (!searchTerm) {
        setRouteCoordinates([]);
        setTotalKm(0);
        setIsCalculatingKm(false);
        return;
      }
      const coords: [number, number][] = [];
      const start = await getCoordinates(searchTerm);
      if (start) {
        coords.push(start);
      }
      for (const city of itinerary) {
        if (city.trim() !== '') {
          const c = await getCoordinates(city);
          if (c) {
            coords.push(c);
          }
        }
      }
      setRouteCoordinates(coords);
      if (coords.length > 1) {
        const km = await calculateRouteDistance(coords);
        setTotalKm(km);
      } else {
        setTotalKm(0);
      }
      setIsCalculatingKm(false);
    }
    updateRoute();
  }, [searchTerm, itinerary]);

  // Gestione dell'input: conferma città con Enter
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim() !== '') {
        setItinerary(prev => [...prev, currentInput.trim()]);
        setCurrentInput('');
      }
    }
  };

  // Funzione per aggiungere la città corrente all'itinerario (tramite clic sull'icona della lente)
  const handleAddCity = () => {
    if (currentInput.trim() !== '') {
      setItinerary(prev => [...prev, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  // Funzione per rimuovere una città dall'itinerario
  const handleRemoveCity = (index: number) => {
    setItinerary(prev => prev.filter((_, i) => i !== index));
  };

  // Stile per il pulsante "Genera Avventura" (bordo arrotondato)
  const adventureButtonStyle = {
    padding: '10px 20px',
    borderRadius: '20px',
    color: '#00008B',
    backgroundColor: 'white',
    border: '1px solid #00008B',
    cursor: 'pointer',
    marginTop: '5px',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
  };

  // Stile per l'input itinerario (bordo arrotondato, 1px solid #00008B, testo in grassetto)
  const itineraryInputStyle = {
    width: 'calc(100% - 40px)',
    padding: '5px',
    fontWeight: 'bold',
    border: '1px solid #00008B',
    borderRadius: '5px',
    marginRight: '5px',
  };

  // Stile per il pulsante "Enter" (lente, all'interno del pulsante)
  const enterButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  // Variabili per configurare le posizioni verticali delle sezioni
  const itinerarySectionMarginTop = '100px';
  const mapMarginTop = '100px';

  // Stile per lo spinner (placeholder)
  const spinnerStyle = {
    fontWeight: 'bold',
    color: '#00008B',
  };

  const langTranslations = translations[language] || translations.en;

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'row', padding: '20px', gap: '20px' }}>
        {/* Sezione Itinerario (a sinistra) */}
        <div style={{ flexBasis: '30%', marginTop: itinerarySectionMarginTop, maxHeight: '400px', overflowY: 'auto', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Totale km: {isCalculatingKm ? <span style={spinnerStyle}>Calcolo km...</span> : `${totalKm} km`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Inserisci città"
              pattern="[A-Za-z\s]+"
              style={itineraryInputStyle}
            />
            <button onClick={handleAddCity} style={enterButtonStyle}>
              <NextImage
                src="/magnifying-glass-search-free-png.webp"
                alt="Invia città"
                width={30}
                height={30}
              />
            </button>
          </div>
          <div>
            {itinerary.map((city, index) => (
              <div key={index} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{city}</span>
                <button onClick={() => handleRemoveCity(index)} style={{ cursor: 'pointer' }}>X</button>
              </div>
            ))}
          </div>
        </div>
        {/* Sezione Mappa e Pulsante "Genera Avventura" (a destra) */}
        <div style={{ flexBasis: '70%', marginTop: mapMarginTop }}>
          <div style={{ width: '100%', height: '300px' }}>
            <LeafletMap location={searchTerm} routeCoordinates={routeCoordinates} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            <button style={adventureButtonStyle}>
              {langTranslations.generaAvventura}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
