'use client';

import React, { useState, useEffect, useRef, useCallback, forwardRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaTimes, FaUsers, FaChild, FaPaw, FaPlus, FaMinus } from 'react-icons/fa';
import it from 'date-fns/locale/it';
import { motion, AnimatePresence } from 'framer-motion';

// Registra la localizzazione italiana per il datepicker
registerLocale('it', it);

// Interfacce per i dati dei suggerimenti
interface PlaceSuggestion { name: string; latitude: number; longitude: number; }
interface OSMPlace { display_name: string; lat: string; lon: string; }

// Funzione per ottenere suggerimenti di località dall'API di OpenStreetMap Nominatim
const getPlaceSuggestions = async (input: string, language: string): Promise<PlaceSuggestion[]> => {
    if (!input) return [];
    // Utilizza il parametro 'q' per la ricerca generica (città, indirizzi, ecc.)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&accept-language=${language}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data: OSMPlace[] = await response.json();
        // Mappa i risultati dell'API nel formato PlaceSuggestion
        return data.map(p => ({ name: p.display_name, latitude: parseFloat(p.lat), longitude: parseFloat(p.lon) }));
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};

// Traduzioni per diverse lingue
const translations = {
    it: {
        searchPlaceholder: 'Dove vuoi andare?', checkInPlaceholder: 'Check-in', checkOutPlaceholder: 'Check-out',
        budgetMinPlaceholder: 'Budget Minimo', budgetMaxPlaceholder: 'Budget Massimo', searchButton: 'Cerca',
        errorMessageDestination: 'Inserisci la località per iniziare', errorMessageCheckIn: 'Seleziona la data del check-in',
        errorMessageCheckOutPlaceholder: 'Seleziona la data del check-out',
        errorMessageDateOrder: 'La data di check-out deve essere uguale o successiva alla data di check-in',
        errorMessageBudget: 'Il budget minimo deve essere inferiore al budget massimo', noSuggestions: 'Nessun suggerimento trovato',
        adults: 'Adulti', children: 'Bambini', pets: 'Animali', errorMessageAdults: 'Inserisci il numero di adulti',
        errorMessageAdultsMinimum: 'Deve esserci almeno 1 adulto', errorMessageNumber: 'Inserisci un numero valido',
        guests: 'Ospiti', confirm: 'Conferma',
        close: 'OK'
    },
    en: {
        searchPlaceholder: 'Where are you going?', checkInPlaceholder: 'Check-in', checkOutPlaceholder: 'Check-out',
        budgetMinPlaceholder: 'Min Budget', budgetMaxPlaceholder: 'Max Budget', searchButton: 'Search',
        errorMessageDestination: 'Please enter the desired destination', errorMessageCheckIn: 'Please enter the check-in date',
        errorMessageCheckOutPlaceholder: 'Please enter the check-out date',
        errorMessageDateOrder: 'The check-out date must be equal to or after the check-in date',
        errorMessageBudget: 'The min budget must be less than the max budget', noSuggestions: 'No suggestions found',
        adults: 'Adults', children: 'Children', pets: 'Pets', errorMessageAdults: 'Enter the number of adults',
        errorMessageAdultsMinimum: 'There must be at least 1 adult', errorMessageNumber: 'Enter a valid number',
        guests: 'Guests', confirm: 'Confirm',
        close: 'OK'
    },
    fr: {
        searchPlaceholder: 'Où vas-tu?', checkInPlaceholder: 'Arrivée', checkOutPlaceholder: 'Départ',
        budgetMinPlaceholder: 'Budget Min', budgetMaxPlaceholder: 'Budget Max', searchButton: 'Rechercher',
        errorMessageDestination: 'Veuillez saisir la destination souhaitée', errorMessageCheckIn: 'Veuillez saisir la date d\'arrivée',
        errorMessageCheckOutPlaceholder: 'Veuillez saisir la date de départ',
        errorMessageDateOrder: 'La date de départ doit être égale ou postérieure à la date d\'arrivée',
        errorMessageBudget: 'Le budget minimum doit être inférieur au budget maximum', noSuggestions: 'Aucune suggestion trouvée',
        adults: 'Adultes', children: 'Enfants', pets: 'Animaux', errorMessageAdults: 'Entrez le nombre d\'adultes',
        errorMessageAdultsMinimum: 'Il doit y avoir au moins 1 adulte', errorMessageNumber: 'Entrez un nombre valide',
        guests: 'Voyageurs', confirm: 'Confirmer',
        close: 'OK'
    },
    es: {
        searchPlaceholder: '¿Adónde vas?', checkInPlaceholder: 'Entrada', checkOutPlaceholder: 'Salida',
        budgetMinPlaceholder: 'Presupuesto Mín.', budgetMaxPlaceholder: 'Presupuesto Máx.', searchButton: 'Buscar',
        errorMessageDestination: 'Por favor, introduce el destino deseado', errorMessageCheckIn: 'Por favor, introduce la fecha de entrada',
        errorMessageCheckOutPlaceholder: 'Por favor, introduce la fecha de salida',
        errorMessageDateOrder: 'La fecha de salida debe ser igual o posterior a la fecha de entrada',
        errorMessageBudget: 'El presupuesto mínimo debe ser inferior al presupuesto máximo',
        noSuggestions: 'No se han encontrado sugerencias', adults: 'Adultos', children: 'Niños', pets: 'Mascotas',
        errorMessageAdults: 'Ingrese el número de adultos', errorMessageAdultsMinimum: 'Debe haber al menos 1 adulto',
        errorMessageNumber: 'Ingrese un número válido',
        guests: 'Huéspedes', confirm: 'Confirmar',
        close: 'OK'
    },
};

