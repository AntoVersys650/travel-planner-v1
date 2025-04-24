'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
    FaMapMarkerAlt,
    FaUsers,
    FaChild,
    FaPaw,
    FaMoneyBillWave
} from 'react-icons/fa';
import {  } from 'lucide-react'; // Removed Group
import { Users } from 'lucide-react'; // Added Users
import { ChevronDown, Globe } from 'lucide-react'; // Importa anche Globe
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import Button from 'src/app/components/ui/button';
import Input from 'src/app/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
registerLocale('it', it);
import HeaderComponent from 'src/app/components/Header';

// Importa la modale dalla posizione corretta indicata dall'utente
import LocationFilterModal from 'src/app/search/LocationFilterModal';


// Mock suggestions generator
type Suggestion = string;
const generateTravelSuggestions = async (): Promise<Suggestion[]> => {
    await new Promise(res => setTimeout(res, 1000));
    return ['Suggerimento 1', 'Suggerimento 2', 'Suggerimento 3'];
};

// GuestsPicker component (nessuna modifica necessaria qui per il bug display label)
const GuestsPicker = ({
    adults,
    children,
    animals,
    setAdults,
    setChildren,
    setAnimals,
    onClose,
    translations
}: {
    adults: number;
    children: number;
    animals: number;
    setAdults: (n: number) => void;
    setChildren: (n: number) => void;
    setAnimals: (n: number) => void;
    onClose: () => void;
    translations: Record<string, string>;
}) =>
{
    return (
        <div className="p-4 bg-white rounded-lg shadow-lg w-72 space-y-4">
            {[
                { icon: FaUsers, label: translations.adults, value: adults, setter: setAdults, min: 1 },
                { icon: FaChild, label: translations.children, value: children, setter: setChildren, min: 0 },
                { icon: FaPaw, label: translations.pets, value: animals, setter: setAnimals, min: 0 }
            ].map(({ icon: Icon, label, value, setter, min }, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span>{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => setter(Math.max(min, value - 1))}>-</Button>
                        <span>{value}</span>
                        <Button size="icon" variant="outline" onClick={() => setter(value + 1)}>+</Button>
                    </div>
                </div>
            ))}
            <Button className="w-full mt-4" onClick={onClose}>
                {translations.confirm}
            </Button>
        </div>
    );
};

