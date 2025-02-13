'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getPlaceSuggestions } from '@/utils/geocoding';

const translations = {
  it: {
    searchPlaceholder: 'Dove vuoi andare?',
    checkInPlaceholder: 'Check-in',
    checkOutPlaceholder: 'Check-out',
  },
  en: {
    searchPlaceholder: 'Where are you going?',
    checkInPlaceholder: 'Check-in',
    checkOutPlaceholder: 'Check-out',
  },
  es: {
    searchPlaceholder: '¿A dónde vas?',
    checkInPlaceholder: 'Entrada',
    checkOutPlaceholder: 'Salida',
  },
  fr: {
    searchPlaceholder: 'Où allez-vous?',
    checkInPlaceholder: 'Arrivée',
    checkOutPlaceholder: 'Départ',
  },
};

interface BookingSearchProps {
  currentLanguage: string;
  // Stili configurabili
  containerStyle?: React.CSSProperties;  // Stile per il contenitore dell'intera sezione
  fieldStyle?: React.CSSProperties;        // Stile per ciascun campo (input)
  dividerStyle?: React.CSSProperties;      // Stile per il separatore verticale
  enterButtonStyle?: React.CSSProperties;  // Stile per il pulsante Enter (include dimensioni per l'icona)
}

const defaultContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  maxWidth: '800px',
  margin: '0 auto',
};

const defaultFieldStyle: React.CSSProperties = {
  padding: '12px 16px',
  border: 'none',
  fontSize: '16px',
  backgroundColor: 'transparent',
  flex: 1,
};

const defaultDividerStyle: React.CSSProperties = {
  width: '1px',
  height: '40px',
  backgroundColor: '#ccc',
  margin: '0 8px',
};

const defaultEnterButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
};

// Componente custom per i campi data che include l'icona calendario
const DateInputWithIcon = React.forwardRef<HTMLInputElement, { style?: React.CSSProperties; [x: string]: any }>(
  ({ style, ...props }, ref) => {
    return (
      <div style={{ position: 'relative', width: style?.width || '100%' }}>
        <input
          ref={ref}
          {...props}
          style={{
            ...defaultFieldStyle,
            ...style,
          }}
        />
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Image src="/calendar.png" alt="Calendar" width={24} height={24} />
        </div>
      </div>
    );
  }
);
DateInputWithIcon.displayName = 'DateInputWithIcon';

const BookingSearch = ({
  currentLanguage,
  containerStyle = defaultContainerStyle,
  fieldStyle = defaultFieldStyle,
  dividerStyle = defaultDividerStyle,
  enterButtonStyle = defaultEnterButtonStyle,
}: BookingSearchProps) => {
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const navigateToSearchPage = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(currentLanguage)}`);
  };

  const handleEnterClick = () => {
    if (destination) {
      navigateToSearchPage(destination);
    } else {
      alert('Please enter a destination.');
    }
  };

  return (
    <div style={containerStyle}>
      {/* Campo destinazione */}
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          placeholder={translations[currentLanguage]?.searchPlaceholder || 'Destination'}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={fieldStyle}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul style={{
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
          }}>
            {suggestions.map((sugg, index) => (
              <li
                key={index}
                onClick={() => { setDestination(sugg.name); setSuggestions([]); navigateToSearchPage(sugg.name); }}
                style={{ padding: '8px', cursor: 'pointer' }}
              >
                {sugg.name}, {sugg.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={dividerStyle} />

      {/* Campo check-in */}
      <div style={{ flex: 1 }}>
        <DatePicker
          selected={checkInDate}
          onChange={(date) => setCheckInDate(date)}
          placeholderText={translations[currentLanguage]?.checkInPlaceholder || 'Check-in'}
          dateFormat="dd/MM/yyyy"
          customInput={<DateInputWithIcon style={fieldStyle} />}
        />
      </div>

      <div style={dividerStyle} />

      {/* Campo check-out con minDate impostata su checkInDate */}
      <div style={{ flex: 1 }}>
        <DatePicker
          selected={checkOutDate}
          onChange={(date) => setCheckOutDate(date)}
          placeholderText={translations[currentLanguage]?.checkOutPlaceholder || 'Check-out'}
          dateFormat="dd/MM/yyyy"
          minDate={checkInDate || undefined}
          customInput={<DateInputWithIcon style={fieldStyle} />}
        />
      </div>

      {/* Pulsante Enter */}
      <button type="button" onClick={handleEnterClick} style={enterButtonStyle}>
        <Image src="/enterbutton1.webp" alt="Enter" width={enterButtonStyle.width || 30} height={enterButtonStyle.height || 30} />
      </button>
    </div>
  );
};

export default BookingSearch;
