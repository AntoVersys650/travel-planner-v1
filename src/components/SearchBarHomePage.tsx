// components/SearchBarHomePage.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const SearchBarHomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Ricerca:', searchTerm);
    // logica di ricerca da inserire
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '1000px' }}>
      <input
        type="text"
        placeholder="Cerca..."
        value={searchTerm}
        onChange={handleInputChange}
        style={{
          padding: '10px',
          border: '3px solid #00008B',
          borderRadius: '10px',
          flexGrow: 1,
          marginRight: '10px'
        }}
      />
      <button
        type="submit"
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          padding: 0,
          cursor: 'pointer'
        }}
      >
        <Image
          src="/magnifying-glass-search-free-png.webp" // Assicurati che il percorso sia corretto
          alt="Cerca"
          width={60} // Immagine più grande (larghezza)
          height={60} // Immagine più grande (altezza)
        />
      </button>
    </form>
  );
};

export default SearchBarHomePage;