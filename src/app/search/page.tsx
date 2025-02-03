'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header'; // Assumi di avere un Header già definito
import Image from 'next/image';

// Oggetto con le traduzioni per le varie lingue
const translations: Record<string, Record<string, string>> = {
  it: {
    searchPlaceholder: 'Cerca...',
    travelPlanButton: 'Visualizza Travel Plan',
    filtersTitle: 'Filtri',
    fromLabel: 'Da',
    toLabel: 'A',
    numberOfPeople: 'Numero persone',
    otherOption: 'Altro',
    otherPlaceholder: 'Inserisci numero maggiore di 10',
    searchOnly: 'Ricerca solo',
    flights: 'Voli',
    accommodations: 'Alloggi',
    rentals: 'Noleggi',
    resultsTitle: 'Risultati',
  },
  en: {
    searchPlaceholder: 'Search...',
    travelPlanButton: 'View Travel Plan',
    filtersTitle: 'Filters',
    fromLabel: 'From',
    toLabel: 'To',
    numberOfPeople: 'Number of People',
    otherOption: 'Other',
    otherPlaceholder: 'Enter a number greater than 10',
    searchOnly: 'Search Only',
    flights: 'Flights',
    accommodations: 'Accommodations',
    rentals: 'Rentals',
    resultsTitle: 'Results',
  },
  // Aggiungi altre lingue se necessario...
};

// Componente fittizio per Google Earth (in questo caso utilizziamo un iframe con Google Maps come placeholder)
interface GoogleEarthProps {
  location: string;
}
const GoogleEarth = ({ location }: GoogleEarthProps) => {
  // Per centrare la mappa sul luogo cercato, qui usiamo un URL di Google Maps
  // (in un'integrazione reale potresti usare la Google Earth API o una libreria di mapping)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
    location
  )}`;

  return (
    <iframe
      title="Google Earth"
      src={mapUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
    />
  );
};

interface SearchPageProps {
  currentLanguage: string;
}

const SearchPage = ({ currentLanguage }: SearchPageProps) => {
  // Ottieni il parametro di query "q" dalla URL (es. /search?q=Cile)
  const searchParams = useSearchParams();
  const queryLocation = searchParams.get('q') || '';

  // Stato per i filtri (esempio minimo)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [numPeople, setNumPeople] = useState('1');
  const [otherPeople, setOtherPeople] = useState('');
  const [onlyFlights, setOnlyFlights] = useState(false);
  const [onlyAccommodations, setOnlyAccommodations] = useState(false);
  const [onlyRentals, setOnlyRentals] = useState(false);

  // (Eventuali effetti per effettuare chiamate API per i risultati possono essere aggiunti qui)

  return (
    <div>
      {/* Header comune */}
      <Header currentLanguage={currentLanguage} />

      {/* Sezione Google Earth (o mappa) */}
      <section style={{ width: '100%', height: '500px' }}>
        <GoogleEarth location={queryLocation} />
      </section>

      {/* Pulsante Travel Plan */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {translations[currentLanguage]?.travelPlanButton}
        </button>
      </div>

      {/* Sezioni filtri e lista risultati */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
        {/* Sezione Filtri */}
        <div style={{ flex: '1', border: '1px solid #ccc', padding: '20px' }}>
          <h3>{translations[currentLanguage]?.filtersTitle}</h3>

          <div style={{ marginBottom: '10px' }}>
            <label>
              {translations[currentLanguage]?.fromLabel}:
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              {translations[currentLanguage]?.toLabel}:
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              {translations[currentLanguage]?.numberOfPeople}:
              <select
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                style={{ marginLeft: '10px' }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
                <option value="other">{translations[currentLanguage]?.otherOption}</option>
              </select>
            </label>
            {numPeople === 'other' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="number"
                  placeholder={translations[currentLanguage]?.otherPlaceholder}
                  value={otherPeople}
                  onChange={(e) => setOtherPeople(e.target.value)}
                  min={11}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <p>{translations[currentLanguage]?.searchOnly}:</p>
            <div>
              <input
                type="checkbox"
                id="voli"
                checked={onlyFlights}
                onChange={(e) => setOnlyFlights(e.target.checked)}
              />
              <label htmlFor="voli" style={{ marginLeft: '5px' }}>
                {translations[currentLanguage]?.flights}
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="alloggi"
                checked={onlyAccommodations}
                onChange={(e) => setOnlyAccommodations(e.target.checked)}
              />
              <label htmlFor="alloggi" style={{ marginLeft: '5px' }}>
                {translations[currentLanguage]?.accommodations}
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="noleggi"
                checked={onlyRentals}
                onChange={(e) => setOnlyRentals(e.target.checked)}
              />
              <label htmlFor="noleggi" style={{ marginLeft: '5px' }}>
                {translations[currentLanguage]?.rentals}
              </label>
            </div>
          </div>
        </div>

        {/* Sezione Lista Risultati */}
        <div style={{ flex: '2', border: '1px solid #ccc', padding: '20px' }}>
          <h3>{translations[currentLanguage]?.resultsTitle}</h3>
          {/* Qui andranno gli elementi richiamati dall'API */}
          <p>Lista degli elementi da API...</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
