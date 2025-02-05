'use client';

import { useState, useRef, useEffect } from 'react';

interface LanguageSwitcherProps {
  onLanguageChange: (lang: string) => void;
}

const LanguageSwitcher = ({ onLanguageChange }: LanguageSwitcherProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('it'); // Stato locale per la lingua
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'it', flag: '/IT Flag mini.png' },
    { code: 'en', flag: '/UK Flag mini.png' },
    { code: 'es', flag: '/ES Flag mini.png' },
    { code: 'fr', flag: '/FR Flag mini.png' },
  ];

  const languageNames = {
    it: { it: 'Italiano', en: 'Inglese', es: 'Spagnolo', fr: 'Francese' },
    en: { it: 'Italian', en: 'English', es: 'Spanish', fr: 'French' },
    es: { it: 'Italiano', en: 'Inglés', es: 'Español', fr: 'Francés' },
    fr: { it: 'Italien', en: 'Anglais', es: 'Espagnol', fr: 'Français' },
  };

  // Funzione per aprire/chiudere il menu a tendina
  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Gestione del cambio di lingua
  const handleLanguageChange = (languageCode: string) => {
    setIsOpen(false); // Chiude il menu a tendina
    setCurrentLanguage(languageCode); // Aggiorna lo stato locale
    localStorage.setItem('language', languageCode); // Salva la lingua nel localStorage
    onLanguageChange(languageCode); // Notifica il cambio di lingua al componente genitore

    // Evento personalizzato per il cambiamento di lingua
    const event = new CustomEvent('languageChange', { detail: languageCode });
    window.dispatchEvent(event); // Dispara l'evento globale per altri componenti
  };

  // Effetto per chiudere il menu a tendina quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Effetto per inizializzare la lingua dal localStorage
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'it';
    setCurrentLanguage(storedLanguage); // Imposta la lingua salvata
  }, []);

  // Stile del pulsante per selezionare la lingua
  const buttonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  };

  // Stile del dropdown con le opzioni della lingua
  const dropdownStyle = {
    position: 'absolute' as const,
    top: '35px',
    right: 0,
    backgroundColor: '#00008B',
    border: '1px solid white',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    minWidth: '120px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
  };

  return (
    <div ref={selectRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={toggleOpen} style={buttonStyle}>
        <span style={{ marginRight: '5px' }}>{languageNames[currentLanguage]?.[currentLanguage]}</span>
        <img
          src={languages.find((lang) => lang.code === currentLanguage)?.flag}
          alt={currentLanguage}
          style={{ width: '20px', height: '12px' }}
        />
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{ display: 'flex', alignItems: 'center', padding: '5px 0', cursor: 'pointer' }}
            >
              <img src={lang.flag} alt={lang.code} style={{ width: '20px', height: '12px', marginRight: '5px' }} />
              <span>{languageNames[currentLanguage]?.[lang.code]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
