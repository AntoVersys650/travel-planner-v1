'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '../components/LanguageSwitcher';

const translations = {
  it: {
    profile: 'Profilo',
    flights: 'Cerca Voli',
    accommodations: 'Cerca Alloggi',
    rentals: 'Cerca Noleggi',
    home: 'Pagina Iniziale',
  },
  en: {
    profile: 'Profile',
    flights: 'Search Flights',
    accommodations: 'Search Accommodations',
    rentals: 'Search Rentals',
    home: 'Home',
  },
  es: {
    profile: 'Perfil',
    flights: 'Buscar Vuelos',
    accommodations: 'Buscar Alojamientos',
    rentals: 'Buscar Alquileres',
    home: 'Página Principal',
  },
  fr: {
    profile: 'Profil',
    flights: 'Rechercher des Vols',
    accommodations: 'Rechercher des Hébergements',
    rentals: 'Rechercher des Locations',
    home: 'Page d\'accueil',
  },
};

const profileMenuOptions = {
  it: [
    { label: 'Il mio Account', href: '/account' },
    { label: 'Le mie Prenotazioni', href: '/bookings' },
    { label: 'Preferiti', href: '/favorites' },
    { label: 'Diventa Travel Planner', href: '/planner' },
    { label: 'Esci', href: '/logout' },
  ],
  en: [
    { label: 'My Account', href: '/account' },
    { label: 'My Bookings', href: '/bookings' },
    { label: 'Favorites', href: '/favorites' },
    { label: 'Become a Travel Planner', href: '/planner' },
    { label: 'Sign Out', href: '/logout' },
  ],
  es: [
    { label: 'Mi Cuenta', href: '/account' },
    { label: 'Mis Reservas', href: '/bookings' },
    { label: 'Favoritos', href: '/favorites' },
    { label: 'Conviértete en Travel Planner', href: '/planner' },
    { label: 'Cerrar Sesión', href: '/logout' },
  ],
  fr: [
    { label: 'Mon Compte', href: '/account' },
    { label: 'Mes Réservations', href: '/bookings' },
    { label: 'Favoris', href: '/favorites' },
    { label: 'Devenir Travel Planner', href: '/planner' },
    { label: 'Se Déconnecter', href: '/logout' },
  ],
};

const currencyOptions = [
  { label: 'EUR - €', value: 'eur' },
  { label: 'USD - $', value: 'usd' },
  { label: 'GBP - £', value: 'gbp' },
];

export default function Header() {
  const [currentLanguage, setCurrentLanguage] = useState('it');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('eur');

  const profileRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Dimensioni configurabili per l'immagine del profilo
  const profileIconWidth = 35;  // Modifica questo valore per la larghezza
  const profileIconHeight = 35; // Modifica questo valore per l'altezza

  // Variabile per configurare il margine superiore dell'immagine del profilo (puoi regolare questo valore per spostarla in verticale)
  const profileImageMarginTop = '-50px';

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'it';
    setCurrentLanguage(storedLanguage);

    const handleLanguageChangeEvent = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };
    window.addEventListener('languageChange', handleLanguageChangeEvent);
    return () => window.removeEventListener('languageChange', handleLanguageChangeEvent);
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
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
  const toggleCurrencyMenu = () => setIsCurrencyMenuOpen((prev) => !prev);
  const selectCurrency = (value: string) => {
    setSelectedCurrency(value);
    setIsCurrencyMenuOpen(false);
  };

  // Fallback: se currentLanguage non esiste in translations, usa 'it'
  const langTranslations = translations[currentLanguage] || translations.it;

  const menuButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
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
    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
    zIndex: 1000,
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: '#00008B',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
      }}
    >
      {/* Prima riga: Logo */}
      <div style={{ textAlign: 'center', marginBottom: '10px', marginLeft: '10px' }}>
        <Link href="/">
          <Image
            src="/logo/ytplogo.png"
            alt="YTP Logo"
            width={250}
            height={50}
            priority
          />
        </Link>
      </div>

      {/* Seconda riga: Navigazione e menu a destra */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Navigazione a sinistra */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/flights">
            <button style={menuButtonStyle}>{langTranslations.flights}</button>
          </Link>
          <Link href="/accommodations">
            <button style={menuButtonStyle}>{langTranslations.accommodations}</button>
          </Link>
          <Link href="/rentals">
            <button style={menuButtonStyle}>{langTranslations.rentals}</button>
          </Link>
        </div>

        {/* Menu a destra: Immagine del profilo (con posizione configurabile) e, sotto, i dropdown di valuta e lingua */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          {/* Immagine del profilo */}
          <div style={{ position: 'relative', marginTop: profileImageMarginTop }} ref={profileRef}>
            <button
              onClick={toggleProfileMenu}
              style={{ ...menuButtonStyle, padding: 0, backgroundColor: 'transparent', border: 'none' }}
            >
              <Image
                src="/logo/profile.png"
                alt="Profile"
                width={profileIconWidth}
                height={profileIconHeight}
              />
            </button>
            {isProfileMenuOpen && (
              <div style={dropdownStyle}>
                {profileMenuOptions[currentLanguage]?.map((option, index) => (
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
                            : 'none',
                      }}
                    >
                      {option.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Riga con i dropdown di valuta e lingua */}
          <div style={{ display: 'flex', gap: '10px' }}>
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
                          index !== currencyOptions.length - 1
                            ? '1px solid rgba(255,255,255,0.3)'
                            : 'none',
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
          </div>
        </div>
      </div>
    </header>
  );
}
