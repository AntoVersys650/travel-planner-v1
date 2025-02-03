'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getPlaceSuggestions } from '@/utils/geonames';

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

const SearchBarHomePage = ({ currentLanguage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]); // Ora suggestions è un array di oggetti
    const [isLoading, setIsLoading] = useState(false); // Stato per il caricamento
    const router = useRouter();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const fetchSuggestions = async (input: string) => {
            setIsLoading(true); // Imposta isLoading a true durante la chiamata
            try {
                const results = await getPlaceSuggestions(input);
                setSuggestions(results);
            } finally {
                setIsLoading(false); // Imposta isLoading a false dopo la chiamata (successo o errore)
            }
        };

        if (searchTerm) {
            timeoutId = setTimeout(() => {
                fetchSuggestions(searchTerm);
            }, 300); // Debouncing
        } else {
            setSuggestions([]);
        }

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (searchTerm) { // Verifica se searchTerm non è vuoto
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        } else {
            alert('Inserisci un paese o una città valida');
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.name); // Usa il nome dal suggerimento
        setSuggestions([]);
        router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: 'flex',
            width: '1000px',
            position: 'relative',
        }}>
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

            {isLoading && <p>Caricamento suggerimenti...</p>} {/* Mostra indicatore di caricamento */}

            {suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '45px',
                    width: '100%',
                    border: '1px solid #ccc',
                    backgroundColor: 'white',
                    listStyleType: 'none',
                    padding: '0',
                    margin: '0',
                    zIndex: 10,
                }}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: index !== suggestions.length - 1 ? '1px solid #ccc' : 'none',
                                backgroundColor: '#f8f8f8'
                            }}
                        >
                            {suggestion.name}, {suggestion.country} {/* Mostra sia città che paese */}
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