// components/LanguageSwitcher.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

const LanguageSwitcher = ({ onLanguageChange, currentLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const languages = [
    { code: 'it', name: 'Italiano', flag: '/IT Flag mini.png' },
    { code: 'en', name: 'Inglese', flag: '/UK Flag mini.png' },
    { code: 'es', name: 'Spagnolo', flag: '/ES Flag mini.png' },
    { code: 'fr', name: 'Francese', flag: '/FR Flag mini.png' },
  ];

  const translations = {
    it: { title: 'Lingua' },
    en: { title: 'Language' },
    es: { title: 'Idioma' },
    fr: { title: 'Langue' },
  };

  const handleLanguageChangeInternal = (language) => {
    setIsOpen(false);
    localStorage.setItem('language', language.code);
    onLanguageChange(language.code);
    const event = new CustomEvent('languageChange', { detail: language.code });
    window.dispatchEvent(event);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => { 
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []); 

  const currentTranslation = translations[currentLanguage] || translations['it'];
  const selectedLanguage = languages.find(lang => lang.code === currentLanguage);

  return (
    <>
      <div className="language-switcher" ref={selectRef}>
        <div className="language-title" style={{ color: 'white', fontWeight: 'bold' }}>
          {currentTranslation.title}
        </div>
        <div className="selected-language" onClick={toggleOpen}>
          <img src={selectedLanguage?.flag} alt={selectedLanguage?.name} />
        </div>
        {isOpen && (
          <ul className="language-options">
            {languages.map((language) => (
              <li key={language.code} onClick={() => handleLanguageChangeInternal(language)}>
                <img src={language.flag} alt={language.name} />
              </li>
            ))}
          </ul>
        )}

        <style jsx>
          {`
            .language-switcher {
              position: relative;
              display: inline-block;
              margin: 10px;
            }
            .selected-language {
              display: flex;
              align-items: center;
              padding: 5px 10px;
              border: 0px solid #ccc;
              border-radius: 0px;
              cursor: pointer;
              background-size: 0px 0px;
              justify-content: right;
            }
            .selected-language img {
              width: 20px;
              height: 12px;
              margin-right: 5px;
            }
            .language-options {
              position: absolute;
              top: 100%;
              left: 0;
              list-style: none;
              margin: 0;
              padding: 0;
              border: 0px solid white;
              border-radius: 5px;
              background-color: transparent;
              z-index: 1;
              box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            }
            .language-options li {
              display: flex;
              align-items: center;
              padding: 5px 10px;
              cursor: pointer;
              margin-bottom: 5px;
            }
            .language-options li:hover {
              background-color: #f0f0f0;
            }
            .language-options li img {
              width: 20px;
              height: 12px;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default LanguageSwitcher;