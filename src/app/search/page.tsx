'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import NextImage from 'next/image';

// Importazione dinamica della mappa
const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

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

// Componente per l'autocompletamento
const AutoCompleteInput = ({
  value,
  onChange,
  placeholder,
  index,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  index: number;
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`
      );
      const data = await res.json();
      const sugg = data.map((item: any) => item.display_name);
      setSuggestions(sugg);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    fetchSuggestions(newValue);
  };

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={defaultSearchBarStyle}
        list={`suggestions-${index}`}
        autoComplete="off"
      />
      <datalist id={`suggestions-${index}`}>
        {suggestions.map((sugg, idx) => (
          <option key={idx} value={sugg} />
        ))}
      </datalist>
    </>
  );
};

const iconSize = 32; // Dimensione delle icone per la modalità di spostamento

// Modalità di spostamento con icone
const travelModes = [
  { value: 'plane', icon: '/airplaneicon.png', alt: 'Aeroplano' },
  { value: 'car', icon: '/carsearch.png', alt: 'Auto/Moto' },
  { value: 'foot', icon: '/pedon.png', alt: 'A piedi' },
  { value: 'bike', icon: '/bike.png', alt: 'In bicicletta' },
  { value: 'ferry', icon: '/boat.png', alt: 'Traghetto' },
  { value: 'public', icon: '/publictransport.jpg', alt: 'Trasporto pubblico' },
];

const defaultSearchBarStyle = {
  width: '100%',
  padding: '10px 15px',
  fontSize: '16px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  marginBottom: '10px',
};

const leftSectionStyle = {
  flexBasis: '70%',
};

const rightSectionStyle = {
  flexBasis: '30%',
  maxHeight: '400px', // Altezza fissa per far comparire la scrollbar se necessario
  overflowY: 'auto',
  padding: '10px',
  borderLeft: '1px solid #ccc',
};

const plusButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#00008B',
  fontWeight: 'bold',
  fontSize: '24px',
  cursor: 'pointer',
  marginTop: '10px',
};

const travelModeIconStyle = (selected: boolean) => ({
  border: selected ? '2px solid #00008B' : '2px solid transparent',
  borderRadius: '5px',
  padding: '5px',
  cursor: 'pointer',
  marginRight: '10px',
});

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q');

  // Stato per la lingua
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

  // Stato per eventuali risultati (opzionale)
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
        setError('Errore durante il caricamento dei risultati.');
      } finally {
        setIsLoading(false);
      }
    };
    if (searchTerm) {
      fetchSearchResults(searchTerm);
    }
  }, [searchTerm, language]);

  // Inizializza l'itinerario: il primo elemento è il punto di partenza preso dalla HomePage
  useEffect(() => {
    const storedStartingPoint = localStorage.getItem('startingPoint');
    if (storedStartingPoint) {
      setItinerary([storedStartingPoint]);
    } else {
      setItinerary(['']);
    }
  }, []); // Eseguito una sola volta al mount

  const [itinerary, setItinerary] = useState<string[]>([]);

  // Stato per la modalità di spostamento (default "car")
  const [travelMode, setTravelMode] = useState('car');
  // Stato per le coordinate della route
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);

  // Aggiorna le coordinate ogni volta che cambia l'itinerario
  useEffect(() => {
    const fetchCoordinates = async () => {
      const coordsPromises = itinerary.map(city => getCoordinates(city));
      const coords = await Promise.all(coordsPromises);
      const validCoords = coords.filter(c => c !== null) as [number, number][];
      setRouteCoordinates(validCoords);
    };
    if (itinerary.length > 0) {
      fetchCoordinates();
    }
  }, [itinerary]);

  // Calcolo della distanza totale (formula di Haversine)
  const computeDistance = (coord1: [number, number], coord2: [number, number]) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const lat1 = coord1[0],
      lon1 = coord1[1];
    const lat2 = coord2[0],
      lon2 = coord2[1];
    const R = 6371; // raggio della Terra in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const totalDistance = routeCoordinates.reduce((acc, cur, index, arr) => {
    if (index === 0) return 0;
    return acc + computeDistance(arr[index - 1], cur);
  }, 0);

  // Gestione modifiche delle barre di ricerca
  const handleSearchBarChange = (index: number, value: string) => {
    const newItinerary = [...itinerary];
    newItinerary[index] = value;
    setItinerary(newItinerary);
  };

  const addSearchBar = () => {
    if (itinerary.length < 6) {
      setItinerary([...itinerary, '']);
    }
  };

  const removeSearchBar = (index: number) => {
    // Non consentiamo la rimozione del punto di partenza (indice 0)
    if (index === 0) return;
    if (itinerary.length > 1) {
      setItinerary(itinerary.filter((_, i) => i !== index));
    }
  };

  // Gestione click sul pulsante "Suggerisci itinerario"
  const handleSuggestItinerary = () => {
    console.log('Apertura flow per suggerimento itinerario');
  };

  return (
    <div>
      <Header />
      {/* Contenuto sotto l'header */}
      <div style={{ marginTop: '100px', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
          {/* Sezione Sinistra: Mappa */}
          <div style={leftSectionStyle}>
            <div style={{ width: '100%', height: '400px' }}>
              <LeafletMap
                routeCoordinates={routeCoordinates}
                travelMode={travelMode}
                draggable={true}
                mapSize={{ width: '100%', height: '400px' }}
              />
            </div>
          </div>
          {/* Sezione Destra: Barre di ricerca e controlli con scrollbar */}
          <div style={rightSectionStyle}>
            {/* Modalità di spostamento: icone selezionabili */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              {travelModes.map((mode) => (
                <div
                  key={mode.value}
                  style={travelModeIconStyle(travelMode === mode.value)}
                  onClick={() => setTravelMode(mode.value)}
                >
                  <NextImage src={mode.icon} alt={mode.alt} width={iconSize} height={iconSize} />
                </div>
              ))}
            </div>
            {/* Barre di ricerca con autocompletamento */}
            {itinerary.map((city, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <AutoCompleteInput
                  value={city}
                  onChange={(value) => handleSearchBarChange(index, value)}
                  placeholder={index === 0 ? 'Punto di partenza' : 'Città o Paese'}
                  index={index}
                />
                {index !== 0 && (
                  <button
                    onClick={() => removeSearchBar(index)}
                    style={{ marginLeft: '5px', cursor: 'pointer' }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {/* Bottone per aggiungere una nuova barra di ricerca */}
            {itinerary.length < 6 && (
              <button onClick={addSearchBar} style={plusButtonStyle}>
                +
              </button>
            )}
            <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
              Distanza totale: {totalDistance.toFixed(2)} km
            </div>
            {/* Pulsante "Suggerisci itinerario" */}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleSuggestItinerary}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                  color: '#00008B',
                  backgroundColor: '#fff',
                  border: '1px solid #00008B',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Suggerisci itinerario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
