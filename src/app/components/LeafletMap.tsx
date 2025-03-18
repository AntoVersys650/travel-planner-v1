'use client';

import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurazione delle icone di default per Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LeafletMapProps {
  location?: string | null;  
  routeCoordinates?: [number, number][] | null;
  mapPosition?: { top?: string; left?: string; right?: string; bottom?: string }; // Posizione del container della mappa
  mapSize?: { width?: string; height?: string }; // Dimensioni della mappa (modificabili via codice)
  mapBorderRadius?: string; // Bordo della mappa
  draggable?: boolean;      // Abilita/disabilita il trascinamento della mappa
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

const LeafletMap: React.FC<LeafletMapProps> = ({
  location,
  routeCoordinates,
  mapPosition = {},
  mapSize = { width: '100%', height: '400px' },
  mapBorderRadius = '0px',
  draggable = true,
}) => {
  // Se routeCoordinates è null/undefined, lo imposta come array vuoto
  const safeRouteCoordinates = routeCoordinates || [];

  // Centro di default (Roma) se non sono disponibili coordinate
  const defaultCenter: [number, number] =
    safeRouteCoordinates.length > 0 ? safeRouteCoordinates[0] : [41.9028, 12.4964];

  // Imposta un livello di zoom di base: 10 se più punti, 13 se solo uno
  const zoomLevel = safeRouteCoordinates.length > 1 ? 10 : 13;

  const mapContainerId = 'mapContainer';

  // Se il container era già inizializzato, resettiamo l'_leaflet_id per evitare conflitti
  useEffect(() => {
    const container = document.getElementById(mapContainerId);
    if (container && (container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }
  }, [mapContainerId]);

  return (
    <div style={{ position: 'relative', ...mapPosition }}>
      <MapContainer
        id={mapContainerId}
        center={defaultCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        whenCreated={(mapInstance) => {
          // Abilita il dragging se draggable è true
          if (draggable) {
            mapInstance.dragging.enable();
          } else {
            mapInstance.dragging.disable();
          }
        }}
        style={{
          width: mapSize.width,
          height: mapSize.height,
          borderRadius: mapBorderRadius,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {safeRouteCoordinates.map((coord, index) => (
          <Marker key={index} position={coord} />
        ))}

        {safeRouteCoordinates.length > 1 && (
          <Polyline positions={safeRouteCoordinates} color="blue" />
        )}

        <RecenterAutomatically coords={safeRouteCoordinates} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
