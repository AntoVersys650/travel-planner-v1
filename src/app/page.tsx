'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchBarHomePage from '@/components/SearchBarHomePage';
import Image from 'next/image';

const translations = {
    it: {
        title: 'Pianifica la tua prossima avventura!',
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
        inspiration: '...o inspírate!'
    },
    fr: {
        title: 'Planifiez votre prochaine aventure!',
        profile: 'Profil',
        flights: 'Rechercher des Vols',
        accommodations: 'Rechercher des Hébergements',
        rentals: 'Rechercher des Locations',
        home: 'Page d\'accueil',
        inspiration: '...ou laissez-vous inspirer!'
    }
};

export default function Home() {
    const [currentLanguage, setCurrentLanguage] = useState('it');
    const [bluePortion, setBluePortion] = useState(10);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [profileButtonPosition, setProfileButtonPosition] = useState({ top: 10, right: 20 });

    useEffect(() => {
        const storedLanguage = localStorage.getItem('language') || 'it';
        setCurrentLanguage(storedLanguage);

        const handleLanguageChangeEvent = (event) => {
            setCurrentLanguage(event.detail);
        };

        window.addEventListener('languageChange', handleLanguageChangeEvent);

        return () => {
            window.removeEventListener('languageChange', handleLanguageChangeEvent);
        };
    }, []);

    const blueHeight = window.innerHeight / bluePortion;

    const handleBluePortionChange = (event) => {
        setBluePortion(Number(event.target.value));
    };

    const handleLanguageChange = (newLanguage) => {
        setCurrentLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const buttonLink = "/some-link";

    const handleProfileClick = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const handleProfileButtonPositionChange = (event) => {
        const { name, value } = event.target;
        setProfileButtonPosition({ ...profileButtonPosition, [name]: parseInt(value) || 0 });
    };

    const profileMenuOptions = {
        it: [
            { label: "Il mio Account", href: "/account" },
            { label: "Le mie Prenotazioni", href: "/bookings" },
            { label: "Preferiti", href: "/favorites" },
            { label: "Diventa Travel Planner", href: "/planner" },
            { label: "Esci", href: "/logout" }
        ],
        en: [
            { label: "My Account", href: "/account" },
            { label: "My Bookings", href: "/bookings" },
            { label: "Favorites", href: "/favorites" },
            { label: "Become a Travel Planner", href: "/planner" },
            { label: "Sign Out", href: "/logout" }
        ],
        es: [
            { label: "Mi Cuenta", href: "/account" },
            { label: "Mis Reservas", href: "/bookings" },
            { label: "Favoritos", href: "/favorites" },
            { label: "Conviértete en Travel Planner", href: "/planner" },
            { label: "Cerrar Sesión", href: "/logout" }
        ],
        fr: [
            { label: "Mon Compte", href: "/account" },
            { label: "Mes Réservations", href: "/bookings" },
            { label: "Favoris", href: "/favorites" },
            { label: "Devenir Travel Planner", href: "/planner" },
            { label: "Se Déconnecter", href: "/logout" }
        ],
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ height: blueHeight, width: '100%', backgroundColor: '#00008B', position: 'relative' }}>
                <input
                    type="number"
                    id="bluePortion"
                    value={bluePortion}
                    onChange={handleBluePortionChange}
                    min="1"
                    step="1"
                    style={{ display: 'none' }}
                />
            </div>

            <main style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    position: 'fixed',
                    top: 3,
                    left: 0,
                    width: '70%',
                    padding: '25px',
                    display: 'flex',
                    fontWeight: 'bold',
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link href="/">
                            <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'white', marginTop: '8px' }}>
                                <img src="/compasswhitehome.png" alt="Pagina Iniziale" style={{ width: '20px', height: '20px' }} />
                            </button>
                        </Link>
                        <Link href="/flights">
                            <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
                                {translations[currentLanguage].flights}
                            </button>
                        </Link>
                        <Link href="/accommodations">
                            <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
                                {translations[currentLanguage].accommodations}
                            </button>
                        </Link>
                        <Link href="/rentals">
                            <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
                                {translations[currentLanguage].rentals}
                            </button>
                        </Link>
                    </div>
                </div>

                <div style={{
                    position: 'fixed',
                    top: profileButtonPosition.top,
                    right: profileButtonPosition.right,
                    zIndex: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '0px',
                    borderRadius: '0px'
                }}>
                    <button
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                        onClick={handleProfileClick}
                    >
                        {translations[currentLanguage].profile}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0px' }}>
                    </div>
                </div>
{isProfileMenuOpen && (
    <div style={{
        position: 'fixed',
        top: profileButtonPosition.top + 40, // Position below the button
        right: profileButtonPosition.right,
        zIndex: 11,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px'
    }}>
        {profileMenuOptions[currentLanguage].map((option, index) => (
            <Link href={option.href} key={index} style={{ display: 'block', padding: '5px', cursor: 'pointer', color: 'white', textDecoration: 'none' }}>
                <div>{option.label}</div>
            </Link>
        ))}
    </div>
)}

<div style={{ position: 'fixed', top: 28, right: 80, padding: '10px', zIndex: 10, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
    <select style={{ backgroundColor: 'transparent', border: '0px solid white', color: 'white', padding: '5px', borderRadius: '5px' }}>
        <option value="eur">EUR - €</option>
        <option value="usd">USD - $</option>
        <option value="gbp">GBP - £</option>
    </select>
</div>

<div style={{ position: 'fixed', top: 0, right: 0, padding: '10px', zIndex: 10, display: 'flex', alignItems: 'center' }}>
    <LanguageSwitcher onLanguageChange={handleLanguageChange} currentLanguage={currentLanguage} />
</div>

<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'calc(100vh / 12)' }}>
    <h1 style={{
        color: '#00008B',
        fontWeight: 'bold',
        fontSize: '2.5rem',
        marginBottom: '20px',
        textAlign: 'center'
    }}>
        {translations[currentLanguage].title.charAt(0).toUpperCase() + translations[currentLanguage].title.slice(1).replace('avventura', 'Avventura')}
    </h1>

                    <SearchBarHomePage currentLanguage={currentLanguage} />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <p style={{ color: '#00008B' }}>{translations[currentLanguage].inspiration}</p>
                        <Link href={buttonLink} style={{ marginLeft: '10px' }}>
                            <Image src="/compassbluebutton.png" alt="Button" width={40} height={40} />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: 'rgba(0, 0, 0.5)',
                padding: '20px',
                textAlign: 'center',
                color: 'white',
                marginTop: 'auto'
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
                </div>
            </footer> 
        </div> 
    ); 
}