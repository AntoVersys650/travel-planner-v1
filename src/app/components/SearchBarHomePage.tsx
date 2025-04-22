'use client';

import React, { useState, useEffect, useRef, useCallback, forwardRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import it from 'date-fns/locale/it';

registerLocale('it', it);

// Interfaccia suggerimenti di luogo
interface PlaceSuggestion {
    name: string;
    latitude: number;
    longitude: number;
}

// Interfaccia per i dati di OpenStreetMap
interface OSMPlace {
    display_name: string;
    lat: string;
    lon: string;
}

// Funzione per ottenere suggerimenti da OpenStreetMap
const getPlaceSuggestions = async (input: string, language: string): Promise<PlaceSuggestion[]> => {
    if (!input) return [];

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&accept-language=${language}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }
        const data: OSMPlace[] = await response.json();
        return data.map(place => ({
            name: place.display_name,
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
        }));
    } catch (error) {
        console.error("Error fetching place suggestions:", error);
        return []; // Restituisce un array vuoto in caso di errore per non bloccare l'interfaccia
    }
};

// Traduzioni
const translations = {
    it: {
        searchPlaceholder: 'Dove vuoi andare?',
        checkInPlaceholder: 'Check-in',
        checkOutPlaceholder: 'Check-out',
        budgetMinPlaceholder: 'Budget Minimo',
        budgetMaxPlaceholder: 'Budget Massimo',
        searchButton: 'Cerca',
        errorMessageDestination: 'Inserisci la località per iniziare',
        errorMessageCheckIn: 'Seleziona la data del check-in',
        errorMessageCheckOutPlaceholder: 'Seleziona la data del check-out',
        errorMessageDateOrder: 'La data di check-out deve essere uguale o successiva alla data di check-in',
        errorMessageBudget: 'Il budget minimo deve essere inferiore al budget massimo',
        noSuggestions: 'Nessun suggerimento trovato', //Nuovo
    },
    en: {
        searchPlaceholder: 'Where are you going?',
        checkInPlaceholder: 'Check-in',
        checkOutPlaceholder: 'Check-out',
        budgetMinPlaceholder: 'Min Budget',
        budgetMaxPlaceholder: 'Max Budget',
        searchButton: 'Search',
        errorMessageDestination: 'Please enter the desired destination',
        errorMessageCheckIn: 'Please enter the check-in date',
        errorMessageCheckOutPlaceholder: 'Please enter the check-out date',
        errorMessageDateOrder: 'The check-out date must be equal to or after the check-in date',
        errorMessageBudget: 'The min budget must be less than the max budget',
        noSuggestions: 'No suggestions found', //Nuovo
    },
    fr: {
        searchPlaceholder: 'Où vas-tu?',
        checkInPlaceholder: 'Arrivée',
        checkOutPlaceholder: 'Départ',
        budgetMinPlaceholder: 'Budget Min',
        budgetMaxPlaceholder: 'Budget Max',
        searchButton: 'Rechercher',
        errorMessageDestination: 'Veuillez saisir la destination souhaitée',
        errorMessageCheckIn: 'Veuillez saisir la date d\'arrivée',
        errorMessageCheckOutPlaceholder: 'Veuillez saisir la date de départ',
        errorMessageDateOrder: 'La date de départ doit être égale ou postérieure à la date d\'arrivée',
        errorMessageBudget: 'Le budget minimum doit être inférieur au budget maximum',
        noSuggestions: 'Aucune suggestion trouvée', //Nuovo
    },
    es: {
        searchPlaceholder: '¿Adónde vas?',
        checkInPlaceholder: 'Entrada',
        checkOutPlaceholder: 'Salida',
        budgetMinPlaceholder: 'Presupuesto Mín.',
        budgetMaxPlaceholder: 'Presupuesto Máx.',
        searchButton: 'Buscar',
        errorMessageDestination: 'Por favor, introduce el destino deseado',
        errorMessageCheckIn: 'Por favor, introduce la fecha de entrada',
        errorMessageCheckOutPlaceholder: 'Por favor, introduce la fecha de salida',
        errorMessageDateOrder: 'La fecha de salida debe ser igual o posterior a la fecha de entrada',
        errorMessageBudget: 'El presupuesto mínimo debe ser inferior al presupuesto máximo',
        noSuggestions: 'No se han encontrado sugerencias', //Nuovo
    },
};

