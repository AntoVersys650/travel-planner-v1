'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, Globe, ChevronDown } from 'lucide-react';

// Utility function (esempio di implementazione di cn)
const cn = (...args: any[]): string => {
    return args.filter(Boolean).join(' ');
};

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

const languageOptions = [
    { label: 'IT', value: 'it' },
    { label: 'EN', value: 'en' },
    { label: 'ES', value: 'es' },
    { label: 'FR', value: 'fr' },
];

interface HeaderProps {
    /**
     * Altezza minima del container interno dell'header.
     * Controlla lo spazio verticale della barra principale.
     * Default: '90px'.
     */
     minHeight?: string;
}

const Header: React.FC<HeaderProps> = ({ minHeight = '90px' }) => {
    const [currentLanguage, setCurrentLanguage] = useState('it');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('eur');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const profileIconWidth = 30;
    const profileIconHeight = 35;

    useEffect(() => {
        const storedLanguage = localStorage.getItem('language') || 'it';
        setCurrentLanguage(storedLanguage);

        const handleLanguageChangeEvent = (event: CustomEvent) => {
            setCurrentLanguage(event.detail);
        };
        window.addEventListener('languageChange', handleLanguageChangeEvent);
        return () => window.removeEventListener('languageChange', handleLanguageChangeEvent);
    }, []);

     // Carica la valuta salvata in localStorage
    useEffect(() => {
        const storedCurrency = localStorage.getItem('selectedCurrency') || 'eur';
        setSelectedCurrency(storedCurrency);
    }, []);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
            if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
                setIsCurrencyMenuOpen(false);
            }
            if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
                setIsLanguageMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
    const toggleCurrencyMenu = () => setIsCurrencyMenuOpen((prev) => !prev);
    const toggleLanguageMenu = () => setIsLanguageMenuOpen((prev) => !prev);

    const selectCurrency = (value: string) => {
        setSelectedCurrency(value);
        localStorage.setItem('selectedCurrency', value); // Salva la valuta selezionata
        setIsCurrencyMenuOpen(false);
         // Dispatch di un evento personalizzato per notificare altri componenti (come SearchBarHomePage)
        const currencyChangeEvent = new CustomEvent('currencyChange', { detail: value });
        window.dispatchEvent(currencyChangeEvent);
    };


    const selectLanguage = (value: string) => {
        setCurrentLanguage(value);
        localStorage.setItem('language', value);
        setIsLanguageMenuOpen(false);
        const languageChangeEvent = new CustomEvent('languageChange', { detail: value });
        window.dispatchEvent(languageChangeEvent);
    };

    const langTranslations = translations[currentLanguage] || translations.it;

    const renderMobileMenu = () => (
        <div ref={mobileMenuRef} className="md:hidden relative">
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white focus:outline-none"
                aria-label="Apri menu"
            >
                <Menu className="h-6 w-6" />
            </button>
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        // Stili per il menu mobile migliorati
                        className="absolute right-0 top-12 bg-white border border-gray-200 shadow-lg rounded-lg p-4 space-y-4 w-64 text-gray-800"
                    >
                        <div className="space-y-2">
                             {/* Commentato href per puntare alla pagina interna /flights */}
                             {/*
                            <Link href="/flights" className="block px-4 py-2 rounded-md hover:bg-blue-800">
                                <span className="text-white">{langTranslations.flights}</span>
                            </Link>
                            <Link href="/accommodations" className="block px-4 py-2 rounded-md hover:bg-blue-800">
                                <span className="text-white">{langTranslations.accommodations}</span>
                            </Link>
                            <Link href="/rentals" className="block px-4 py-2 rounded-md hover:bg-blue-800">
                                <span className="text-white">{langTranslations.rentals}</span>
                            </Link>
                             */}
                            <Link href="/" className="block px-4 py-2 rounded-md hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                                <span className="text-gray-800">{langTranslations.home}</span>
                            </Link>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            {/* Profilo Mobile */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="text-gray-800 w-full flex items-center justify-between py-2 px-4 rounded-md hover:bg-gray-100"
                                >
                                    {langTranslations.profile}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute left-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md p-2 w-full"
                                        >
                                            {profileMenuOptions[currentLanguage]?.map((option, index) => (
                                                <Link href={option.href} key={index} className="block py-1 px-2 text-gray-800 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                                                    {option.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Valuta Mobile */}
                            <div className="relative mt-2">
                                <button
                                    onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                                    className="text-gray-800 w-full flex items-center justify-between py-2 px-4 rounded-md hover:bg-gray-100"
                                >
                                    Valuta ({currencyOptions.find((c) => c.value === selectedCurrency)?.label})
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <AnimatePresence>
                                    {isCurrencyMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute left-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-full"
                                        >
                                            {currencyOptions.map((option, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        selectCurrency(option.value);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className="py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer"
                                                >
                                                    {option.label}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Lingua Mobile*/}
                            <div className="relative mt-2">
                                <button
                                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                                    className="text-gray-800 w-full flex items-center justify-between py-2 px-4 rounded-md hover:bg-gray-100"
                                >
                                    Lingua ({languageOptions.find((l) => l.value === currentLanguage)?.label})
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <AnimatePresence>
                                    {isLanguageMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                             // Stili moderni per il dropdown
                                            className="absolute left-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-full"
                                        >
                                            {languageOptions.map((option, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => selectLanguage(option.value)}
                                                    // Stili moderni per le voci del dropdown
                                                    className="py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer"

                                                >
                                                    {option.label}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );


    return (
        <header
            className="fixed top-0 left-0 right-0 bg-blue-900 z-50 shadow-md"
        >
            {/* Utilizza la prop minHeight per impostare l'altezza minima del container interno */}
            <div className="container mx-auto px-4 py-4 flex items-center justify-between" style={{ minHeight: minHeight }}>
                {/* Logo */}
                {/* Il posizionamento assoluto e i margini lo mantengono allineato */}
                <div className=" absolute top-0 left-0 m-4 flex flex-col" style={{zIndex: 100}}>
                    <Link href="/" aria-label="Vai alla pagina iniziale">
                        <Image
                            src="/logo/ytplogo.png"
                            alt="YTP Logo"
                            width={250}
                            height={50}
                            priority
                        />
                    </Link>

                    {/* Navigazione a sinistra (desktop) - Commentata */}
                    <nav className="flex  gap-4 mt-6">
                        {/* Commentati i link/pulsanti per Cerca Voli, Cerca Alloggi, Cerca Noleggi */}
                        {/*
                        <Link href="/flights" className="text-white hover:text-blue-300" aria-label="Vai alla pagina dei voli">
                            <button className="text-white hover:text-blue-300 font-bold  rounded" >{langTranslations.flights}</button>
                        </Link>
                        <Link href="/accommodations" className="text-white hover:text-blue-300" aria-label="Vai alla pagina degli alloggi">
                            <button className="text-white hover:text-blue-300 font-bold  rounded">{langTranslations.accommodations}</button>
                        </Link>
                        <Link href="/rentals" className="text-white hover:text-blue-300" aria-label="Vai alla pagina degli affitti">
                            <button className="text-white hover:text-blue-300 font-bold  rounded">{langTranslations.rentals}</button>
                        </Link>
                         */}
                    </nav>
                </div>



                {/* Menu a destra (desktop) - Riordinato Valuta, Lingua, Profilo e stili aggiornati */}
                 {/* Il posizionamento assoluto e i margini lo mantengono allineato */}
                <div className="flex items-center gap-4 m-4 absolute top-0 right-0" style={{zIndex: 100}}>

                    {/* Valuta - Primo */}
                    <div ref={currencyRef} className="relative">
                        <button
                            onClick={toggleCurrencyMenu}
                            className="text-white flex items-center gap-2 focus:outline-none"
                            aria-label="Apri menu valuta"
                        >
                            {currencyOptions.find((c) => c.value === selectedCurrency)?.label}
                            <ChevronDown className="h-4 w-4" />
                        </button>
                        <AnimatePresence>
                            {isCurrencyMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    // Stili moderni per il dropdown
                                    className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 text-gray-800"
                                >
                                    {currencyOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectCurrency(option.value)}
                                            // Stili moderni per le voci del dropdown
                                            className="py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer"
                                            role="menuitem"
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                     {/* Lingua - Secondo */}
                     <div ref={languageRef} className="relative">
                        <button
                            onClick={toggleLanguageMenu}
                            className="text-white  flex items-center gap-2 focus:outline-none"
                            aria-label="Apri menu lingua"
                        >
                            {languageOptions.find((l) => l.value === currentLanguage)?.label}
                            <ChevronDown className="h-4 w-4" />
                        </button>
                        <AnimatePresence>
                            {isLanguageMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                     // Stili moderni per il dropdown
                                    className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 text-gray-800"
                                >
                                    {languageOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectLanguage(option.value)}
                                            // Stili moderni per le voci del dropdown
                                            className="py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer"

                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profilo - Ultimo */}
                    <div ref={profileRef} className="">
                        <button
                            onClick={toggleProfileMenu}
                            className="text-white focus:outline-none flex items-center"
                            aria-label="Apri menu profilo"
                        >
                             {/* L'immagine ha già le dimensioni fisse */}
                            <Image
                                src="/logo/profile.png"
                                alt="Profile"
                                width={profileIconWidth}
                                height={profileIconHeight}
                            />
                        </button>
                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                     // Stili moderni per il dropdown
                                    className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 text-gray-800"
                                >
                                    {profileMenuOptions[currentLanguage]?.map((option, index) => (
                                        <Link
                                            href={option.href}
                                            key={index}
                                            // Stili moderni per le voci del dropdown
                                            className="block py-1 px-2 text-gray-800 hover:bg-gray-100 rounded-md"
                                            aria-label={option.label}
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Menu Mobile Button */}
                {renderMobileMenu()}
            </div>
        </header>
    );
};

export default Header;