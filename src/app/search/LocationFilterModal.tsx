import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa'; // Icona per chiudere
import { ChevronDown, Globe } from 'lucide-react'; // Icona freccia e Globo

// Importa le funzioni necessarie dalla libreria react-country-state-city
import {
    getAllContinents,
    getCountriesByContinent,
    // Potresti aver bisogno di importare altre funzioni o tipi se necessari in futuro (es. getStatesByCountry)
} from 'react-country-state-city';

// Rimuoviamo i dati hardcoded:
// const continentsData = [ ... ];
// const countriesData = [ ... ];


interface LocationFilterModalProps {
    /** Controlla se la modale è aperta. */
    isOpen: boolean;
    /** Funzione da chiamare per chiudere la modale. */
    onClose: () => void;
    /** Funzione da chiamare quando si confermano le selezioni. Riceve gli array di ID dei continenti e paesi selezionati. */
    onSave: (selectedContinents: string[], selectedCountries: string[]) => void;
    /** I continenti inizialmente selezionati (ad esempio, caricati dallo stato di page.tsx). */
    initialSelectedContinents?: string[];
     /** I paesi inizialmente selezionati (ad esempio, caricati dallo stato di page.tsx). */
     initialSelectedCountries?: string[];
    // Aggiungeremo qui le props per gestire le selezioni e i dati di regioni in futuro
}

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({
    isOpen,
    onClose,
    onSave, // Riceviamo la prop onSave
    initialSelectedContinents = [], // Usa un array vuoto come default
    initialSelectedCountries = [], // Usa un array vuoto come default
}) => {
    // Stato per gestire la visibilità del dropdown dei continenti
    const [isContinentDropdownOpen, setIsContinentDropdownOpen] = useState(false);
    // Stato per gestire i continenti selezionati (lista di id)
    const [selectedContinents, setSelectedContinents] = useState<string[]>(initialSelectedContinents);

    // Stato per gestire la visibilità del dropdown dei paesi
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    // Stato per gestire i paesi selezionati (lista di id)
    const [selectedCountries, setSelectedCountries] = useState<string[]>(initialSelectedCountries);

    // Otteniamo la lista dei continenti dalla libreria
    const continentsData = getAllContinents();

    // Otteniamo la lista completa dei paesi dalla libreria (ci servirà per mostrare il nome nel label)
    // NOTA: La libreria non ha una funzione getAllCountries, quindi potremmo doverli raccogliere
    // o ottenere i nomi in modo diverso se necessario per la label del trigger.
    // Per ora, usiamo getCountriesByContinent per il dropdown filtrato.
     const allCountriesData = continentsData.flatMap(continent => getCountriesByContinent(continent.id)); // Raccogli tutti i paesi


    const continentDropdownRef = useRef<HTMLDivElement>(null); // Ref per rilevare click fuori dropdown Continenti
    const countryDropdownRef = useRef<HTMLDivElement>(null); // Ref per rilevare click fuori dropdown Paesi


    // Sincronizza lo stato interno della modale con le prop iniziali all'apertura
    useEffect(() => {
        if (isOpen) {
            console.log('Modal opened. Syncing initial state:', {initialSelectedContinents, initialSelectedCountries});
            setSelectedContinents(initialSelectedContinents);
            setSelectedCountries(initialSelectedCountries);
        } else {
            console.log('Modal closed.');
        }
    }, [isOpen, initialSelectedContinents, initialSelectedCountries]); // Dipende da isOpen e dalle prop iniziali

    // Gestisce la chiusura dei dropdown cliccando fuori
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Chiudi dropdown Continenti se il click è fuori
            if (continentDropdownRef.current && !continentDropdownRef.current.contains(event.target as Node)) {
                setIsContinentDropdownOpen(false);
                 console.log('Clicked outside continent dropdown. Closing.');
            }
            // Chiudi dropdown Paesi se il click è fuori
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                 setIsCountryDropdownOpen(false);
                 console.log('Clicked outside country dropdown. Closing.');
             }
        };
        // Aggiungi listener solo quando la modale è aperta
        if (isOpen) {
             document.addEventListener('mousedown', handleClickOutside);
             console.log('Adding mousedown listener for dropdowns.');
        }


        return () => {
             // Rimuovi listener al cleanup o quando la modale si chiude
             document.removeEventListener('mousedown', handleClickOutside);
             console.log('Cleanup mousedown listener for dropdowns.');
        };
    }, [isOpen]); // Dipende da isOpen per aggiungere/rimuovere il listener principale


    // Impedisce lo scroll del body quando la modale è aperta
    useEffect(() => {
        console.log('useEffect [isOpen] for body scroll triggered. isOpen:', isOpen);
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset';
        }
        return () => {
          document.body.style.overflow = 'unset';
        };
      }, [isOpen]);


    // Non renderizzare nulla se la modale non è aperta
    if (!isOpen) {
         console.log('Modal is not open. Rendering null.');
        return null;
    }

    // Stili base per la modale (puoi adattarli alle tue classi CSS/design system)
    const modalBackdropStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Sfondo semi-trasparente
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000, // Assicurati che sia sopra gli altri contenuti
        // Permette al click sul backdrop di chiudere la modale
        cursor: 'pointer',
    };

    const modalContentStyle: React.CSSProperties = {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // Spazio tra gli elementi interni
        maxWidth: '500px', // Larghezza massima della modale
        width: '90%', // Larghezza su schermi più piccoli
        position: 'relative',
        maxHeight: '90vh', // Altezza massima, con scroll se necessario
        overflowY: 'auto', // Aggiunge scroll se il contenuto supera l'altezza massima
         // Impedisce al click sul contenuto di propagarsi al backdrop
        cursor: 'default',
    };

    const closeButtonStyle: React.CSSProperties = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#555',
        zIndex: 10, // Assicura che il pulsante sia cliccabile
    };

    const picklistSectionStyle: React.CSSProperties = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        position: 'relative', // Importante per posizionare il dropdown assoluto
        zIndex: 1, // Assicura che la sezione picklist sia sopra altri elementi con z-index inferiore
    };

    const picklistTitleStyle: React.CSSProperties = {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#333',
    };

     const okButtonStyle: React.CSSProperties = { // Rinomino lo stile
         backgroundColor: '#007bff',
         color: '#fff',
         padding: '12px 24px',
         border: 'none',
         borderRadius: '8px',
         cursor: 'pointer',
         fontSize: '18px',
         marginTop: '10px', // Spazio sopra il pulsante
         alignSelf: 'center', // Centra il pulsante nella colonna
     };

     // Stili per l'input finto/trigger del dropdown
     const dropdownTriggerStyle: React.CSSProperties = {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px 15px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
     };

     // Stili per la lista del dropdown - AUMENTATO Z-INDEX
     const dropdownListStyle: React.CSSProperties = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
        zIndex: 100, // Aumentato per garantirne la visualizzazione sopra altri elementi nella modale
        maxHeight: '150px', // Altezza massima con scroll
        overflowY: 'auto',
        marginTop: '5px', // Spazio tra trigger e lista
        listStyle: 'none', // Rimuovi pallini lista
        padding: 0, // Rimuovi padding default lista
     };

    // Gestisce la selezione/deselezione di un continente
    const handleContinentSelect = (continentId: string) => {
         console.log('handleContinentSelect called for ID:', continentId);
        setSelectedContinents(prevSelected => {
             console.log('handleContinentSelect - Previous selected:', prevSelected);
             const newSelected = prevSelected.includes(continentId)
                 ? prevSelected.filter(id => id !== continentId) // Deseleziona se già presente
                 : [...prevSelected, continentId]; // Seleziona se non presente
             console.log('handleContinentSelect - New selected:', newSelected);

             // Quando i continenti cambiano, resettiamo i paesi selezionati
             // Questo evita di avere paesi selezionati che non appartengono più ai continenti selezionati
             setSelectedCountries([]);
             console.log('Continent selection changed, resetting selected countries.');

             return newSelected;
        });
         // Non chiudere il dropdown immediatamente dopo la selezione multipla
        // setIsContinentDropdownOpen(false); // Rimosso chiusura immediata
    };

     // Stringa da mostrare nel trigger del dropdown dei continenti
    const continentTriggerLabel = selectedContinents.length > 0
        ? selectedContinents.map(id => {
             // Troviamo il nome del continente dall'ID numerico (convertito in stringa nello stato)
             const continent = continentsData.find(c => c.id === parseInt(id, 10)); // La libreria usa ID numerici per i continenti
             return continent ? continent.name : id; // Mostra il nome o l'ID se non trovato
         }).join(', ')
        : 'Seleziona Continente/i';

    // Filtra i paesi in base ai continenti selezionati utilizzando la funzione della libreria
    const filteredCountries = selectedContinents.length > 0
        // Mappa gli ID stringa selezionati in ID numerici per la funzione della libreria
        ? selectedContinents.flatMap(continentId => {
             const id = parseInt(continentId, 10);
             console.log(`Fetching countries for continent ID: ${id}`);
             // getCountriesByContinent(id) restituisce un array di paesi per quell'ID di continente
             return getCountriesByContinent(id);
         })
        : []; // Se nessun continente è selezionato, la lista dei paesi filtrati è vuota


    // Gestisce la selezione/deselezione di un paese
    const handleCountrySelect = (countryId: string) => {
         console.log('handleCountrySelect called for ID:', countryId);
         setSelectedCountries(prevSelected => {
             console.log('handleCountrySelect - Previous selected:', prevSelected);
             const newSelected = prevSelected.includes(countryId)
                 ? prevSelected.filter(id => id !== countryId) // Deseleziona se già presente
                 : [...prevSelected, countryId]; // Seleziona se non presente
             console.log('handleCountrySelect - New selected:', newSelected);
             return newSelected;
         });
         // Non chiudere il dropdown dei paesi immediatamente dopo la selezione multipla
         // setIsCountryDropdownOpen(false); // Rimosso
    };

     // Stringa da mostrare nel trigger del dropdown dei paesi
     const countryTriggerLabel = selectedCountries.length > 0
         ? selectedCountries.map(id => {
              // Dobbiamo trovare il nome del paese usando l'ID. allCountriesData contiene tutti i paesi.
             const country = allCountriesData.find(c => c.id === parseInt(id, 10)); // ID numerico per paesi
             return country ? country.name : id; // Mostra il nome o l'ID se non trovato
         }).join(', ')
         : (selectedContinents.length > 0 ? 'Seleziona Paese/i' : 'Seleziona Continente prima'); // Testo diverso se nessun continente selezionato


    // Funzione chiamata quando si clicca su OK
    const handleOkClick = () => {
        console.log('OK button clicked. Saving selected continents and countries:', {selectedContinents, selectedCountries});
         // Verifica se onSave è una funzione prima di chiamarla
         if (typeof onSave === 'function') {
             // Passa una COPIA di ENTRAMBI gli stati interni al padre
             onSave([...selectedContinents], [...selectedCountries]);
         } else {
             console.error('Error: onSave is not a function', onSave);
             // Potresti voler gestire l'errore in modo più visibile qui
         }

        setIsContinentDropdownOpen(false); // Chiudi il dropdown dei continenti
        setIsCountryDropdownOpen(false); // Chiudi il dropdown dei paesi
        onClose(); // Chiude la modale
    };

    console.log('Rendering LocationFilterModal. Current selectedContinents state:', selectedContinents, ' Current selectedCountries state:', selectedCountries);
    // *** LOG DI DEBUG *** Mostra la lunghezza di selectedContinents per la logica di abilitazione Paesi
    console.log('Country dropdown enabled condition (selectedContinents.length > 0):', selectedContinents.length > 0, ' selectedContinents length:', selectedContinents.length);


    return (
        // Backdrop della modale (click fuori chiude la modale)
        <motion.div
            style={modalBackdropStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose} // Chiude la modale cliccando sullo sfondo
        >
            {/* Contenuto della modale (click dentro non chiude la modale) */}
            <motion.div
                style={modalContentStyle}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()} // Impedisce la propagazione del click al backdrop
            >
                {/* Pulsante di chiusura */}
                <button style={closeButtonStyle} onClick={onClose} aria-label="Chiudi modale">
                    <FaTimes />
                </button>

                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Personalizza la tua ricerca</h2>

                {/* Sezione Continente - Implementazione Dropdown con dati libreria */}
                {/* Aumentato un po' lo z-index per la sezione stessa per sicurezza, anche se il dropdown ha z-index alto */}
                <div style={{...picklistSectionStyle, zIndex: 10}} ref={continentDropdownRef}>
                    <h3 style={picklistTitleStyle}>Seleziona Continente/i</h3>
                    {/* Trigger del Dropdown */}
                    <div style={dropdownTriggerStyle} onClick={() => setIsContinentDropdownOpen(!isContinentDropdownOpen)}>
                        <span style={{ flexGrow: 1, color: selectedContinents.length > 0 ? '#333' : '#666' }}>{continentTriggerLabel}</span>
                        <ChevronDown style={{ transform: isContinentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                    </div>

                    {/* Lista del Dropdown (animata) */}
                    <AnimatePresence>
                        {isContinentDropdownOpen && (
                            <motion.div
                                style={dropdownListStyle} // Usa lo stile con z-index aumentato
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Usa continentsData dalla libreria */}
                                {continentsData.map(continent => {
                                     // La libreria usa ID numerici per i continenti
                                     const continentIdString = continent.id.toString(); // Converti in stringa per lo stato selezionato
                                     const isChecked = selectedContinents.includes(continentIdString);
                                     console.log(`Rendering checkbox for ${continent.name} (ID: ${continentIdString}). Checked:`, isChecked);
                                     return (
                                        // Usiamo un label associato alla checkbox per migliorare l'usabilità
                                        // La key è sull'elemento esterno che renderizza
                                        <label key={continent.id} htmlFor={`continent-${continent.id}`}
                                               style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', cursor: 'pointer', hover: { backgroundColor: '#f0f0f0' } }}>
                                            <input
                                                type="checkbox"
                                                id={`continent-${continent.id}`}
                                                checked={isChecked} // Usa la variabile locale
                                                // Chiamiamo handleContinentSelect con l'ID stringa
                                                onChange={() => handleContinentSelect(continentIdString)}
                                                style={{ marginRight: '10px', cursor: 'pointer' }}
                                            />
                                            <span style={{ flexGrow: 1 }}>{continent.name}</span>
                                        </label>
                                     );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sezione Paese - Implementazione Dropdown con dati libreria e filtro */}
                 {/* Z-index aumentato per questa sezione per gestirne l'impilamento */}
                 <div style={{...picklistSectionStyle, zIndex: 9}} ref={countryDropdownRef}> {/* Z-index leggermente inferiore al Continente */}
                     <h3 style={picklistTitleStyle}>Seleziona Paese/i</h3>
                     {/* Trigger del Dropdown Paesi */}
                     {/* Disabilita il click se nessun continente è selezionato */}
                     {/* *** LOG DI DEBUG *** Verifica la condizione di abilitazione qui */}
                     <div
                        style={{
                             ...dropdownTriggerStyle,
                             cursor: selectedContinents.length > 0 ? 'pointer' : 'not-allowed', // Cambia cursore se disabilitato
                             opacity: selectedContinents.length > 0 ? 1 : 0.6, // Riduci opacità se disabilitato
                         }}
                         onClick={() => {
                             console.log('Country dropdown trigger clicked.');
                             // Abilita click solo se almeno un continente è selezionato
                             if (selectedContinents.length > 0) {
                                 setIsCountryDropdownOpen(!isCountryDropdownOpen);
                                 console.log('Country dropdown toggle. New state:', !isCountryDropdownOpen);
                             } else {
                                 console.log('Country dropdown is disabled because no continents are selected.');
                             }
                         }}
                     >
                         <span style={{ flexGrow: 1, color: selectedCountries.length > 0 ? '#333' : '#666' }}>{countryTriggerLabel}</span>
                         {/* Mostra icona freccia solo se ci sono continenti selezionati */}
                         {selectedContinents.length > 0 && (
                             <ChevronDown style={{ transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                         )}
                     </div>

                     {/* Lista del Dropdown Paesi (animata) */}
                     <AnimatePresence>
                         {isCountryDropdownOpen && filteredCountries.length > 0 && ( {/* Mostra solo se aperto e ci sono paesi filtrati */}
                             <motion.div
                                 style={dropdownListStyle} // Usa lo stesso stile della lista continenti
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 transition={{ duration: 0.2 }}
                             >
                                 {/* Usa filteredCountries basati sulla libreria */}
                                 {filteredCountries.map(country => {
                                      // La libreria usa ID numerici per i paesi
                                      const countryIdString = country.id.toString(); // Converti in stringa per lo stato selezionato
                                      const isChecked = selectedCountries.includes(countryIdString);
                                      console.log(`Rendering checkbox for ${country.name} (ID: ${countryIdString}). Checked:`, isChecked);
                                      return (
                                         <label key={country.id} htmlFor={`country-${country.id}`}
                                                style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', cursor: 'pointer', hover: { backgroundColor: '#f0f0f0' } }}>
                                             <input
                                                 type="checkbox"
                                                 id={`country-${country.id}`}
                                                 checked={isChecked}
                                                 // Chiamiamo handleCountrySelect con l'ID stringa
                                                 onChange={() => handleCountrySelect(countryIdString)}
                                                 style={{ marginRight: '10px', cursor: 'pointer' }}
                                             />
                                             <span style={{ flexGrow: 1 }}>{country.name}</span>
                                         </label>
                                      );
                                 })}
                             </motion.div>
                         )}
                         {/* Messaggio se nessun paese trovato per i continenti selezionati */}
                         {isCountryDropdownOpen && selectedContinents.length > 0 && filteredCountries.length === 0 && (
                              <motion.div
                                 style={{...dropdownListStyle, padding: '10px 15px', textAlign: 'center', color: '#666'}}
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 transition={{ duration: 0.2 }}
                              >
                                  Nessun Paese trovato per i Continenti selezionati.
                              </motion.div>
                         )}
                          {/* Messaggio se nessun continente selezionato */}
                          {!isCountryDropdownOpen && selectedContinents.length === 0 && (
                                <div style={{ padding: '10px 15px', textAlign: 'center', color: '#666' }}>
                                   Seleziona un Continente per visualizzare i Paesi.
                                </div>
                          )}
                     </AnimatePresence>
                 </div>


                {/* Sezione Regione (ancora placeholder) */}
                 <div style={picklistSectionStyle}>
                     <h3 style={picklistTitleStyle}>Seleziona Regione/i</h3>
                     {/* Placeholder per la lista delle regioni con checkbox */}
                    <p style={{ color: '#666' }}>Lista Regioni qui (dipendente dalla selezione paese)...</p>
                    {/* Qui andrà la logica per la selezione multipla */}
                 </div>


                {/* Pulsante OK */}
                {/* Testo fisso "OK" */}
                <button style={okButtonStyle} onClick={handleOkClick}> {/* Chiama handleOkClick */}
                    OK
                </button>

            </motion.div>
        </motion.div>
    );
};

export default LocationFilterModal;