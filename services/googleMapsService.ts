import { supabase } from './supabase';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk';

let googleMaps: typeof google.maps | null = null;
let isScriptLoaded = false;

// Carregar API do Google Maps usando nova API funcional
export const loadGoogleMaps = async (): Promise<typeof google.maps> => {
  if (googleMaps) return googleMaps;
  
  try {
    if (!isScriptLoaded) {
      // Criar script tag para carregar Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=pt-BR&region=BR`;
      script.async = true;
      script.defer = true;
      
      // Aguardar carregamento do script
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      isScriptLoaded = true;
    }

    // Aguardar disponibilidade do objeto google
    while (typeof google === 'undefined' || !google.maps) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    googleMaps = google.maps;
    return googleMaps;
  } catch (error) {
    console.error('Erro ao carregar Google Maps:', error);
    throw new Error('Falha ao carregar mapas');
  }
};

// Geocodificar endereço via edge function
export const geocodeAddress = async (address: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { address }
    });

    if (error) throw error;
    return data.data;
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    throw new Error('Falha ao localizar endereço');
  }
};

// Calcular distância via edge function
export const calculateDistance = async (origin: string, destination: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-distance', {
      body: { origin, destination }
    });

    if (error) throw error;
    return data.data;
  } catch (error) {
    console.error('Erro no cálculo de distância:', error);
    throw new Error('Falha ao calcular distância');
  }
};

// Geocodificação reversa (coordenadas para endereço)
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    
    const response = await geocoder.geocode({
      location: { lat, lng }
    });

    if (response.results && response.results.length > 0) {
      return response.results[0].formatted_address;
    }
    
    throw new Error('Endereço não encontrado');
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    throw new Error('Falha ao obter endereço');
  }
};

// Calcular distância entre coordenadas (Haversine)
export const calculateDistanceBetweenCoords = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Obter localização atual do usuário
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Permissão negada para localização'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Localização indisponível'));
            break;
          case error.TIMEOUT:
            reject(new Error('Timeout na localização'));
            break;
          default:
            reject(new Error('Erro desconhecido na localização'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};

// Filtrar padarias por proximidade
export const filterBakeriesByDistance = (
  bakeries: any[],
  userLat: number,
  userLng: number,
  maxDistance: number = 10 // km
) => {
  return bakeries
    .map(bakery => ({
      ...bakery,
      calculatedDistance: calculateDistanceBetweenCoords(
        userLat,
        userLng,
        bakery.latitude || 0,
        bakery.longitude || 0
      )
    }))
    .filter(bakery => bakery.calculatedDistance <= maxDistance)
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
};

// Configurações padrão do mapa
export const DEFAULT_MAP_CONFIG = {
  center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
  zoom: 13,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ],
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false
};