// Stili
const modernContainerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    backdropFilter: 'blur(10px)',
};
const modernFieldStyle: React.CSSProperties = {
    padding: '14px 16px 14px 40px',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    outline: 'none',
};
const modernButtonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
};
const modernButtonHoverStyle: React.CSSProperties = {
    backgroundColor: '#0056b3',
};
const modernErrorStyle: React.CSSProperties = {
    backgroundColor: '#ffe0e0',
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '4px',
    position: 'absolute',
    top: '105%',
    left: 0,
    zIndex: 1000,
};
const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#777',
    fontSize: '1.2em',
};
const suggestionListStyle: React.CSSProperties = { //Stile per la lista di suggerimenti
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    zIndex: 10,
    listStyle: 'none',
    padding: 0,
    margin: 0,
    borderRadius: '8px',
    boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
    maxHeight: '200px',  //Aggiunto altezza massima
    overflowY: 'auto',   //Aggiunto scroll se necessario
};

const suggestionItemStyle: React.CSSProperties = {  //Stile per ogni suggerimento
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};

const suggestionItemHoverStyle: React.CSSProperties = { //Stile al hover
    backgroundColor: '#f0f0f0',
};

// Props
interface BookingSearchProps {
    currentLanguage: keyof typeof translations;
    selectedCurrency: string;
    exchangeRates: Record<string, number>;
    containerStyle?: React.CSSProperties;
    fieldStyle?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
    errorStyle?: React.CSSProperties;
    fieldWidthDestination?: string;
    fieldHeightDestination?: string;
    fieldWidthCheckIn?: string;
    fieldHeightCheckIn?: string;
    fieldWidthCheckOut?: string;
    fieldHeightCheckOut?: string;
    fieldWidthBudget?: string;
    fieldHeightBudget?: string;
}
interface CustomInputProps {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
    hasError?: boolean;
    height: string;
    onClear?: () => void;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({ value, onClick, placeholder, hasError, height, onClear }, ref) => (
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onClick}>
            <FaCalendarAlt style={iconStyle} />
            <input
                type="text"
                ref={ref}
                value={value}
                placeholder={placeholder}
                style={{
                    ...modernFieldStyle,
                    height,
                    borderColor: hasError ? '#d32f2f' : modernFieldStyle.borderColor,
                }}
                readOnly
            />
            {value && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear?.();
                    }}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FaTimes style={{ fontSize: '0.8em', color: '#777' }} />
                </button>
            )}
        </div>
    )
);

