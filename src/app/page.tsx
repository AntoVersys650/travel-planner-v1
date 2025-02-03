'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchBarHomePage from '@/components/SearchBarHomePage';
import Image from 'next/image';

const translations = {
  it: {
    title: 'Pianifica la tua prossima Avventura!',
    profile: 'Profilo',
    flights: 'Cerca Voli',
    accommodations: 'Cerca Alloggi',
    rentals: 'Cerca Noleggi',
    home: 'Pagina Iniziale',
    inspiration: '...oppure lasciati ispirare!'
  },
  en: {
    title: 'Plan your next adventure!',
    profile: 'Profile',
    flights: 'Search Flights',
    accommodations: 'Search Accommodations',
    rentals: 'Search Rentals',
    home: 'Home',
    inspiration: '...or get inspired!'
  },
  es: {
    title: '¡Planifica tu próxima aventura!',
    profile: 'Perfil',
    flights: 'Buscar Vuelos',
    accommodations: 'Buscar Alojamientos',
    rentals: 'Buscar Alquileres',
    home: 'Página Principal',
    inspiration: '...or get inspired!'
  },
  fr: {
    title: 'Planifiez votre prochaine aventure!',
    profile: 'Profil',
    flights: 'Rechercher des Vols',
    accommodations: 'Rechercher des Hébergements',
    rentals: 'Rechercher des Locations',
    home: 'Page d\'accueil',
    inspiration: '...or get inspired!'
  }
};

const profileMenuOptions = {
  it: [
    { label: 'Il mio Account', href: '/account' },
    { label: 'Le mie Prenotazioni', href: '/bookings' },
    { label: 'Preferiti', href: '/favorites' },
    { label: 'Diventa Travel Planner', href: '/planner' },
    { label: 'Esci', href: '/logout' }
  ],
  en: [
    { label: 'My Account', href: '/account' },
    { label: 'My Bookings', href: '/bookings' },
    { label: 'Favorites', href: '/favorites' },
    { label: 'Become a Travel Planner', href: '/planner' },
    { label: 'Sign Out', href: '/logout' }
  ],
  es: [
    { label: 'Mi Cuenta', href: '/account' },
    { label: 'Mis Reservas', href: '/bookings' },
    { label: 'Favoritos', href: '/favorites' },
    { label: 'Conviértete en Travel Planner', href: '/planner' },
    { label: 'Cerrar Sesión', href: '/logout' }
  ],
  fr: [
    { label: 'Mon Compte', href: '/account' },
    { label: 'Mes Réservations', href: '/bookings' },
    { label: 'Favoris', href: '/favorites' },
    { label: 'Devenir Travel Planner', href: '/planner' },
    { label: 'Se Déconnecter', href: '/logout' }
  ]
};

const currencyOptions = [
  { label: 'EUR - €', value: 'eur' },
  { label: 'USD - $', value: 'usd' },
  { label: 'GBP - £', value: 'gbp' }
];

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState('it');
  const [bluePortion, setBluePortion] = useState(10);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('eur');

  // Posizioni configurabili tramite codice (non visibili a video)
  const [profileButtonPosition] = useState({ top: 10, right: 20 });
  const [navPosition] = useState({ top: 3, left: 0 });

  const profileRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'it';
    setCurrentLanguage(storedLanguage);
    const handleLanguageChangeEvent = (event: CustomEvent) =>
      setCurrentLanguage(event.detail);
    window.addEventListener('languageChange', handleLanguageChangeEvent);
    return () =>
      window.removeEventListener('languageChange', handleLanguageChangeEvent);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () =>
      document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleBluePortionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setBluePortion(Number(e.target.value));

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
  const toggleCurrencyMenu = () => setIsCurrencyMenuOpen((prev) => !prev);
  const selectCurrency = (value: string) => {
    setSelectedCurrency(value);
    setIsCurrencyMenuOpen(false);
  };

  // Stile uniforme per pulsanti e dropdown
  const menuButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '35px',
    right: 0,
    backgroundColor: '#00008B',
    border: '1px solid white',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    minWidth: '200px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)'
  };

  const navButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Blu: altezza configurabile tramite codice */}
      <div style={{ height: `${window.innerHeight / bluePortion}px`, width: '100%', backgroundColor: '#00008B' }}>
        <input type="number" value={bluePortion} onChange={handleBluePortionChange} style={{ display: 'none' }} />
      </div>

      {/* Contenitore Top: unifica pulsanti sinistra e controlli destra */}
      <div
        style={{
          position: 'fixed',
          top: '3px',
          left: '0',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          zIndex: 20
        }}
      >
        {/* Pulsanti di navigazione in alto a sinistra */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Home: usa l'immagine come pulsante */}
          <Link href="/">
            <Image
              src="/compasswhitehome.png"
              alt="Pagina Iniziale"
              width={20}
              height={20}
              style={{ marginTop: '5px' }}
            />
          </Link>
          <Link href="/flights">
            <button style={navButtonStyle}>{translations[currentLanguage].flights}</button>
          </Link>
          <Link href="/accommodations">
            <button style={navButtonStyle}>{translations[currentLanguage].accommodations}</button>
          </Link>
          <Link href="/rentals">
            <button style={navButtonStyle}>{translations[currentLanguage].rentals}</button>
          </Link>
        </div>

        {/* Controlli in alto a destra */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Pulsante Profilo */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button onClick={toggleProfileMenu} style={menuButtonStyle}>
              {translations[currentLanguage].profile}
            </button>
            {isProfileMenuOpen && (
              <div style={dropdownStyle}>
                {profileMenuOptions[currentLanguage].map((option, index) => (
                  <Link href={option.href} key={index}>
                    <span
                      style={{
                        display: 'block',
                        padding: '5px 0',
                        color: 'white',
                        textDecoration: 'none',
                        borderBottom:
                          index !== profileMenuOptions[currentLanguage].length - 1
                            ? '1px solid rgba(255,255,255,0.3)'
                            : 'none'
                      }}
                    >
                      {option.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Selettore Valuta personalizzato */}
          <div style={{ position: 'relative' }} ref={currencyRef}>
            <button onClick={toggleCurrencyMenu} style={menuButtonStyle}>
              {currencyOptions.find((c) => c.value === selectedCurrency)?.label}
            </button>
            {isCurrencyMenuOpen && (
              <div style={dropdownStyle}>
                {currencyOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => selectCurrency(option.value)}
                    style={{
                      cursor: 'pointer',
                      padding: '5px 0',
                      borderBottom:
                        index !== currencyOptions.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selettore Lingua con dropdown uniforme */}
          <div>
            <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </div>

      {/* Area principale con sfondo bianco */}
      <div style={{ flexGrow: 1, backgroundColor: 'white' }}>
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '100px'
          }}
        >
          <div style={{ textAlign: 'center', color: '#00008B' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
              {translations[currentLanguage].title}
            </h1>
          </div>

          <SearchBarHomePage currentLanguage={currentLanguage} />

          {/* Bottone Ispirazione sotto la barra di ricerca */}
          <div style={{ marginTop: '20px' }}>
            <Link href="/inspiration">
              <button
                style={{
                  ...menuButtonStyle,
                  borderRadius: '5px',
                  color: '#00008B',
                  backgroundColor: 'white',
                  border: '1px solid #00008B'
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
