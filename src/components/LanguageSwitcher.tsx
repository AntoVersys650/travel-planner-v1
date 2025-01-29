// components/LanguageSwitcher.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('it');
  const selectRef = useRef(null);

  const languages = [
    { code: 'it', name: 'Italiano', flag: '/IT Flag mini.png' },
    { code: 'en', name: 'Inglese', flag: '/UK Flag mini.png' },
    { code: 'es', name: 'Spagnolo', flag: '/ES Flag mini.png' },
    { code: 'fr', name: 'Francese', flag: '/FR Flag mini.png' },
  ];

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language.code);
    setIsOpen(false);
    console.log('Lingua selezionata:', language.code);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    console.log('Menu aperto:', isOpen); // Debug: Stato del menu
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current &&!selectRef.current.contains(event.target)) {
        setIsOpen(false);
        console.log('Cliccato fuori dal menu, menu chiuso'); // Debug: Click esterno
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  },);

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage);

  console.log('Lingua corrente:', currentLanguage); // Debug: Lingua corrente
  console.log('Dati lingua selezionata:', selectedLanguage); // Debug: Dati lingua selezionata
  console.log('Percorso immagine:', selectedLanguage?.flag); // Debug: Percorso immagine

  return (
    <div className="language-switcher" ref={selectRef}>
      <div className="selected-language" onClick={toggleOpen}>
        <img src={selectedLanguage?.flag} alt={selectedLanguage?.name} /> {/* Usa optional chaining */}
      </div>
      {isOpen && (
        <ul className="language-options">
          {languages.map((language) => (
            <li key={language.code} onClick={() => handleLanguageChange(language)}>
              <img src={language.flag} alt={language.name} />
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        /*... (stili invariati)... */
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;