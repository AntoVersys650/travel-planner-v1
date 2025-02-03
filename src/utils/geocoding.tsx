// src/utils/geocoding.ts

import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface Place {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const getPlaceSuggestions = async (searchTerm: string, language: string = 'en'): Promise<Place[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key non configurata! Controlla la variabile NEXT_PUBLIC_GOOGLE_MAPS_API_KEY nel file .env.local.");
    return [];
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: searchTerm,
        key: GOOGLE_MAPS_API_KEY,
        language,
      },
    });

    // Verifica lo status restituito da Google
    if (response.data.status !== 'OK') {
      console.warn("Google Geocoding API ha restituito lo status:", response.data.status);
      return [];
    }

    // Mappa i risultati in un formato coerente con il tuo componente
    const places: Place[] = response.data.results.map((result: any) => {
      // Estrai il country dall'array di address_components
      const addressComponents = result.address_components;
      let country = '';
      addressComponents.forEach((component: any) => {
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      });

      return {
        name: result.formatted_address,
        country,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };
    });

    return places;
  } catch (error: any) {
    console.error("Errore nella chiamata a Google Geocoding API:", error);
    return [];
  }
};
