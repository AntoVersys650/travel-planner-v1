import axios from 'axios';

const GEONAMES_USERNAME: string = 'antoversys650'; // Definisci il tipo string

interface Place {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const getPlaceSuggestions = async (searchTerm: string): Promise<Place[]> => { // Definisci il tipo di parametro e il tipo di ritorno
  try {
    const response = await axios.get('http://api.geonames.org/searchJSON', {
      params: {
        q: searchTerm,
        username: GEONAMES_USERNAME,
        maxRows: 10,
        fuzzy: 0.7,
      },
    });

    if (response.data.geonames) {
      return response.data.geonames.map((place: any) => ({ // Definisci il tipo dell'elemento nell'array
        name: place.name,
        country: place.countryName,
        latitude: parseFloat(place.lat), // Converti in numero
        longitude: parseFloat(place.lng), // Converti in numero
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Errore nella ricerca', error);
    return [];
  }
};