'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  location: string | null | undefined;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // Effetto per inizializzare la mappa una sola volta
  useEffect(() => {
    // Importa dinamicamente Leaflet solo lato client
    import('leaflet').then((module) => {
      const L = module.default;
      // Configura le icone di default di Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });

      if (mapRef.current && !map) {
        const newMap = L.map(mapRef.current).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(newMap);
        setMap(newMap);
      }
    });
    // Pulizia: rimuovi la mappa al dismount
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []); // Esegue solo una volta

  // Effetto per aggiornare la vista della mappa quando la location cambia
  useEffect(() => {
    if (map && location) {
      import('leaflet').then((module) => {
        const L = module.default;
        // Esegui la richiesta a Nominatim per ottenere le coordinate
        fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            location
          )}&format=json`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              const { lat, lon } = data[0];
              map.setView([parseFloat(lat), parseFloat(lon)], 10);
              // Aggiungi un marker
              L.marker([parseFloat(lat), parseFloat(lon)]).addTo(map);
            }
          })
          .catch((err) => {
            console.error('Errore nella geocodifica:', err);
          });
      });
    }
  }, [location, map]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default LeafletMap;