// Stili CSS moderni per i vari elementi del componente
const modernContainerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex', flexDirection: 'column', padding: '24px', maxWidth: '800px', margin: '0 auto', position: 'relative',
    backdropFilter: 'blur(10px)',
};
const modernFieldStyle: React.CSSProperties = {
    padding: '14px 16px 14px 40px', fontSize: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px',
    transition: 'border-color 0.3s, box-shadow 0.3s', outline: 'none',
};
const modernButtonStyle: React.CSSProperties = {
    backgroundColor: '#007bff', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '18px', marginTop: '20px', transition: 'background-color 0.3s ease',
};
const modernButtonHoverStyle: React.CSSProperties = { backgroundColor: '#0056b3' }; // Mantenuto per riferimento

const modernErrorStyle: React.CSSProperties = {
    backgroundColor: '#ffe0e0', color: '#d32f2f', fontWeight: 'bold', fontSize: '12px', padding: '6px 10px',
    borderRadius: '4px', position: 'absolute', top: '105%', left: 0, zIndex: 1000,
};
const iconStyle: React.CSSProperties = {
    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#777', fontSize: '1.2em',
};
const suggestionListStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #ccc', zIndex: 10,
    listStyle: 'none', padding: 0, margin: 0, borderRadius: '8px', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
    maxHeight: '200px', overflowY: 'auto',
};
const suggestionItemStyle: React.CSSProperties = {
    padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.2s ease',
    // Rimosso stile :hover non valido
};
const suggestionItemHoverStyle: React.CSSProperties = { backgroundColor: '#f0f0f0' }; // Mantenuto per riferimento

const guestsDropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #ccc', zIndex: 10,
    borderRadius: '8px', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '16px',
    minWidth: '250px',
};
const guestRowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
};
const guestLabelStyle: React.CSSProperties = {
    fontSize: '16px', fontWeight: '500', color: '#333',
};
const guestCountStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px',
};
const countButtonStyle: React.CSSProperties = {
    backgroundColor: '#e9ecef', border: '1px solid #ced4da', borderRadius: '50%', width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px',
    transition: 'background-color 0.2s ease',
    // Rimosso stile :hover non valido
};
const countButtonHoverStyle: React.CSSProperties = {
    backgroundColor: '#dee2e6',
};
const numberInputStyle: React.CSSProperties = {
    width: '48px', padding: '8px', border: '1px solid #ced4da', borderRadius: '8px', textAlign: 'center', fontSize: '16px',
    outline: 'none',
};
const closeButtonStyle: React.CSSProperties = {
    padding: '8px 16px', backgroundColor: '#e9ecef', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', transition: 'background-color 0.3s ease', alignSelf: 'flex-end',
    marginTop: '16px'
};
const closeButtonHoverStyle: React.CSSProperties = { backgroundColor: '#dee2e6' }; // Mantenuto per riferimento

// Stile per il pulsante di clear (la 'x')
const clearButtonStyle: React.CSSProperties = {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#777', fontSize: '1.2em',
    zIndex: 2, // Assicura che sia sopra l'input
};


