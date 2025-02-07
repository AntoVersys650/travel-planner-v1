'use client';

import { Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';

interface ItineraryOverlayProps {
  routeCoordinates: [number, number][];
}

const ItineraryOverlay: React.FC<ItineraryOverlayProps> = ({ routeCoordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoordinates.length > 0) {
      map.fitBounds(routeCoordinates);
    }
  }, [map, routeCoordinates]);
  return <Polyline positions={routeCoordinates} color="blue" />;
};

export default ItineraryOverlay;
