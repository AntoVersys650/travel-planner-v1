'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// Se usi alias configurato, ad esempio con "@", usa:
import Header from '@/components/Header';
// Altrimenti, se il file Header.tsx si trova in "src/app/components", potresti dover usare:
// import Header from '../components/Header';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q');
  const language = searchParams.get('lang') || 'en';

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async (term: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // Assicurati di avere un endpoint API oppure usa un mock
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
      <Header /> {/* Include l'header */}
      <div style={{ padding: '20px' }}>
        <h1>Risultati per "{searchTerm}"</h1>

        {isLoading && <p>Caricamento risultati...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && results.length === 0 && <p>Nessun risultato trovato.</p>}

        <ul>
          {results.map((result, index) => (
            <li key={index}>
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
