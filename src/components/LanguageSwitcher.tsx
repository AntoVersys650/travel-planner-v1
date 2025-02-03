'use client';

import { useState, useRef, useEffect } from 'react';

interface LanguageSwitcherProps {
    currentLanguage: string;
    onLanguageChange: (lang: string) => void;
}

const LanguageSwitcher = ({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'it', flag: '/IT Flag mini.png' },
        { code: 'en', flag: '/UK Flag mini.png' },
        { code: 'es', flag: '/ES Flag mini.png' },
        { code: 'fr', flag: '/FR Flag mini.png' },
    ];

    const languageNames: { [key: string]: { [key: string]: string } } = {
        it: { it: 'Italiano', en: 'Inglese', es: 'Spagnolo', fr: 'Francese' },
        en: { it: 'Italian', en: 'English', es: 'Spanish', fr: 'French' },
        es: { it: 'Italiano', en: 'Inglés', es: 'Español', fr: 'Francés' },
        fr: { it: 'Italien', en: 'Anglais', es: 'Espagnol', fr: 'Français' },
    };

    const languageLabels: { [key: string]: string } = {
        it: 'Lingua',
        en: 'Language',
        es: 'Idioma',
        fr: 'Langue'
    };

    const toggleOpen = () => setIsOpen((prev) => !prev);

    const handleLanguageChangeInternal = (languageCode: string) => {
        setIsOpen(false);
        localStorage.setItem('language', languageCode);
        onLanguageChange(languageCode);
        const event = new CustomEvent('languageChange', { detail: languageCode });
        window.dispatchEvent(event);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Use optional chaining and a fallback to avoid undefined errors
       const selectedLanguage = languages.find((lang) => lang.code === currentLanguage) || languages[0];
    // Safely get the language label, defaulting to a string if not found
    const currentLanguageLabel = languageLabels[currentLanguage] || "Language"; // Or any suitable default

    // Define buttonStyle *BEFORE* using it
    const buttonStyle = {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        padding: '5px 10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center'
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
        minWidth: '120px',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.2)'
    };

    return ( 
        <div className="language-switcher" ref={selectRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button onClick={toggleOpen} style={buttonStyle}>
                <span style={{ marginRight: '5px' }}>{currentLanguageLabel}</span>
                <img
                    src={selectedLanguage?.flag}
                    alt={selectedLanguage?.code}
                    style={{ width: '20px', height: '12px' }}
                />

            </button>
            {isOpen && (
                <div style={dropdownStyle}>
                    {languages.map((lang) => (
                        <div
                            key={lang.code}
                            onClick={() => handleLanguageChangeInternal(lang.code)}
                            style={{ display: 'flex', alignItems: 'center', padding: '5px 0', cursor: 'pointer' }}
                        >
                            <img
                                src={lang.flag}
                                alt={lang.code}
                                style={{ width: '20px', height: '12px', marginRight: '5px' }}
                            />
                            <span>{languageNames?.[currentLanguage]?.[lang.code] || ''}</span> {/* Optional chaining here */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;