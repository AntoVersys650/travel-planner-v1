'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header'; // Assicurati che il percorso sia corretto

// Importa dinamicamente LeafletMap (assumiamo che sia in src/app/components/LeafletMap.tsx)
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
    voli: 'Vuelos',
    risultati: 'Resultados',
    nessunRisultato: 'No se encontraron resultados.',
    caricamentoRisultati: 'Cargando resultados...',
    erroreCaricamento: 'Error al cargar resultados.',
  },
  fr: {
    generaAvventura: 'Générer Toi Aventure',
    da: 'De',
    a: 'À',
    tipologia: 'Catégorie',
    alloggio: 'Hébergement',
    noleggio: 'Location',
    voli: 'Vols',
    risultati: 'Résultats',
    nessunRisultato: 'Aucun résultat trouvé.',
    caricamentoRisultati: 'Chargement des résultats...',
    erroreCaricamento: 'Erreur lors du chargement des résultats.',
  },
};

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q');

  // Stato per la lingua, inizializzato con 'en' come default
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

  // Stati per i risultati
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stati per i filtri
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAlloggi, setShowAlloggi] = useState(true);
  const [showNoleggi, setShowNoleggi] = useState(true);
  const [showVoli, setShowVoli] = useState(true);

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

  // Risultati di esempio se l'API non restituisce nulla
  const exampleResults = [
    { title: 'Hotel A', description: translations[language].alloggio, type: 'alloggio' },
    { title: 'Volo 1', description: translations[language].voli, type: 'volo' },
    { title: 'Noleggio 1', description: translations[language].noleggio, type: 'noleggio' },
  ];

  const combinedResults = results.length > 0 ? results : exampleResults;

  const filteredResults = combinedResults.filter((result) => {
    if (result.type === 'alloggio' && showAlloggi) return true;
    if (result.type === 'noleggio' && showNoleggi) return true;
    if (result.type === 'volo' && showVoli) return true;
    return false;
  });

  // Stile per il pulsante "Genera Avventura"
  const adventureButtonStyle = {
    padding: '10px 20px',
    borderRadius: '5px',
    color: '#00008B',
    backgroundColor: 'white',
    border: '1px solid #00008B',
    cursor: 'pointer',
    marginTop: '5px', // Regola questo valore per spostare verticalmente il pulsante
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%', // Estende il pulsante per tutta la larghezza
  };

  // Variabile per configurare il margine superiore della mappa (per posizionarla in verticale)
  const mapMarginTop = '53px'; // Imposta a '0px' per attaccarla all'header; altrimenti, modifica il valore

  return (
    <div>
      {/* Header sempre visibile */}
      <Header />

      {/* Wrapper per il contenuto */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Sezione orizzontale per la mappa con margine superiore configurabile */}
        <div style={{ width: '100%', height: '400px', marginTop: mapMarginTop, zIndex: 0 }}>
          <LeafletMap location={searchTerm} />
        </div>

        {/* Pulsante "Genera Avventura" attaccato alla mappa e esteso per tutta la larghezza */}
        <div style={{ width: '95%' , textAlign: 'center', marginTop: '1px', marginLeft: '35px', zIndex: 5 }}>
          <button style={adventureButtonStyle}>
            {translations[language].generaAvventura}
          </button>
        </div>

        {/* Sezione filtri e risultati */}
        <div style={{ display: 'flex', flexDirection: 'row', padding: '20px' }}>
          {/* Sezione filtri (sinistra) con linea centrale */}
          <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #ccc' }}>
            {/* Campi data affiancati in grassetto */}
            <div style={{ display: 'flex', gap: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              <div>
                <label htmlFor="fromDate">{translations[language].da}:</label>
                <br />
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label htmlFor="toDate">{translations[language].a}:</label>
                <br />
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ fontWeight: 'bold' }}
                />
              </div>
            </div>

            <h2 style={{ fontWeight: 'bold' }}>{translations[language].tipologia}</h2>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showAlloggi}
                  onChange={(e) => setShowAlloggi(e.target.checked)}
                />
                {translations[language].alloggio}
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showNoleggi}
                  onChange={(e) => setShowNoleggi(e.target.checked)}
                />
                {translations[language].noleggio}
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showVoli}
                  onChange={(e) => setShowVoli(e.target.checked)}
                />
                {translations[language].voli}
              </label>
            </div>
          </div>

          {/* Sezione risultati (centrale) */}
          <div style={{ flex: 2, padding: '20px' }}>
            <h2 style={{ fontWeight: 'bold' }}>{translations[language].risultati}</h2>
            {isLoading && <p>{translations[language].caricamentoRisultati}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && filteredResults.length === 0 && (
              <p>{translations[language].nessunRisultato}</p>
            )}
            <ul>
              {filteredResults.map((result, index) => (
                <li key={index}>
                  <h3>{result.title}</h3>
                  <p>{result.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
