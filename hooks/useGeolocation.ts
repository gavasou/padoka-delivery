import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, reverseGeocode } from '../services/googleMapsService';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  accuracy: number | null;
}

interface UseGeolocationResult {
  location: LocationState;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  clearError: () => void;
}

export const useGeolocation = (): UseGeolocationResult => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    accuracy: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      const { latitude, longitude, accuracy } = position.coords;

      // Obter endereço via geocodificação reversa
      let address = null;
      try {
        address = await reverseGeocode(latitude, longitude);
      } catch (addressError) {
        console.warn('Falha na geocodificação reversa:', addressError);
      }

      setLocation({
        latitude,
        longitude,
        address,
        accuracy
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao obter localização');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Tentar obter localização automaticamente na montagem
  useEffect(() => {
    if ('geolocation' in navigator) {
      requestLocation();
    } else {
      setError('Geolocalização não suportada neste navegador');
    }
  }, [requestLocation]);

  return {
    location,
    loading,
    error,
    requestLocation,
    clearError
  };
};