// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchBarHomePage from '@/components/SearchBarHomePage';

const translations = {
  it: {
    title: 'Pianifica la tua prossima avventura!',
    profile: 'Profilo',
    flights: 'Cerca Voli',
    accommodations: 'Cerca Alloggi',
    rentals: 'Cerca Noleggi',
    home: 'Pagina Iniziale'
  },
  en: {
    title: 'Plan your next adventure!',
    profile: 'Profile',
    flights: 'Search Flights',
    accommodations: 'Search Accommodations',
    rentals: 'Search Rentals',
    home: 'Home'
  },
  es: {
    title: '¡Planifica tu próxima aventura!',
    profile: 'Perfil',
    flights: 'Buscar Vuelos',
    accommodations: 'Buscar Alojamientos',
    rentals: 'Buscar Alquileres',
    home: 'Página Principal'
  },
  fr: {
    title: 'Planifiez votre prochaine aventure!',
    profile: 'Profil',
    flights: 'Rechercher des Vols',
    accommodations: 'Rechercher des Hébergements',
    rentals: 'Rechercher des Locations',
    home: 'Page d\'accueil'
  }
};

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState('it');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }

    const handleLanguageChangeEvent = (event) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChangeEvent);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChangeEvent);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{
        backgroundImage: `url('/background3.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

        {/* Nuova sezione in alto a sinistra */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'auto',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          height: '50px',
          gap: '20px'
        }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/homepageicon.png" alt="Pagina Iniziale" style={{ width: '20px', height: '20px' }} />
          </a>
          <a href="/profile" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{translations[currentLanguage].profile}</a>
          <a href="/flights" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{translations[currentLanguage].flights}</a>
          <a href="/accommodations" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{translations[currentLanguage].accommodations}</a>
          <a href="/rentals" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{translations[currentLanguage].rentals}</a>
        </div>

        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '50px' }}>
          <LanguageSwitcher />
        </div>
        <h1 style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '2.5rem',
          textTransform: 'uppercase',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {translations[currentLanguage].title}
        </h1>
        <SearchBarHomePage />
      </main>
      <footer style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={{ width: '300px', height: '125px', backgroundColor: '#eee', border: '1px solid #ccc' }}>
            Banner 1
          </div>
          <div style={{ width: '300px', height: '125px', backgroundColor: '#eee', border: '1px solid #ccc' }}>
            Banner 2
          </div>
          <div style={{ width: '300px', height: '125px', backgroundColor: '#eee', border: '1px solid #ccc' }}>
            Banner 3
          </div>
          <div style={{ width: '300px', height: '125px', backgroundColor: '#eee', border: '1px solid #ccc' }}>
            Banner 4
          </div>
          <div style={{ width: '300px', height: '125px', backgroundColor: '#eee', border: '1px solid #ccc' }}>
            Banner 5
          </div>
        </div>
      </footer>
    </div>
  );
}