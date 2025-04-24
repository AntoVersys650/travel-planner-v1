'use client'

import React from 'react';
import Header from '../components/Header'; // Assicurati che il percorso sia corretto

const FlightsPage: React.FC = () => {
  // Calcola l'altezza dell'header per aggiungere un padding top al contenuto
  // Puoi usare un ref sull'header o uno stato condiviso se l'altezza è dinamica.
  // Per semplicità qui ipotizziamo un'altezza fissa o gestita via CSS padding-top sul main.
  const headerHeight = '120px'; // Sostituisci con l'altezza effettiva del tuo header se necessario

  return (
    <div>
      <Header /> {/* Il tuo header fisso */}
      {/* Contenuto principale con padding per evitare che l'header lo copra */}
      <main style={{ paddingTop: headerHeight, height: `calc(100vh - ${headerHeight})`, width: '100%' }}>
        {/* Iframe che carica Skyscanner */}
        <iframe
          src="https://www.skyscanner.com/"
          style={{ border: 'none', width: '100%', height: '100%' }}
          title="Skyscanner"
        />
      </main>
    </div>
  );
};

export default FlightsPage;