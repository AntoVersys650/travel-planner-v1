'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getPlaceSuggestions } from '@/utils/geocoding';

const translations = {
  it: {
    searchPlaceholder: 'Cerca...',
  },
  en: {
    searchPlaceholder: 'Search...',
  },
  es: {
    searchPlaceholder: 'Buscar...',
  },
  fr: {
    searchPlaceholder: 'Rechercher...',
  },
};

const SearchBarHomePage = ({ currentLanguage }: { currentLanguage: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSuggestions = async (input: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await getPlaceSuggestions(input, currentLanguage);
        setSuggestions(results);
      } catch (error) {
        console.error("Errore nel recupero dei suggerimenti:", error);
        setSuggestions([]);
        setError('Failed to load suggestions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (searchTerm) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchTerm, currentLanguage]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const navigateToSearchPage = (term: string) => {
    // Passiamo anche il parametro della lingua se necessario
    router.push(`/search?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(currentLanguage)}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm) {
      navigateToSearchPage(searchTerm);
    } else {
      alert('Inserisci un paese o una città valida');
    }
  };

  const handleSuggestionClick = (suggestion: Place) => {
    setSearchTerm(suggestion.name);
    setSuggestions([]); // Chiude la lista dei suggerimenti
    navigateToSearchPage(suggestion.name);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '1000px', position: 'relative' }}>
      <input
        type="text"
        placeholder={translations[currentLanguage]?.searchPlaceholder}
        value={searchTerm}
        onChange={handleInputChange}
        style={{
          padding: '10px',
          paddingRight: '50px',
          border: '3px solid #00008B',
          borderRadius: '10px',
          flexGrow: 1,
        }}
        autoComplete="off"
      />

      {isLoading && <p>Caricamento suggerimenti...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '45px', // Regola la distanza dal campo di input
            width: '100%',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            listStyleType: 'none',
            padding: '0',
            margin: '0',
            zIndex: 10, // Assicura che sia sopra gli altri elementi
            maxHeight: '200px', // Imposta un'altezza massima
            overflowY: 'auto', // Aggiungi la barra di scorrimento se necessario
          }}
        >
          {suggestions.map((suggestion) => (
            <li
              key={uuidv4()} // Attenzione: l'uso di uuid come key genera un nuovo valore ad ogni render
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom:
                  suggestions.indexOf(suggestion) !== suggestions.length - 1
                    ? '1px solid #ccc'
                    : 'none',
                backgroundColor: '#f8f8f8',
              }}
            >
              {suggestion.name}, {suggestion.country}
            </li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        style={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          border: 'none',
          backgroundColor: 'transparent',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <Image
          src="/magnifying-glass-search-free-png.webp"
          alt="Cerca"
          width={40}
          height={40}
        />
      </button>
    </form>
  );
};

export default SearchBarHomePage;
