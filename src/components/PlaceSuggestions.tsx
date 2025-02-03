// components/PlaceSuggestions.tsx
import React from 'react';

interface Place {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

interface PlaceSuggestionsProps {
    suggestions: Place[];
    onSelect: (place: Place) => void;
}

const PlaceSuggestions: React.FC<PlaceSuggestionsProps> = ({ suggestions, onSelect }) => {
    if (!suggestions || suggestions.length === 0) {
        return null; // Non mostrare nulla se non ci sono suggerimenti
    }

    return (
        <ul>
            {suggestions.map((place) => (
                <li key={place.name} onClick={() => onSelect(place)}>
                    {place.name}, {place.country}
                </li>
            ))}
        </ul>
    );
};

export default PlaceSuggestions;