// Interfaccia per le props del componente BookingSearch
interface BookingSearchProps {
    currentLanguage: keyof typeof translations; selectedCurrency: string;
    exchangeRates: Record<string, number>;
    containerStyle?: React.CSSProperties; fieldStyle?: React.CSSProperties; buttonStyle?: React.CSSProperties;
    errorStyle?: React.CSSProperties; fieldWidthDestination?: string; fieldHeightDestination?: string;
    fieldWidthCheckIn?: string; fieldHeightCheckIn?: string;
    fieldWidthCheckOut?: string; fieldHeightCheckOut?: string;
    fieldWidthBudget?: string; fieldHeightBudget?: string; fieldWidthNumber?: string; fieldHeightNumber?: string;
}

// Interfaccia per le props del componente personalizzato per l'input data
interface CustomInputProps {
    value?: string;
    onClick?: () => void; placeholder?: string; hasError?: boolean; height: string; onClear?: () => void;
}

// Componente personalizzato per l'input della data (utilizzato da react-datepicker)
const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({ value, onClick, placeholder, hasError, height, onClear }, ref) => (
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onClick}>
            <FaCalendarAlt style={iconStyle} /> {/* Icona */}
            <input
                type="text" ref={ref} value={value} placeholder={placeholder}
                style={{ ...modernFieldStyle, height, borderColor: hasError ? '#d32f2f' : (modernFieldStyle.borderColor as string) }}
                readOnly // L'input è di sola lettura perché la data è selezionata dal DatePicker
            />
            {value && (
                // Pulsante per cancellare la data selezionata
                <button
                    onClick={(e) => { e.stopPropagation(); onClear?.(); }}
                    style={clearButtonStyle} // Usa lo stile per il pulsante di clear
                >
                    <FaTimes style={{ fontSize: '0.8em' }} />
                </button>
            )}
        </div>
    )
);

