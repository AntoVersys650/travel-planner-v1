'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBarHomePage from './components/SearchBarHomePage';
import Header from './components/Header';
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

        // Aggiorna currentLanguage quando viene attivato l'evento personalizzato
        const handleLanguageChange = (event: CustomEvent) => {
            setCurrentLanguage(event.detail);
        };

        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Video di sfondo */}
            <video
                autoPlay
                loop
                muted
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -2,
                }}
            >
                <source src="/YTP_01.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay bianco trasparente che copre l'intero schermo */}
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(216, 255, 255, 0.40)',
                    zIndex: -1,
                }}
            />

            {/* Header comune per tutte le pagine */}
            <Header />

            {/* Area principale */}
            <div style={{ flexGrow: 1, paddingTop: '90px', width: '100%' }}>
                <main
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',
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
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                                    color: '#00008B',
                                    backgroundColor: '#fff',
                                    border: '1px solid #00008B',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem', // Increased font size
                                    transition: 'background-color 0.3s ease, transform 0.2s ease', // Added smooth transition
                                }}
                                // Added hover effect
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f0f0'; // Slightly lighter background on hover
                                    e.currentTarget.style.transform = 'scale(1.05)'; // Slight scale on hover
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff'; // Restore original background
                                    e.currentTarget.style.transform = 'scale(1)'; // Restore original scale
                                }}
                            >
                                {translations[currentLanguage].inspiration}
                            </button>
                        </Link>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
                {Array(3)
                    .fill(null)
                    .map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '90%',
                                maxWidth: '300px',
                                height: '125px',
                                backgroundColor: '#eee',
                                border: '1px solid #ccc',
                                margin: '10px 0',
                                borderRadius: '8px', // Added border radius for banners
                                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', // Added slight shadow
                            }}
                        >
                            Banner {i + 1}
                        </div>
                    ))}
            </footer>
        </div>
    );
}
