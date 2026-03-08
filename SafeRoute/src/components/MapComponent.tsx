import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { config } from '../config/apiConfig';

interface MapComponentProps {
  startLocation: string;
  endLocation: string;
  apiKey?: string;
}

declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: any);
        fitBounds(bounds: any): void;
        setCenter(center: { lat: number; lng: number }): void;
        setZoom(zoom: number): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
      }
      class LatLngBounds {
        constructor();
        extend(point: LatLng): void;
      }
      class Marker {
        constructor(options: any);
      }
      namespace places {
        class PlacesService {
          getDetails(request: any, callback: (result: any, status: any) => void): void;
        }
      }
      const maps: any;
    }
  }
}

export const MapComponent: React.FC<MapComponentProps> = ({
  startLocation,
  endLocation,
  apiKey = config.googleMapsApiKey,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // Check if maps library is loaded
    if (!window.google || !window.google.maps) {
      if (apiKey) {
        loadGoogleMapsScript(apiKey);
      }
      return;
    }
    initializeMap();
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current && (startLocation || endLocation)) {
      updateMapWithLocations();
    }
  }, [startLocation, endLocation]);

  const loadGoogleMapsScript = (key: string) => {
    if (document.getElementById('google-maps-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeMap();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps. Check your API key.');
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!containerRef.current || !window.google) {
      return;
    }

    const defaultCenter = { lat: 40.7128, lng: -74.006 }; // NYC as default

    const mapOptions = {
      zoom: 12,
      center: defaultCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
    };

    mapRef.current = new window.google.maps.Map(containerRef.current, mapOptions);
  };

  const updateMapWithLocations = async () => {
    if (!mapRef.current || !window.google) {
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();

    try {
      if (startLocation) {
        const startResult = await geocodeLocation(geocoder, startLocation);
        if (startResult) {
          const startMarker = new window.google.maps.Marker({
            map: mapRef.current,
            position: startResult,
            title: `Start: ${startLocation}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          });
          markersRef.current.push(startMarker);
          bounds.extend(startResult);
        }
      }

      if (endLocation) {
        const endResult = await geocodeLocation(geocoder, endLocation);
        if (endResult) {
          const endMarker = new window.google.maps.Marker({
            map: mapRef.current,
            position: endResult,
            title: `End: ${endLocation}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          });
          markersRef.current.push(endMarker);
          bounds.extend(endResult);
        }
      }

      if (markersRef.current.length > 0) {
        mapRef.current.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Error updating map:', error);
    }
  };

  const geocodeLocation = (
    geocoder: google.maps.Geocoder,
    address: string
  ): Promise<google.maps.LatLng | null> => {
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          console.warn(`Geocoding failed for ${address}:`, status);
          resolve(null);
        }
      });
    });
  };

  if (!apiKey) {
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>🗺️ Google Maps Integration</Text>
          <Text style={styles.placeholderText}>
            To enable interactive maps, add your Google Maps API key.
          </Text>
          <Text style={styles.step}>
            <Text style={{ fontWeight: 'bold' }}>Step 1:</Text> Get a free API key from Google Cloud Console
          </Text>
          <Text style={styles.step}>
            <Text style={{ fontWeight: 'bold' }}>Step 2:</Text> Edit .env with: GOOGLE_MAPS_API_KEY=your_key
          </Text>
          <Text style={styles.step}>
            <Text style={{ fontWeight: 'bold' }}>Step 3:</Text> Restart the dev server
          </Text>
          <Text style={styles.step}>
            Or in browser console: localStorage.setItem('GOOGLE_MAPS_API_KEY', 'your_key'); location.reload();
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
  },
  placeholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    maxWidth: 500,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  step: {
    fontSize: 13,
    color: '#555',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  code: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#d63384',
    fontFamily: 'monospace',
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    fontSize: 12,
    color: '#333',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  link: {
    color: '#1e40af',
  },
});

export default MapComponent;
