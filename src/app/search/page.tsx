'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from 'app/components/Header'; // Importa l'header

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q');
  const language = searchParams.get('lang') || 'en'; // Predefinito a 'en' se non è presente

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async (term: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simula una chiamata API per cercare i risultati basati su 'term'
        const fetchedResults = await fetch(`/api/search?term=${encodeURIComponent(term)}&lang=${encodeURIComponent(language)}`);
        const data = await fetchedResults.json();
        setResults(data.results);
      } catch (error) {
        console.error('Errore nella ricerca:', error);
        setError('Failed to load search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (searchTerm) {
      fetchSearchResults(searchTerm);
    }
  }, [searchTerm, language]);

  return (
    <div>
      <Header /> {/* Includi l'header */}
      <div style={{ padding: '20px' }}>
        <h1>Risultati per "{searchTerm}"</h1>

        {isLoading && <p>Caricamento risultati...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!isLoading && !error && results.length === 0 && <p>Nessun risultato trovato.</p>}

        <ul>
          {results.map((result, index) => (
            <li key={index}>
              {/* Renderizza i risultati di ricerca */}
              <h2>{result.title}</h2>
              <p>{result.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
