'use client'; // Se usi l'app directory

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Importa useSearchParams
import { getPlaceSuggestions } from '@/utils/geonames'; // Se usi la funzione per i suggerimenti
import Image from 'next/image';
import { format } from 'date-fns'; // Per la formattazione delle date
import { it, en, es, fr } from 'date-fns/locale'; // Importa le localizzazioni

const SearchPage = ({ currentLanguage }) => { // Passa currentLanguage come prop
    const router = useRouter();
    const searchParams = useSearchParams(); // Ottieni i parametri di ricerca dall'URL

    const [searchTerm, setSearchTerm] = useState(''); // Termine di ricerca
    const [fromDate, setFromDate] = useState(''); // Data "Da"
    const [toDate, setToDate] = useState(''); // Data "A"
    const [alloggi, setAlloggi] = useState(false); // Checkbox alloggi
    const [noleggi, setNoleggi] = useState(false); // Checkbox noleggi
    const [voli, setVoli] = useState(false); // Checkbox voli
    const [results, setResults] = useState([]); // Risultati della ricerca
    const [isLoading, setIsLoading] = useState(false); // Stato di caricamento

    const locale = currentLanguage === 'it' ? it : currentLanguage === 'en' ? en : currentLanguage === 'es' ? es : fr; // Definisci la localizzazione in base a currentLanguage

useEffect(() => {
    const searchTermFromUrl = searchParams.get('q'); // Ottieni il valore del parametro 'q'
    if (searchTermFromUrl) {
        setSearchTerm(searchTermFromUrl); // Imposta il termine di ricerca
    }
}, [searchParams]);

const handleSearch = async () => {
    setIsLoading(true);
    try {
        // Qui puoi integrare la logica per filtrare i risultati in base ai criteri selezionati
        // (date, checkbox, ecc.) e chiamare l'API di ricerca.
        console.log('Eseguo la ricerca con i seguenti filtri:', {
            searchTerm,
            fromDate,
            toDate,
            alloggi,
            noleggi,
            voli,
        });
        // Esempio di chiamata API (da adattare alla tua API):
        // const response = await fetch('/api/search', {
        //     method: 'POST',
        //     body: JSON.stringify({ searchTerm, fromDate, toDate, alloggi, noleggi, voli }),
        // });
        // const data = await response.json();
        // setResults(data);
    } catch (error) {
        console.error('Errore durante la ricerca:', error);
    } finally {
        setIsLoading(false);
    }
};
return (
    <div>
        {/* Header (riutilizza il componente Header della home page) */}
        <Header currentLanguage={currentLanguage} />

        {/* Prima sezione (sotto l'header) */}
        <div style={{ padding: '20px' }}>
            {/* Contenuto della prima sezione */}
            <h1>Risultati della ricerca per: {searchTerm}</h1>
        </div>

        {/* Seconda sezione (filtri a sinistra) */}
        <div style={{ display: 'flex' }}>
            <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #ccc' }}>
                <h2>Filtri di ricerca</h2>

                {/* Filtri data */}
                <label htmlFor="fromDate">Da:</label>
                <input type="date" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />

                <label htmlFor="toDate">A:</label>
                <input type="date" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} />

                {/* Checkbox */}
                <div>
                    <input type="checkbox" id="alloggi" checked={alloggi} onChange={(e) => setAlloggi(e.target.checked)} />
                    <label htmlFor="alloggi">Alloggi</label>
                </div>
                <div>
                    <input type="checkbox" id="noleggi" checked={noleggi} onChange={(e) => setNoleggi(e.target.checked)} />
                    <label htmlFor="noleggi">Noleggi</label>
                </div>
                <div>
                    <input type="checkbox" id="voli" checked={voli} onChange={(e) => setVoli(e.target.checked)} />
                    <label htmlFor="voli">Voli</label>
                </div>

                {/* Pulsante di ricerca */}
                <button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? 'Ricerca in corso...' : 'Cerca'}
                </button>
            </div>

            {/* Terza sezione (risultati a destra) */}
            <div style={{ flexGrow: 1, padding: '20px' }}>
                <h2>Strutture trovate</h2>
                {isLoading && <p>Caricamento risultati...</p>}
                {!isLoading && results.length === 0 && <p>Nessun risultato trovato.</p>}
                {!isLoading && results.length > 0 && (
                    <ul>
                        {results.map((result) => (
                            <li key={result.id}> {/* Usa un ID univoco se disponibile */}
                                {/* Mostra i dettagli della struttura */}
                                {result.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
);