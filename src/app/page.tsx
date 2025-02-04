'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBarHomePage from '@/components/SearchBarHomePage';
import Header from 'src/components/Header';
import Image from 'next/image';

const translations = {
  it: {
    title: 'Pianifica la tua prossima Avventura!',
    inspiration: '...oppure lasciati ispirare!'
  },
  en: {
    title: 'Plan your next adventure!',
    inspiration: '...or get inspired!'
  },
  es: {
    title: '¡Planifica tu próxima aventura!',
    inspiration: '...o inspírate!'
  },
  fr: {
    title: 'Planifiez votre prochaine aventure!',
    inspiration: '...ou laissez-vous inspirer!'
  }
};

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState('it');

  useEffect(() => {
    // Inizializza la lingua dallo storage
    const storedLanguage = localStorage.getItem('language') || 'it';
    setCurrentLanguage(storedLanguage);

    // Aggiorna currentLanguage quando viene disparato l'evento personalizzato
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header comune per tutte le pagine */}
      <Header />

      {/* Area principale */}
      <div style={{ flexGrow: 1, backgroundColor: 'white', paddingTop: '100px' }}>
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div style={{ textAlign: 'center', color: '#00008B' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
              {translations[currentLanguage].title}
            </h1>
          </div>

          {/* Passa la lingua corrente al componente della barra di ricerca */}
          <SearchBarHomePage currentLanguage={currentLanguage} />

          {/* Bottone Ispirazione */}
          <div style={{ marginTop: '20px' }}>
            <Link href="/inspiration">
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: '5px',
                  color: '#00008B',
                  backgroundColor: 'white',
                  border: '1px solid #00008B',
                  cursor: 'pointer'
                }}
              >
                {translations[currentLanguage].inspiration}
              </button>
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px 0' }}>
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              style={{ width: '300px', height: '125px', backgroundColor: '#eee', border: '1px solid #ccc' }}
            >
              Banner {i + 1}
            </div>
          ))}
      </footer>
    </div>
  );
}