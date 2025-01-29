// app/page.tsx
'use client'; // Importante per usare componenti client-side (come LanguageSwitcher)

import LanguageSwitcher from '@/components/LanguageSwitcher'; // Importa il componente LanguageSwitcher
import SearchBarHomePage from '@/components/SearchBarHomePage';

export default function Home() {
  return (
    <main style={{
      backgroundImage: `url('/background-home-page.webp')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end' }}> {/* Contenitore per allineamento a destra */}
        <LanguageSwitcher /> {/* Componente per la selezione della lingua */}
      </div>
      <h1 style={{
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '20px'
      }}>
        Pianifica la tua prossima avventura
      </h1>
      <SearchBarHomePage />
    </main>
  );
}