const CalendarComponent: React.FC<{
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    placeholder: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}> = ({ selected, onSelect, placeholder, className, minDate, maxDate }) => {
    const [inputWidth, setInputWidth] = useState<string>('100%');
    const inputRef = useRef<HTMLButtonElement>(null);


    useEffect(() => {
        const updateWidth = () => {
            if (typeof window !== 'undefined') {
                const parentElement = document.querySelector('.date-input-container');
                if (parentElement) {
                    const width = parentElement.getBoundingClientRect().width;
                    setInputWidth(`${width}px`);
                } else {
                    setInputWidth('100%');
                }
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);
    const formatDate = (date: Date | undefined) => {
        if (!date) return placeholder;
        return format(date, 'dd/MM/yyyy', { locale: it });
    };

    const CustomInput = React.forwardRef<HTMLInputElement, { value?: string; onClick?: () => void; placeholder: string }>(
        ({ value, onClick, placeholder: customPlaceholder }, ref) => (
            <Button
                variant="outline"
                ref={ref as any}
                onClick={onClick}
                className={cn(
                    "w-full justify-start text-left font-normal flex items-center",
                    !value && 'text-muted-foreground',
                    className
                )}
                style={{ width: inputWidth }}

            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value || customPlaceholder}
            </Button>
        )
    );
    CustomInput.displayName = 'CustomInput';

    return (
        <DatePicker
            selected={selected}
            onChange={onSelect}
            dateFormat="dd/MM/yyyy"
            placeholderText={placeholder}
            minDate={minDate}
            maxDate={maxDate}
            locale="it"
            customInput={<CustomInput placeholder={placeholder} />}
            className="w-full"
        />
    );
};

export default function SearchPage() {
    const params = useSearchParams();
    const router = useRouter();
    const q = params.get('q') || '';
    const cIn = params.get('checkIn');
    const cOut = params.get('checkOut');
    const gP = params.get('guests') || '1,0,0';
    const minB = params.get('minBudget') || '0';
    const maxB = params.get('maxBudget') || '10000';

    const [location, setLocation] = useState(q);
    const [checkInDate, setCheckInDate] = useState<Date | null>(cIn ? new Date(cIn) : null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(cOut ? new Date(cOut) : null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [animals, setAnimals] = useState(0);
    const [minBudget, setMinBudget] = useState<number>(parseInt(minB, 10));
    const [maxBudget, setMaxBudget] = useState<number>(parseInt(maxB, 10));
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showGuests, setShowGuests] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [inputWidth, setInputWidth] = useState<string>('100%');
    const [checkInOutWidth, setCheckInOutWidth] = useState<string>('calc(50% - 12px)'); // Usiamo calc per precisione con gap
    const [formAlignment, setFormAlignment] = useState<'left' | 'center' | 'right'>('left');
    const [isClient, setIsClient] = useState(false);
    const today = new Date();
    const [currency, setCurrency] = useState('€'); // Default currency, get from Header
    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [headerOffset, setHeaderOffset] = useState(110); // Corrected header offset
    //const headerOffset = 80; // Fixed header offset - Now using state

     // Nuovo stato per la label mostrata nel campo ospiti
    const [guestsDisplayLabel, setGuestsDisplayLabel] = useState('');
    // Nuovo stato per controllare la visibilità della modale personalizzazione
    const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
     // Nuovo stato per salvare i continenti selezionati dalla modale
     const [selectedContinents, setSelectedContinents] = useState<string[]>([]);


    const translationsSet = {
        guests: 'Ospiti',
        adults: 'Adulti',
        children: 'Bambini',
        pets: 'Animali',
        confirm: 'Conferma',
        searchTitle: 'Risultati',
        travelSuggestionsTitle: 'Suggerimenti di Viaggio',
        personalizeSearchTitle: 'Personalizza la tua ricerca', // Nuovo titolo
        initiateButton: 'Avvia', // Testo per il pulsante "Avvia" (sarà tradotto in base alla lingua header)
        // goButton: 'VAI', // Rimosso il vecchio "VAI"
         selectLocationPlaceholder: 'Seleziona Continente, Paese, Regione...', // Placeholder per il campo personalizza
    };

     // Dati di esempio per i continenti (copia da LocationFilterModal per mostrare il nome nel campo input)
     const continentsData = [
        { id: 'africa', name: 'Africa' },
        { id: 'asia', name: 'Asia' },
        { id: 'europe', name: 'Europa' },
        { id: 'north-america', name: 'Nord America' },
        { id: 'south-america', name: 'Sud America' },
        { id: 'oceania', name: 'Oceania' },
    ];

     // Effetto per aggiornare la label visualizzata nel campo personalizza
     const locationFilterLabel = selectedContinents.length > 0
         ? selectedContinents.map(id => continentsData.find(c => c.id === id)?.name).join(', ')
         : translationsSet.selectLocationPlaceholder;


    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, []);

    useEffect(() => {
        setIsClient(typeof window !== 'undefined');
        const [a, c, an] = gP.split(',').map(Number);
        setAdults(a);
        setChildren(c);
        setAnimals(an);
    }, [gP]);

     // Effetto per aggiornare la label visualizzata quando adulti, bambini o animali cambiano
    useEffect(() => {
        const adultsLabel = `${adults} ${translationsSet.adults}`;
        const childrenLabel = children > 0 ? `, ${children} ${translationsSet.children}` : '';
        const petsLabel = animals > 0 ? `, ${animals} ${translationsSet.pets}` : ''; // Usiamo 'animals' per coerenza
        setGuestsDisplayLabel(`${adultsLabel}${childrenLabel}${petsLabel}`);
    }, [adults, children, animals, translationsSet.adults, translationsSet.children, translationsSet.pets]);


    useEffect(() => {
        if (!q) router.push('/');
    }, [q, router]);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setInputWidth(`${containerWidth}px`);
                 // Aggiornato il calcolo della larghezza per i campi data/budget
                const gap = 24; // Gap tra i campi check-in/out e budget (16px * 1.5 circa)
                const fieldWidth = (containerWidth - gap) / 2;
                setCheckInOutWidth(`${fieldWidth}px`);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    useEffect(() => {
        // Get currency from localStorage (or default to '€')
        const storedCurrency = typeof window !== 'undefined' ? localStorage.getItem('selectedCurrency') : null;
        if (storedCurrency) {
            setCurrency(storedCurrency);
        }
         // Aggiungi listener per l'evento custom 'currencyChange' dal Header
        const handleCurrencyChange = (event: CustomEvent) => {
            setCurrency(event.detail);
        };
        window.addEventListener('currencyChange', handleCurrencyChange as EventListener);

        return () => {
             window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
        };

    }, []);


    useEffect(() => {
        setLoading(true);
        generateTravelSuggestions().then(res => {
            setSuggestions(res);
            setLoading(false);
        });
    }, [location, checkInDate, checkOutDate, adults, children, animals, minBudget, maxBudget]);

    if (!isClient) return <div>Loading...</div>;

    // Funzione per formattare il budget visualizzato (opzionale, se vuoi una label nel campo budget)
    const formatBudget = (budget: number | string) => {
         if (budget === '' || isNaN(Number(budget))) return '';
         // Assumendo che currentLanguage sia disponibile in page.tsx per la formattazione locale
         const currentLanguage = typeof window !== 'undefined' && navigator.language ? navigator.language : 'en-US'; // Fallback a 'en-US'
         return `${Number(budget).toLocaleString(currentLanguage)}${currency}`; // Formatta il numero e aggiunge la valuta
    };


    // Funzione per gestire il salvataggio dalla modale
    const handleLocationFilterSave = (selectedContinentsFromModal: string[]) => {
        console.log("handleLocationFilterSave called with:", selectedContinentsFromModal);
        setSelectedContinents(selectedContinentsFromModal); // Aggiorna lo stato con i continenti selezionati
        setShowPersonalizeModal(false); // Chiude la modale
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Passiamo l'altezza minima desiderata all'Header */}
            <HeaderComponent ref={headerRef} minHeight="90px" /> {/* Esempio di utilizzo */}
            <div className="container mx-auto px-4 flex flex-col md:flex-row" style={{ marginTop: `${headerHeight + headerOffset}px` }} ref={containerRef}>
                {/* Sezione di Sinistra (Form di Ricerca) */}
                <div
                    className={cn(
                        "md:w-1/3 p-6 bg-white rounded shadow space-y-6",
                        formAlignment === 'left' && 'mr-auto',
                        formAlignment === 'center' && 'mx-auto',
                        formAlignment === 'right' && 'ml-auto'
                    )}
                    style={{
                        marginLeft: formAlignment === 'left' ? '0' : undefined,
                        marginRight: formAlignment === 'right' ? '0' : undefined,
                        margin: formAlignment === 'center' ? '0 auto' : undefined
                    }}
                >
                    {/* Località */}
                    <div>
                        <label className="block text-sm font-medium">Destinazione</label>
                        <div className="relative mt-1">
                            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <Input
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="pl-10 w-full"
                                placeholder="Località"
                            />
                        </div>
                    </div>

                    {/* Check-in e Check-out */}
                    <div className="flex justify-between gap-4">
                        <div className="date-input-container" style={{ width: checkInOutWidth }}>
                            <label className="block text-sm font-medium">Check-in</label>
                            <CalendarComponent
                                selected={checkInDate}
                                onSelect={setCheckInDate}
                                placeholder="Check-in"
                                minDate={today}
                                className="w-full"
                            />
                        </div>
                        <div className="date-input-container" style={{ width: checkInOutWidth }}>
                            <label className="block text-sm font-medium">Check-out</label>
                            <CalendarComponent
                                selected={checkOutDate}
                                onSelect={setCheckOutDate}
                                placeholder="Check-out"
                                minDate={checkInDate || today}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Ospiti - Modificato per usare guestsDisplayLabel */}
                    <div>
                        <label className="block text-sm font-medium">{translationsSet.guests}</label>
                        <div className="relative mt-1">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" /> {/* Replaced Group with Users */}
                            <Popover open={showGuests} onOpenChange={setShowGuests}>
                                <PopoverTrigger asChild>
                                    <div className="relative w-full">
                                        <Input
                                            readOnly
                                            value={guestsDisplayLabel} // Usa lo stato della label
                                            placeholder={translationsSet.guests}
                                            className="pl-10 cursor-pointer w-full"
                                        />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent sideOffset={5} className="p-0 z-50 mt-1">
                                    <GuestsPicker
                                        adults={adults}
                                        children={children}
                                        animals={animals} // Assicurati che questo sia 'animals' o 'pets' in base al tuo stato
                                        setAdults={setAdults}
                                        setChildren={setChildren}
                                        setAnimals={setAnimals} // Assicurati che questo sia 'setAnimals' o 'setPets'
                                        onClose={() => setShowGuests(false)}
                                        translations={translationsSet}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="flex justify-between gap-4">
                        <div style={{ flex: 1 }}> {/* Rimosso classe .date-input-container e style width fisso */}
                            <label className="block text-sm font-medium">Budget Minimo</label>
                            <div className="relative mt-1">
                                <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="number"
                                    value={minBudget === 0 ? '' : minBudget} // Visualizza vuoto se 0
                                    onChange={e => setMinBudget(parseInt(e.target.value, 10) || 0)} // Parsa come numero, default 0
                                    className="pl-10 w-full"
                                    placeholder={`Min (${currency})`}
                                />
                            </div>
                        </div>
                        <div style={{ flex: 1 }}> {/* Rimosso classe .date-input-container e style width fisso */}
                            <label className="block text-sm font-medium">Budget Massimo</label>
                            <div className="relative mt-1">
                                <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="number"
                                     value={maxBudget === 0 ? '' : maxBudget} // Visualizza vuoto se 0
                                    onChange={e => setMaxBudget(parseInt(e.target.value, 10) || 0)} // Parsa come numero, default 0
                                    className="pl-10 w-full"
                                    placeholder={`Max (${currency})`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            className="bg-blue-500 text-white w-full"
                            onClick={() => router.push(
                                `/search?q=${location}` +
                                `${checkInDate ? `&checkIn=${format(checkInDate, 'yyyy-MM-dd')}` : ''}` +
                                `${checkOutDate ? `&checkOut=${format(checkOutDate, 'yyyy-MM-dd')}` : ''}` +
                                `&guests=${adults},${children},${animals}` +
                                `&minBudget=${minBudget}&maxBudget=${maxBudget}` // Passiamo i valori numerici convertiti
                            )}
                        >
                            Cerca
                        </Button>
                    </div>
                </div>

                {/* Sezione di Destra (Risultati e Personalizzazione) */}
                <div className="md:w-2/3 p-6 space-y-6"> {/* Aggiunto space-y-6 per spaziatura verticale */}
                    {/* Sezione Risultati (esistente) */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">{translationsSet.searchTitle}</h2>
                        <h3 className="text-xl font-semibold mb-2">{translationsSet.travelSuggestionsTitle}</h3>
                        {loading ? <p>Generazione in corso...</p> : (
                            <ul className="list-disc list-inside space-y-2">
                                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        )}
                    </div>

                    {/* Nuova Sezione Personalizza la Tua Ricerca */}
                    <div className="border-t pt-6"> {/* Aggiunto bordo superiore e padding */}
                         <h3 className="text-xl font-semibold mb-4">{translationsSet.personalizeSearchTitle}</h3>
                         <div className="flex items-center gap-4">
                            {/* Campo che aprirà la modale - con Icona */}
                            <div style={{ position: 'relative', flexGrow: 1 }}> {/* Container per icona e input */}
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={20} /> {/* Icona Globe */}
                                <Input
                                    readOnly
                                    value={locationFilterLabel} // Usa la label basata sui continenti selezionati
                                    placeholder={translationsSet.selectLocationPlaceholder} // Testo placeholder
                                    className="pl-10 cursor-pointer w-full" // Aumenta padding a sinistra per icona
                                    onClick={() => {
                                         console.log("Opening personalize modal"); // Log per debug apertura
                                         setShowPersonalizeModal(true);
                                    }} // Apre la modale al click
                                />
                            </div>
                            {/* Pulsante Avvia (apre la modale) */}
                             <Button onClick={() => {
                                  console.log("Opening personalize modal (button)"); // Log per debug apertura
                                  setShowPersonalizeModal(true);
                              }}> {/* Apre la modale al click */}
                                {/* Usa la traduzione per "Avvia" */}
                                {translationsSet.initiateButton}
                            </Button>
                         </div>
                    </div>

                </div>
            </div>

            {/* Modale Personalizza Ricerca */}
            {showPersonalizeModal && ( // Renderizza condizionalmente
                 <LocationFilterModal
                     isOpen={showPersonalizeModal}
                     onClose={() => {
                          console.log("Closing personalize modal"); // Log per debug chiusura
                         setShowPersonalizeModal(false);
                     }}
                     onSave={handleLocationFilterSave} // Passa la funzione di salvataggio (VERIFICA QUESTO!)
                     initialSelectedContinents={selectedContinents} // Passa i continenti selezionati per l'inizializzazione
                 />
            )}

        </div>
    );
}