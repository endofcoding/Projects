import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from './ui/input';
import { Search, MapPin } from 'lucide-react';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PlaceAutocomplete({ onPlaceSelect, value, onChange, placeholder, className }: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    const ac = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(ac);

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place.geometry) {
        onChange(place.name || place.formatted_address || '');
        onPlaceSelect(place);
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [places, onPlaceSelect, onChange]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search for a destination..."}
        className="pl-10 pr-4 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-xl focus:ring-2 focus:ring-primary/20 transition-all"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // Allow manual search if autocomplete is blocked or not used
            inputRef.current?.blur();
          }
        }}
      />
    </div>
  );
}
