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

    const languageNames = {
        it: { it: 'Italiano', en: 'Inglese', es: 'Spagnolo', fr: 'Francese' },
        en: { it: 'Italian', en: 'English', es: 'Spanish', fr: 'French' },
        es: { it: 'Italiano', en: 'Inglés', es: 'Español', fr: 'Francés' },
        fr: { it: 'Italien', en: 'Anglais', es: 'Espagnol', fr: 'Français' },
    };

    const toggleOpen = () => setIsOpen((prev) => !prev);

    const handleLanguageChange = (languageCode: string) => {
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
                <img src={languages.find((lang) => lang.code === currentLanguage)?.flag} alt={currentLanguage} style={{ width: '20px', height: '12px' }} />
            </button>
            {isOpen && (
                <div style={dropdownStyle}>
                    {languages.map((lang) => (
                        <div key={lang.code} onClick={() => handleLanguageChange(lang.code)} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', cursor: 'pointer' }}>
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