const BookingSearch = ({
    currentLanguage,
    selectedCurrency,
    exchangeRates,
    containerStyle = modernContainerStyle,
    fieldStyle = modernFieldStyle,
    buttonStyle = modernButtonStyle,
    errorStyle = modernErrorStyle,
    fieldWidthDestination = '100%',
    fieldHeightDestination = '48px',
    fieldWidthCheckIn = '100%',
    fieldHeightCheckIn = '48px',
    fieldWidthCheckOut = '100%',
    fieldHeightCheckOut = '48px',
    fieldWidthBudget = '100%',
    fieldHeightBudget = '48px',
}: BookingSearchProps) => {
    const [destination, setDestination] = useState('');
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [destinationError, setDestinationError] = useState('');
    const [checkInError, setCheckInError] = useState('');
    const [checkOutError, setCheckOutError] = useState('');
    const [budgetError, setBudgetError] = useState('');
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const budgetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const errorRef = useRef<HTMLDivElement | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false); //Nuovo state

    useEffect(() => {
        const fetchSuggestions = async (input: string) => {
            try {
                const results = await getPlaceSuggestions(input, currentLanguage);
                setSuggestions(results);
                setShowSuggestions(results.length > 0); //Mostra solo se ci sono risultati
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        if (destination) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => fetchSuggestions(destination), 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (errorRef.current && !errorRef.current.contains(event.target as Node)) {
                setDestinationError('');
                setCheckInError('');
                setCheckOutError('');
                setBudgetError('');
                setShowSuggestions(false); //Nascondi i suggerimenti quando si clicca fuori
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            document.removeEventListener('mousedown', handleClickOutside);
            localStorage.setItem('lastSearchDestination', destination);
            if (checkInDate) localStorage.setItem('lastSearchCheckIn', checkInDate!.toISOString());
            if (checkOutDate) localStorage.setItem('lastSearchCheckOut', checkOutDate!.toISOString());
            localStorage.setItem('lastSearchMinBudget', minBudget);
            localStorage.setItem('lastSearchMaxBudget', maxBudget);
        };
    }, [destination, currentLanguage, checkInDate, checkOutDate, minBudget, maxBudget]);

    useEffect(() => {
        const sd = localStorage.getItem('lastSearchDestination');
        const sc = localStorage.getItem('lastSearchCheckIn');
        const so = localStorage.getItem('lastSearchCheckOut');
        const sm = localStorage.getItem('lastSearchMinBudget');
        const sx = localStorage.getItem('lastSearchMaxBudget');
        if (sd) setDestination(sd);
        // if (sc) setCheckInDate(new Date(sc));  //remove prepopulating
        // if (so) setCheckOutDate(new Date(so)); //remove prepopulating
        if (sm) setMinBudget(sm);
        if (sx) setMaxBudget(sx);
    }, []);

    const handleMinBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setMinBudget(value);
            if (budgetTimeoutRef.current) clearTimeout(budgetTimeoutRef.current);
            budgetTimeoutRef.current = setTimeout(() => {
                if (maxBudget && Number(maxBudget) < Number(value)) {
                    setMaxBudget(value);
                }
            }, 300);
        }
    }, [maxBudget]);

    const handleMaxBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) setMaxBudget(value);
    }, []);

    const handleSearchClick = () => {
        let hasError = false;
        const today = new Date().setHours(0, 0, 0, 0);

        if (!destination) {
            setDestinationError(translations[currentLanguage].errorMessageDestination);
            hasError = true;
        } else {
            setDestinationError('');
        }

        if (!checkInDate || new Date(checkInDate).setHours(0, 0, 0, 0) < today) {
            setCheckInError(translations[currentLanguage].errorMessageCheckIn);
            hasError = true;
        } else {
            setCheckInError('');
        }

        if (!checkOutDate || (checkInDate && checkOutDate <= checkInDate)) {
            setCheckOutError(checkOutDate
                ? translations[currentLanguage].errorMessageDateOrder
                : translations[currentLanguage].errorMessageCheckOutPlaceholder
            );
            hasError = true;
        } else {
            setCheckOutError('');
        }

        const minNum = minBudget ? Number(minBudget) : null;
        const maxNum = maxBudget ? Number(maxBudget) : null;
        if (minNum !== null && maxNum !== null && minNum >= maxNum) {
            setBudgetError(translations[currentLanguage].errorMessageBudget);
            hasError = true;
        } else {
            setBudgetError('');
        }

        if (!hasError) {
            const checkInDateISO = checkInDate ? checkInDate.toISOString() : '';
            const checkOutDateISO = checkOutDate ? checkOutDate.toISOString() : '';
            router.push(
                `/search?q=${encodeURIComponent(destination)}&checkIn=${checkInDateISO}&checkOut=${checkInDateISO ? checkOutDateISO : ''}&minBudget=${minBudget}&maxBudget=${maxBudget}&lang=${currentLanguage}`
            );
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchClick();
        }
    };

    const currencySymbol = selectedCurrency
        ? new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 0 }).formatToParts(0)[0].value
        : '';

    const clearCheckInDate = () => {
        setCheckInDate(null);
    };

    const clearCheckOutDate = () => {
        setCheckOutDate(null);
    };

    const handleSuggestionClick = (suggestion: PlaceSuggestion) => { //Nuova funzione
        setDestination(suggestion.name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div style={containerStyle} onKeyDown={handleKeyDown} tabIndex={0} ref={errorRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <FaMapMarkerAlt style={iconStyle} />
                    <input
                        type="text"
                        placeholder={translations[currentLanguage].searchPlaceholder}
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        style={{
                            ...fieldStyle,
                            width: fieldWidthDestination,
                            height: fieldHeightDestination,
                            borderColor: destinationError ? '#d32f2f' : (fieldStyle.border as string),
                        }}
                        autoComplete="off"
                        onClick={() => setShowSuggestions(true)} //Mostra i suggerimenti al click
                    />
                    {showSuggestions && (  //Usa la state per mostrare/nascondere
                        <ul style={suggestionListStyle}>
                            {suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSuggestionClick(s)}
                                        style={{
                                            ...suggestionItemStyle,
                                            ...(i % 2 === 0 ? {} : { backgroundColor: '#f8f8f8' }), //Riga alternata
                                            ':hover': suggestionItemHoverStyle,
                                        }}

                                    >
                                        {s.name}
                                    </li>
                                ))
                            ) : (
                                <li style={{ ...suggestionItemStyle, fontStyle: 'italic' }}>
                                    {translations[currentLanguage].noSuggestions}
                                </li>
                            )}
                        </ul>
                    )}
                    {destinationError && <div style={errorStyle}>{destinationError}</div>}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <DatePicker
                            selected={checkInDate}
                            onChange={(date) => setCheckInDate(date)}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText={translations[currentLanguage].checkInPlaceholder}
                            customInput={
                                <CustomDateInput
                                    value={checkInDate ? checkInDate.toLocaleDateString('it') : ''}
                                    placeholder={translations[currentLanguage].checkInPlaceholder}
                                    hasError={!!checkInError}
                                    height={fieldHeightCheckIn}
                                    onClear={clearCheckInDate}
                                />
                            }
                        />

                        {checkInError && <div style={errorStyle}>{checkInError}</div>}
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <DatePicker
                            selected={checkOutDate}
                            onChange={(date) => setCheckOutDate(date)}
                            dateFormat="dd/MM/yyyy"
                            minDate={checkInDate || new Date()}
                            placeholderText={translations[currentLanguage].checkOutPlaceholder}
                            customInput={
                                <CustomDateInput
                                    value={checkOutDate ? checkOutDate.toLocaleDateString('it') : ''}
                                    placeholder={translations[currentLanguage].checkOutPlaceholder}
                                    hasError={!!checkOutError}
                                    height={fieldHeightCheckOut}
                                    onClear={clearCheckOutDate}
                                />
                            }
                        />
                        {checkOutError && <div style={errorStyle}>{checkOutError}</div>}
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaMoneyBillWave style={iconStyle} />
                            <input
                                type="text"
                                value={minBudget}
                                onChange={handleMinBudgetChange}
                                placeholder={`${translations[currentLanguage].budgetMinPlaceholder} (${currencySymbol})`}
                                style={{ ...fieldStyle, width: fieldWidthBudget, height: fieldHeightBudget, borderColor: budgetError ? '\#d32f2f' : (fieldStyle.border as string) }}
                            />
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaMoneyBillWave style={iconStyle} />
                            <input
                                type="text"
                                value={maxBudget}
                                onChange={handleMaxBudgetChange}
                                placeholder={`${translations[currentLanguage].budgetMaxPlaceholder} (${currencySymbol})`}
                                style={{ ...fieldStyle, width: fieldWidthBudget, height: fieldHeightBudget, borderColor: budgetError ? '\#d32f2f' : (fieldStyle.border as string) }}
                            />
                        </div>
                    </div>
                    {budgetError && <div style={errorStyle}>{budgetError}</div>}
                </div>
                <button
                    style={{ ...buttonStyle }}
                    onClick={handleSearchClick}
                    onMouseEnter={() => (buttonStyle.backgroundColor = modernButtonHoverStyle.backgroundColor)}
                    onMouseLeave={() => (buttonStyle.backgroundColor = modernButtonStyle.backgroundColor)}
                >
                    {translations[currentLanguage].searchButton}
                </button>
            </div>
        </div>
    );
};

export default BookingSearch;