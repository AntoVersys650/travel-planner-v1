// components/SearchBarHomePage.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const translations = {
  it: {
    searchPlaceholder: 'Cerca...',
  },
  en: {
    searchPlaceholder: 'Search...',
  },
  es: {
    searchPlaceholder: 'Buscar...',
  },
  fr: {
    searchPlaceholder: 'Rechercher...',
  },
};

const SearchBarHomePage = ({ currentLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Ricerca:', searchTerm); 
    // Logic to handle search submission (e.g., make API call)
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      width: '1000px',
      position: 'relative', // Necessario per posizionare l'icona
    }}>
      <input
        type="text"
        placeholder={translations[currentLanguage]?.searchPlaceholder}
        value={searchTerm}
        onChange={handleInputChange}
        style={{
          padding: '10px',
          paddingRight: '50px', // Spazio per l'icona
          border: '3px solid #00008B',
          borderRadius: '10px',
          flexGrow: 1,
        }}
      />
      <button
        type="submit"
        style={{
          position: 'absolute', // Posiziona l'icona
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          border: 'none',
          backgroundColor: 'transparent',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <Image
          src="/magnifying-glass-search-free-png.webp"
          alt="Cerca"
          width={40} // Dimensione icona ridotta
          height={40} // Dimensione icona ridotta
        />
      </button>
    </form>
  ); 
}; 

export default SearchBarHomePage;