// Componente principale della barra di ricerca prenotazioni
const BookingSearch = ({
    currentLanguage, selectedCurrency, exchangeRates, containerStyle = modernContainerStyle, fieldStyle = modernFieldStyle,
    buttonStyle = modernButtonStyle, errorStyle = modernErrorStyle, fieldWidthDestination = '100%', fieldHeightDestination = '48px',
    fieldWidthCheckIn = '100%', fieldHeightCheckIn = '48px', fieldWidthCheckOut = '100%', fieldHeightCheckOut = '48px',
    fieldWidthBudget = '100%', fieldHeightBudget = '48px', fieldWidthNumber = '100%', fieldHeightNumber = '48px',
}: BookingSearchProps) => {
    // Stati per i vari campi del form
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
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);
    const [adultsError, setAdultsError] = useState('');
    const [numberError, setNumberError] = useState('');

    const router = useRouter(); // Hook per la navigazione in Next.js
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref per il timeout della ricerca suggerimenti
    const budgetTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref per il timeout del budget

    // Definizione corretta di errorRef
    const errorRef = useRef<HTMLDivElement | null>(null); // Ref per il div principale (usato per rilevare click esterni)


    const [showSuggestions, setShowSuggestions] = useState(false); // Stato per mostrare/nascondere la lista suggerimenti
    const [showGuestsDropdown, setShowGuestsDropdown] = useState(false); // Stato per mostrare/nascondere il dropdown ospiti
    const [guestsLabel, setGuestsLabel] = useState<string>(`${adults} ${translations[currentLanguage].adults}`); // Label per il campo ospiti
    const guestsInputRef = useRef<HTMLInputElement>(null); // Ref per l'input ospiti (anche se readOnly)

    // Ref per tracciare se la destinazione è stata impostata selezionando un suggerimento
    const isSelectingSuggestionRef = useRef(false);

    // Funzioni per cancellare i campi - DEFINITE ALL'INTERNO DEL COMPONENTE
    const clearDestination = () => setDestination('');
    const clearMinBudget = () => setMinBudget('');
    const clearMaxBudget = () => setMaxBudget('');
    const clearCheckInDate = () => setCheckInDate(null); // Spostata qui
    const clearCheckOutDate = () => setCheckOutDate(null); // Spostata qui


    // Effetto per il fetching dei suggerimenti di destinazione
    useEffect(() => {
        const fetchSuggestions = async (input: string) => {
            try {
                const results = await getPlaceSuggestions(input, currentLanguage);

                // --- FIX PER IL PROBLEMA DI RIAPERTURA ---
                // Se la destinazione è stata appena impostata selezionando un suggerimento,
                // evita di mostrare immediatamente nuovi suggerimenti.
                if (isSelectingSuggestionRef.current) {
                    isSelectingSuggestionRef.current = false; // Resetta il flag
                    // Aggiorna lo stato dei suggerimenti, ma non mostrarli
                    setSuggestions(results);
                    setShowSuggestions(false); // Assicura che i suggerimenti siano nascosti dopo la selezione
                    return; // Esci senza mostrare i suggerimenti
                }
                // ------------------------------------------

                setSuggestions(results);
                // Mostra i suggerimenti solo se ce ne sono e l'input non è vuoto
                setShowSuggestions(results.length > 0 && destination.length > 0);

            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        // Esegue il fetching dei suggerimenti con un timeout per evitare chiamate API eccessive
        if (destination) {
            // Esegue il fetching solo se la modifica della destinazione NON deriva dalla selezione di un suggerimento
            if (!isSelectingSuggestionRef.current) { // Aggiunto questo controllo
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => fetchSuggestions(destination), 300);
            } else {
                 // Se si sta selezionando un suggerimento, cancella il timeout esistente
                 if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }
        } else {
            // Se la destinazione è vuota, cancella i suggerimenti e nascondi la lista
            setSuggestions([]);
            setShowSuggestions(false);
        }

        // Gestore per nascondere suggerimenti e dropdown ospiti al click fuori
        const handleClickOutside = (event: MouseEvent) => {
             const containerElement = errorRef.current;
             // Controlla se il click è fuori dal container principale E dal dropdown ospiti (se aperto)
             const clickedInsideGuestsDropdown = showGuestsDropdown && guestsInputRef.current && guestsInputRef.current.parentElement?.contains(event.target as Node);
             const clickedInsideSuggestions = showSuggestions && (event.target as HTMLElement).closest(`.${suggestionListStyle.className}`); // Controllo più robusto per i suggerimenti

             if (containerElement && !containerElement.contains(event.target as Node) && !clickedInsideGuestsDropdown && !clickedInsideSuggestions) {
                setDestinationError(''); setCheckInError(''); setCheckOutError(''); setBudgetError('');
                setAdultsError(''); setNumberError(''); setShowSuggestions(false); setShowGuestsDropdown(false);
             }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup function
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            document.removeEventListener('mousedown', handleClickOutside);
            // Salva lo stato in localStorage alla chiusura/smontaggio del componente
            localStorage.setItem('lastSearchDestination', destination);
            if (checkInDate) localStorage.setItem('lastSearchCheckIn', checkInDate.toISOString());
            if (checkOutDate) localStorage.setItem('lastSearchCheckOut', checkOutDate.toISOString());
            localStorage.setItem('lastSearchMinBudget', minBudget); localStorage.setItem('lastSearchMaxBudget', maxBudget);
            localStorage.setItem('lastSearchAdults', adults.toString()); localStorage.setItem('lastSearchChildren', children.toString());
            localStorage.setItem('lastSearchPets', pets.toString());
        };
    }, [destination, currentLanguage, checkInDate, checkOutDate, minBudget, maxBudget, adults, children, pets, showGuestsDropdown, showSuggestions]); // Aggiunte dipendenze rilevanti

    // Effetto per caricare lo stato da localStorage al montaggio del componente
     useEffect(() => {
        const sd = localStorage.getItem('lastSearchDestination');
        const sm = localStorage.getItem('lastSearchMinBudget');
        const sx = localStorage.getItem('lastSearchMaxBudget');
        const sa = localStorage.getItem('lastSearchAdults');
        const sch = localStorage.getItem('lastSearchChildren');
        const sp = localStorage.getItem('lastSearchPets');
        const sci = localStorage.getItem('lastSearchCheckIn');
        const sco = localStorage.getItem('lastSearchCheckOut');

        if (sd) setDestination(sd);
        if (sm) setMinBudget(sm);
        if (sx) setMaxBudget(sx);
        if (sa) setAdults(parseInt(sa, 10) || 1);
        if (sch) setChildren(parseInt(sch, 10) || 0);
        if (sp) setPets(parseInt(sp, 10) || 0);
         if (sci) setCheckInDate(new Date(sci));
         if (sco) setCheckOutDate(new Date(sco));

    }, []); // L'array vuoto assicura che questo effetto venga eseguito solo al montaggio

    // Gestore per la modifica del budget minimo
    const handleMinBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Permette solo numeri
            setMinBudget(value);
            if (budgetTimeoutRef.current) clearTimeout(budgetTimeoutRef.current);
            // Imposta un timeout per regolare il budget massimo se diventa inferiore al minimo
            budgetTimeoutRef.current = setTimeout(() => {
                if (maxBudget && Number(maxBudget) < Number(value)) {
                    setMaxBudget(value);
                }
            }, 300);
        } else if (value === '') { // Permetti di svuotare l'input
             setMinBudget('');
        }
    }, [maxBudget]); // Aggiunta dipendenza maxBudget

    // Gestore per la modifica del budget massimo
    const handleMaxBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
         if (/^\d*$/.test(value)) { // Permette solo numeri
             // Aggiorna il massimo solo se è >= al minimo (se il minimo è impostato)
             if (minBudget && Number(value) < Number(minBudget) && value !== '') { // Permette stringa vuota
                 setMaxBudget(minBudget); // Imposta il massimo uguale al minimo se si cerca di inserire un valore inferiore
             } else {
                setMaxBudget(value);
             }
        } else if (value === '') { // Permetti di svuotare l'input
            setMaxBudget('');
        }
    }, [minBudget]); // Aggiunta dipendenza minBudget

    // Gestori per la modifica del numero di ospiti
    const handleAdultsChange = (value: number) => {
        setAdults(value);
        setAdultsError(''); // Cancella l'errore alla modifica
    };

    const handleChildrenChange = (value: number) => {
        setChildren(value);
    };

    const handlePetsChange = (value: number) => {
        setPets(value);
    };

    // Gestore per il click sul pulsante di ricerca
    const handleSearchClick = () => {
        let hasError = false;
        const today = new Date().setHours(0, 0, 0, 0);

        // Validazione dei campi
        if (!destination) { setDestinationError(translations[currentLanguage].errorMessageDestination); hasError = true; }
        else setDestinationError('');

        // Controlla se la data di check-in è selezionata e non è nel passato
        if (!checkInDate || new Date(checkInDate).setHours(0, 0, 0, 0) < today) {
             setCheckInError(translations[currentLanguage].errorMessageCheckIn); hasError = true;
        } else setCheckInError('');

        // Controlla se la data di check-out è selezionata e non è prima della data di check-in
        if (!checkOutDate || (checkInDate && checkOutDate < checkInDate)) { // Logica di validazione corretta (< anziché <=)
            setCheckOutError(checkOutDate ? translations[currentLanguage].errorMessageDateOrder : translations[currentLanguage].errorMessageCheckOutPlaceholder);
            hasError = true;
        } else setCheckOutError('');


        const minNum = minBudget ? Number(minBudget) : null;
        const maxNum = maxBudget ? Number(maxBudget) : null;
         // Validazione budget solo se entrambi i campi non sono vuoti e min >= max
        if (minBudget !== '' && maxBudget !== '' && minNum !== null && maxNum !== null && minNum >= maxNum) {
            setBudgetError(translations[currentLanguage].errorMessageBudget);
            hasError = true;
        } else setBudgetError('');

        if (adults < 1) {
            setAdultsError(translations[currentLanguage].errorMessageAdultsMinimum);
            hasError = true;
        } else setAdultsError('');

         // Validazione per i valori di bambini e animali (devono essere numeri non negativi o stringa vuota)
        if (isNaN(Number(children)) || isNaN(Number(pets)) || (children < 0) || (pets < 0)) { // Aggiunto check for negative numbers
             setNumberError(translations[currentLanguage].errorMessageNumber);
             hasError = true;
         } else setNumberError('');


        if (!hasError) {
            const checkInDateISO = checkInDate ? checkInDate.toISOString() : '';
            const checkOutDateISO = checkOutDate ? checkOutDate.toISOString() : '';
            router.push(
                `/search?q=${encodeURIComponent(destination)}&checkIn=${checkInDateISO}&checkOut=${checkInDateISO ? checkOutDateISO : ''}&minBudget=${minBudget}&maxBudget=${maxBudget}&lang=${currentLanguage}&adults=${adults}&children=${children}&pets=${pets}`
            );
        }
    };

    // Gestore per la pressione dei tasti (per gestire l'Enter)
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        // Impedisci l'invio del form con Enter se il focus non è su un input o bottone
        if (e.key === 'Enter') {
             const targetTagName = (e.target as HTMLElement).tagName;
             if (targetTagName !== 'INPUT' && targetTagName !== 'BUTTON') {
                 e.preventDefault();
                 handleSearchClick();
             }
        }
    };

    // Simbolo della valuta (non direttamente utilizzato nel layout corrente, ma presente nel codice originale)
    const currencySymbol = selectedCurrency
        ? new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 0 }).formatToParts(0)[0].value
        : '';


    // Gestore per il click su un suggerimento
    const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
        // --- FIX PER IL PROBLEMA DI RIAPERTURA ---
        isSelectingSuggestionRef.current = true; // Imposta il flag PRIMA di impostare lo stato
        // ------------------------------------------
        setDestination(suggestion.name); // Imposta la destinazione con il nome del suggerimento
        setSuggestions([]); // Cancella i suggerimenti
        setShowSuggestions(false); // Nascondi la lista suggerimenti
    };

    // Gestore per il click sul campo ospiti
    const handleGuestsClick = () => {
        setShowGuestsDropdown(true);
        // Nota: mettere il focus su un input readOnly potrebbe non essere utile.
    };

    // Funzione per aggiornare la label del campo ospiti
    const updateGuestsLabel = () => {
        const adultsLabel = `${adults} ${translations[currentLanguage].adults}`;
        const childrenLabel = children > 0 ? `, ${children} ${translations[currentLanguage].children}` : '';
        const petsLabel = pets > 0 ? `, ${pets} ${translations[currentLanguage].pets}` : ''; // Aggiunto controllo per pets > 0
        setGuestsLabel(`${adultsLabel}${childrenLabel}${petsLabel}`);
    };

    // Effetto per aggiornare la label ospiti quando cambiano i numeri
    useEffect(() => {
        updateGuestsLabel();
    }, [adults, children, pets, currentLanguage]);

    return (
        // Container principale con stili e gestore keydown
        <div style={containerStyle} onKeyDown={handleKeyDown} tabIndex={0} ref={errorRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Campo Destinazione */}
                <div style={{ position: 'relative' }}>
                    <FaMapMarkerAlt style={iconStyle} /> {/* Icona */}
                    <input
                        type="text" placeholder={translations[currentLanguage].searchPlaceholder} value={destination}
                        onChange={(e) => {
                            isSelectingSuggestionRef.current = false; // Resetta il flag quando l'utente digita manualmente
                            setDestination(e.target.value);
                        }}
                        style={{
                            ...fieldStyle, width: fieldWidthDestination, height: fieldHeightDestination,
                            borderColor: destinationError ? '#d32f2f' : (fieldStyle.border as string),
                             // Aggiunge padding a destra se c'è un valore per fare spazio alla 'x'
                            paddingRight: destination ? '40px' : '16px'
                        }}
                        autoComplete="off"
                         // Mostra i suggerimenti quando l'input è focalizzato, ma solo se c'è testo
                        onFocus={() => { if(destination) setShowSuggestions(suggestions.length > 0); }}
                         // Nasconde i suggerimenti quando l'input perde il focus, con un piccolo ritardo
                         // per permettere il click sul suggerimento prima che scompaia
                         onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Aumentato leggermente il ritardo
                    />
                    {/* Pulsante Clear per la destinazione */}
                     {destination && (
                        <button
                            onClick={(e) => { e.stopPropagation(); clearDestination(); }}
                            style={clearButtonStyle} // Usa lo stile per il pulsante di clear
                        >
                           <FaTimes style={{ fontSize: '0.8em' }} />
                        </button>
                     )}
                    {/* Lista dei suggerimenti (mostrata solo se showSuggestions è true e ci sono suggerimenti) */}
                    {showSuggestions && suggestions.length > 0 && (
                        <ul style={suggestionListStyle}>
                             {/* No check for suggestions.length > 0 needed here anymore */}
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i} onClick={() => handleSuggestionClick(s)}
                                        style={{
                                            ...suggestionItemStyle,
                                            ...(i % 2 === 0 ? {} : { backgroundColor: '#f8f8f8' }),
                                        }}
                                    >
                                        {s.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                     {/* Messaggio "Nessun suggerimento" (mostrato se showSuggestions è true, c'è testo e non ci sono suggerimenti) */}
                    {showSuggestions && destination && suggestions.length === 0 && (
                         <ul style={suggestionListStyle}>
                            <li style={{ ...suggestionItemStyle, fontStyle: 'italic' }}>
                                    {translations[currentLanguage].noSuggestions}
                            </li>
                         </ul>
                    )}
                    {destinationError && <div style={errorStyle}>{destinationError}</div>} {/* Messaggio di errore destinazione */}
                </div>

                {/* Campi Check-in e Check-out */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Campo Check-in */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <DatePicker
                            selected={checkInDate} onChange={(date) => setCheckInDate(date)} dateFormat="dd/MM/yyyy"
                            minDate={new Date()} placeholderText={translations[currentLanguage].checkInPlaceholder}
                             locale={currentLanguage} // Aggiunta prop locale per DatePicker
                            customInput={<CustomDateInput
                                value={checkInDate ? checkInDate.toLocaleDateString(currentLanguage) : ''} // Usa currentLanguage per formattazione
                                placeholder={translations[currentLanguage].checkInPlaceholder}
                                hasError={!!checkInError} height={fieldHeightCheckIn} onClear={clearCheckInDate} // Passa clear function
                            />}
                        />
                        {checkInError && <div style={errorStyle}>{checkInError}</div>} {/* Messaggio di errore */}
                    </div>
                    {/* Campo Check-out */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <DatePicker
                            selected={checkOutDate} onChange={(date) => setCheckOutDate(date)} dateFormat="dd/MM/yyyy"
                            minDate={checkInDate || new Date()} placeholderText={translations[currentLanguage].checkOutPlaceholder}
                            locale={currentLanguage} // Aggiunta prop locale per DatePicker
                            customInput={<CustomDateInput
                                value={checkOutDate ? checkOutDate.toLocaleDateString(currentLanguage) : ''} // Usa currentLanguage per formattazione
                                placeholder={translations[currentLanguage].checkOutPlaceholder}
                                hasError={!!checkOutError} height={fieldHeightCheckOut} onClear={clearCheckOutDate} // Passa clear function
                            />}
                        />
                        {checkOutError && <div style={errorStyle}>{checkOutError}</div>} {/* Messaggio di errore */}
                    </div>
                </div>

                {/* Campo Ospiti */}
                <div style={{ position: 'relative' }}>
                    <FaUsers style={iconStyle} /> {/* Icona */}
                    <input
                        ref={guestsInputRef}
                        type="text"
                        value={guestsLabel}
                        placeholder={translations[currentLanguage].guests}
                        onClick={handleGuestsClick} // Mostra dropdown al click
                        style={{ ...modernFieldStyle, width: fieldWidthDestination, height: fieldHeightDestination, cursor: 'pointer', paddingLeft: '40px' }}
                        readOnly // Campo di sola lettura, valore gestito dalla label
                    />
                    {/* Dropdown Ospiti (animato con AnimatePresence e motion) */}
                    <AnimatePresence>
                    {showGuestsDropdown && (
                        <motion.div
                            style={guestsDropdownStyle}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Riga Adulti */}
                            <div style={guestRowStyle}>
                                <span style={guestLabelStyle}>{translations[currentLanguage].adults}</span>
                                <div style={guestCountStyle}>
                                    <button
                                        style={{ ...countButtonStyle }}
                                        onClick={() => { if (adults > 1) handleAdultsChange(adults - 1); }}
                                        disabled={adults <= 1} // Disabilita se adulti è 1
                                    >
                                        <FaMinus />
                                    </button>
                                    <input
                                        type="text" // Usato text per maggiore controllo, validato in onChange
                                        value={adults}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val >= 1) {
                                                handleAdultsChange(val);
                                            } else if (e.target.value === '') { // Permetti di svuotare temporaneamente l'input
                                                handleAdultsChange(0); // O un altro indicatore di input non valido
                                            }
                                        }}
                                        style={numberInputStyle}
                                        min="1" // Attributo min per input type="number", anche se qui è text
                                    />
                                    <button
                                        style={{ ...countButtonStyle }}
                                        onClick={() => handleAdultsChange(adults + 1)}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                            {adultsError && <div style={errorStyle}>{adultsError}</div>} {/* Messaggio di errore */}

                            {/* Riga Bambini */}
                            <div style={guestRowStyle}>
                                <span style={guestLabelStyle}>{translations[currentLanguage].children}</span>
                                <div style={guestCountStyle}>
                                    <button
                                        style={{ ...countButtonStyle }}
                                        onClick={() => { if (children > 0) handleChildrenChange(children - 1); }}
                                        disabled={children <= 0} // Disabilita se bambini è 0
                                    >
                                        <FaMinus />
                                    </button>
                                    <input
                                        type="text" // Usato text per maggiore controllo
                                        value={children}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val >= 0) {
                                                handleChildrenChange(val);
                                            } else if (e.target.value === '') {
                                                handleChildrenChange(0);
                                            }
                                        }}
                                        style={numberInputStyle}
                                        min="0" // Attributo min per input type="number"
                                    />
                                    <button
                                        style={{ ...countButtonStyle }}
                                        onClick={() => handleChildrenChange(children + 1)}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            {/* Riga Animali */}
                            <div style={guestRowStyle}>
                                <span style={guestLabelStyle}>{translations[currentLanguage].pets}</span>
                                <div style={guestCountStyle}>
                                    <button
                                        style={{ ...countButtonStyle }}
                                        onClick={() => { if (pets > 0) handlePetsChange(pets - 1); }}
                                        disabled={pets <= 0} // Disabilita se animali è 0
                                    >
                                        <FaMinus />
                                    </button>
                                    <input
                                        type="text" // Usato text per maggiore controllo
                                        value={pets}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val >= 0) {
                                                handlePetsChange(val);
                                            } else if (e.target.value === '') {
                                                handlePetsChange(0);
                                            }
                                        }}
                                        style={numberInputStyle}
                                        min="0" // Attributo min per input type="number"
                                    />
                                    <button
                                        style={{ ...countButtonStyle }}
                                        onClick={() => handlePetsChange(pets + 1)}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                             {/* Messaggio di errore per input numerici non validi */}
                             {numberError && <div style={errorStyle}>{numberError}</div>}

                            {/* Pulsante Chiudi dropdown */}
                            <button
                                style={{ ...closeButtonStyle }}
                                onClick={() => setShowGuestsDropdown(false)}
                            >
                                {translations[currentLanguage].close}
                            </button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                {/* Campi Budget Minimo e Massimo */}
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {/* Campo Budget Minimo */}
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaMoneyBillWave style={iconStyle} /> {/* Icona */}
                            <input
                                type="text" value={minBudget} onChange={handleMinBudgetChange}
                                placeholder={`${translations[currentLanguage].budgetMinPlaceholder}`}
                                style={{
                                    ...fieldStyle, width: fieldWidthBudget, height: fieldHeightBudget,
                                    borderColor: budgetError ? '#d32f2f' : (fieldStyle.border as string),
                                     // Aggiunge padding a destra se c'è un valore per fare spazio alla 'x'
                                    paddingRight: minBudget ? '40px' : '16px'
                                }}
                            />
                             {/* Pulsante Clear per il budget minimo */}
                            {minBudget && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearMinBudget(); }}
                                    style={clearButtonStyle} // Usa lo stile per il pulsante di clear
                                >
                                <FaTimes style={{ fontSize: '0.8em' }} />
                                </button>
                            )}
                        </div>
                        {/* Campo Budget Massimo */}
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaMoneyBillWave style={iconStyle} /> {/* Icona */}
                            <input
                                type="text" value={maxBudget} onChange={handleMaxBudgetChange}
                                placeholder={`${translations[currentLanguage].budgetMaxPlaceholder}`}
                                style={{
                                    ...fieldStyle, width: fieldWidthBudget, height: fieldHeightBudget,
                                    borderColor: budgetError ? '#d32f2f' : (fieldStyle.border as string),
                                     // Aggiunge padding a destra se c'è un valore per fare spazio alla 'x'
                                    paddingRight: maxBudget ? '40px' : '16px'
                                }}
                            />
                             {/* Pulsante Clear per il budget massimo */}
                            {maxBudget && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearMaxBudget(); }}
                                    style={clearButtonStyle} // Usa lo stile per il pulsante di clear
                                >
                                <FaTimes style={{ fontSize: '0.8em' }} />
                                </button>
                            )}
                        </div>
                    </div>
                    {budgetError && <div style={errorStyle}>{budgetError}</div>} {/* Messaggio di errore */}
                </div>

                {/* Pulsante Cerca */}
                <button
                    style={{ ...buttonStyle }} onClick={handleSearchClick}
                    // Rimosso onMouseEnter/onMouseLeave perché gli stili hover inline non funzionano così
                >
                    {translations[currentLanguage].searchButton}
                </button>
            </div>
        </div>
    );
};

export default BookingSearch;