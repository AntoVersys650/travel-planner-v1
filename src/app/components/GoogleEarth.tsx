'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Risolvi il problema delle icone di default di Leaflet in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    typeof window !== 'undefined'
      ? require('leaflet/dist/images/marker-icon-2x.png')
      : '',
  iconUrl:
    typeof window !== 'undefined'
      ? require('leaflet/dist/images/marker-icon.png')
      : '',
  shadowUrl:
    typeof window !== 'undefined'
      ? require('leaflet/dist/images/marker-shadow.png')
      : '',
});

interface GoogleEarthProps {
  location: string | null;
}

/**
 * Funzione di "geocodifica" fittizia.
 * In questo esempio, se la stringa di ricerca contiene "Napoli" restituisce le coordinate di Napoli,
 * altrimenti restituisce coordinate di default (Roma).
 *
 * In una implementazione reale potresti usare un servizio di geocodifica per trasformare
 * una stringa (es. "Napoli NA, Italia") in coordinate latitudine/longitudine.
 */
const geocodeLocation = (location: string | null): [number, number] => {
  if (location && location.toLowerCase().includes('napoli')) {
    return [40.8518, 14.2681]; // Coordinate di Napoli
  }
  return [41.9028, 12.4964]; // Coordinate di default: Roma
};

const GoogleEarth = ({ location }: GoogleEarthProps) => {
  // Calcola le coordinate in base alla location
  const position = geocodeLocation(location);
  // Usa la location come key per forzare il rimontaggio della mappa se cambia
  const mapKey = location && location.trim() !== '' ? location : 'default';

  return (
    <MapContainer key={mapKey} center={position} zoom={13} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          {location ? location : 'Posizione di default'}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default GoogleEarth;
