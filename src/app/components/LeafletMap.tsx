'use client';

import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configura le icone di default per Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LeafletMapProps {
  location: string | null | undefined;
  routeCoordinates: [number, number][];
}

const RecenterAutomatically = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords, { animate: true });
    }
  }, [map, coords]);
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ location, routeCoordinates }) => {
  // Se non ci sono coordinate, usa Roma come centro di default
  const defaultCenter: [number, number] =
    routeCoordinates && routeCoordinates.length > 0 ? routeCoordinates[0] : [41.9028, 12.4964];

  // Usa un id fisso per il contenitore della mappa
  const mapContainerId = 'mapContainer';

  useEffect(() => {
    // Prima di montare la mappa, se il contenitore esiste ed è già inizializzato, "resetta" _leaflet_id
    const container = document.getElementById(mapContainerId);
    if (container && (container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }
  }, [mapContainerId]);

  return (
    <MapContainer
      id={mapContainerId}
      center={defaultCenter}
      zoom={10}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeCoordinates.map((coord, index) => (
        <Marker key={index} position={coord} />
      ))}
      {routeCoordinates.length > 1 && (
        <Polyline positions={routeCoordinates} color="blue" />
      )}
      <RecenterAutomatically coords={routeCoordinates} />
    </MapContainer>
  );
};

export default LeafletMap;
