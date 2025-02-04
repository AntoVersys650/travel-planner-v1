'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
  },es: {
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

  // Aggiungi altre lingue se necessario
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

  // Utilizza il fallback sulla lingua: se currentLanguage non esiste in translations, usa 'it'
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
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        zIndex: 20,
        backgroundColor: '#00008B',
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
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
          <button style={menuButtonStyle}>{langTranslations.flights}</button>
        </Link>
        <Link href="/accommodations">
          <button style={menuButtonStyle}>{langTranslations.accommodations}</button>
        </Link>
        <Link href="/rentals">
          <button style={menuButtonStyle}>{langTranslations.rentals}</button>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button onClick={toggleProfileMenu} style={menuButtonStyle}>
            {langTranslations.profile}
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
    </header>
  );
}