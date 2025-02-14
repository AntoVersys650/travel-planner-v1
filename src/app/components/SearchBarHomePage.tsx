import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getPlaceSuggestions } from '@/utils/geocoding';
import DateInputWithIcon from './DateInputWithIcon';

const translations = {
  it: {
    searchPlaceholder: 'Dove vuoi andare?',
    checkInPlaceholder: 'Check-in',
    checkOutPlaceholder: 'Check-out',
    searchButton: 'Cerca',
    errorMessageDestination: 'Inserisci la località per iniziare',
    errorMessageCheckIn: 'Seleziona la data del check-in',
    errorMessageCheckOut: 'Seleziona la data del check-out',
    errorMessageDateOrder: 'La data di check-out deve essere uguale o successiva alla data di check-in',
  },
  en: {
    searchPlaceholder: 'Where are you going?',
    checkInPlaceholder: 'Check-in',
    checkOutPlaceholder: 'Check-out',
    searchButton: 'Search',
    errorMessageDestination: 'Please enter the desired destination',
    errorMessageCheckIn: 'Please enter the check-in date',
    errorMessageCheckOut: 'Please enter the check-out date',
    errorMessageDateOrder: 'The check-out date must be equal to or after the check-in date',
  },
  es: {
    searchPlaceholder: '¿A dónde vas?',
    checkInPlaceholder: 'Entrada',
    checkOutPlaceholder: 'Salida',
    searchButton: 'Buscar',
    errorMessageDestination: 'Por favor, ingrese el destino para comenzar',
    errorMessageCheckIn: 'Por favor, ingrese la fecha de entrada',
    errorMessageCheckOut: 'Por favor, ingrese la fecha de salida',
    errorMessageDateOrder: 'La fecha de salida debe ser igual o posterior a la fecha de entrada',
  },
  fr: {
    searchPlaceholder: 'Où allez-vous?',
    checkInPlaceholder: 'Arrivée',
    checkOutPlaceholder: 'Départ',
    searchButton: 'Rechercher',
    errorMessageDestination: 'Veuillez entrer la destination souhaitée',
    errorMessageCheckIn: "Veuillez entrer la date d'arrivée",
    errorMessageCheckOut: 'Veuillez entrer la date de départ',
    errorMessageDateOrder: "La date de départ doit être égale ou postérieure à la date d'arrivée",
  },
};

const defaultContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  maxWidth: '800px',
  margin: '0 auto',
  position: 'relative',
};

const defaultFieldStyle: React.CSSProperties = {
  padding: '12px 16px',
  border: '1px solid transparent',
  fontSize: '16px',
  backgroundColor: 'transparent',
  flex: 1,
  borderRadius: '4px',
  transition: 'border-color 0.3s',
  position: 'relative',
};

const defaultDividerStyle: React.CSSProperties = {
  width: '1px',
  height: '40px',
  backgroundColor: '#ccc',
  margin: '0 8px',
};

const defaultButtonStyle: React.CSSProperties = {
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '10px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  marginLeft: '8px',
  position: 'relative',
  zIndex: 2000,
};

const defaultErrorStyle: React.CSSProperties = {
  backgroundColor: 'red',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '12px',
  padding: '4px 8px',
  borderRadius: '4px',
  position: 'absolute',
  top: '105%', // subito sotto l'input
  left: 0,
  zIndex: 1000,
};

interface BookingSearchProps {
  currentLanguage: string;
  containerStyle?: React.CSSProperties;
  fieldStyle?: React.CSSProperties;
  dividerStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  errorStyle?: React.CSSProperties;
}

const BookingSearch = ({
  currentLanguage,
  containerStyle = defaultContainerStyle,
  fieldStyle = defaultFieldStyle,
  dividerStyle = defaultDividerStyle,
  buttonStyle = defaultButtonStyle,
  errorStyle = defaultErrorStyle,
}: BookingSearchProps) => {
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [destinationError, setDestinationError] = useState('');
  const [checkInError, setCheckInError] = useState('');
  const [checkOutError, setCheckOutError] = useState('');
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSuggestions = async (input: string) => {
      try {
        const results = await getPlaceSuggestions(input, currentLanguage);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    if (destination) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(destination);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [destination, currentLanguage]);

  // Handle click outside to close the error
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (errorRef.current && !errorRef.current.contains(event.target as Node)) {
        setDestinationError('');
        setCheckInError('');
        setCheckOutError('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchClick = () => {
    let hasError = false;
    const today = new Date().setHours(0, 0, 0, 0); // Oggi senza orario

    if (!destination) {
      setDestinationError(translations[currentLanguage]?.errorMessageDestination);
      hasError = true;
    } else {
      setDestinationError('');
    }

    if (!checkInDate || new Date(checkInDate).setHours(0, 0, 0, 0) < today) {
      setCheckInError(translations[currentLanguage]?.errorMessageCheckIn);
      hasError = true;
    } else {
      setCheckInError('');
    }

    if (!checkOutDate || checkOutDate <= checkInDate) {
      setCheckOutError(
        checkOutDate
          ? translations[currentLanguage]?.errorMessageDateOrder
          : translations[currentLanguage]?.errorMessageCheckOut
      );
      hasError = true;
    } else {
      setCheckOutError('');
    }

    if (!hasError) {
      router.push(
        `/search?q=${encodeURIComponent(destination)}&lang=${encodeURIComponent(currentLanguage)}`
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };

  return (
    <div style={containerStyle} onKeyDown={handleKeyDown} tabIndex={0} ref={errorRef}>
      {/* Destination */}
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          placeholder={translations[currentLanguage]?.searchPlaceholder || 'Destination'}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{
            ...fieldStyle,
            borderColor: destinationError ? 'red' : 'transparent',
          }}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              zIndex: 10,
            }}
          >
            {suggestions.map((sugg, index) => (
              <li
                key={index}
                onClick={() => {
                  setDestination(sugg.name);
                  setSuggestions([]);
                }}
                style={{ padding: '8px', cursor: 'pointer' }}
              >
                {sugg.name}
              </li>
            ))}
          </ul>
        )}
        {destinationError && <div style={errorStyle}>{destinationError}</div>}
      </div>

      <div style={dividerStyle}></div>

      {/* Check-in */}
      <div style={{ position: 'relative' }}>
<DatePicker
  selected={checkInDate}
  onChange={(date) => setCheckInDate(date)}
  dateFormat="dd/MM/yyyy"
  customInput={<DateInputWithIcon label={translations[currentLanguage]?.checkInPlaceholder || 'Check-in'} />}
/>
        {checkInError && <div style={errorStyle}>{checkInError}</div>}
      </div>

      <div style={dividerStyle}></div>

      {/* Check-out */}
      <div style={{ position: 'relative' }}>

<DatePicker
  selected={checkOutDate}
  onChange={(date) => setCheckOutDate(date)}
  dateFormat="dd/MM/yyyy"
  customInput={<DateInputWithIcon label={translations[currentLanguage]?.checkOutPlaceholder || 'Check-out'} />}
/>
        {checkOutError && <div style={errorStyle}>{checkOutError}</div>}
      </div>

      <button style={buttonStyle} onClick={handleSearchClick}>
        {translations[currentLanguage]?.searchButton || 'Search'}
      </button>
    </div>
  );
};

export default BookingSearch;
