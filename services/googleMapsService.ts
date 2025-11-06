import { supabase } from './supabase';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk';

let googleMaps: typeof google.maps | null = null;
let isScriptLoaded = false;

// Verificar se a API key é válida
const isValidApiKey = (key: string): boolean => {
  return key && key.length > 20 && !key.includes('YOUR_API_KEY');
};

// Carregar API do Google Maps com melhor tratamento de erros
export const loadGoogleMaps = async (retryCount = 3): Promise<typeof google.maps> => {
  if (googleMaps) return googleMaps;
  
  // Validar API key
  if (!isValidApiKey(GOOGLE_MAPS_API_KEY)) {
    throw new Error('Chave da API do Google Maps inválida ou não configurada. Verifique a variável VITE_GOOGLE_MAPS_API_KEY.');
  }
  
  try {
    // Verificar se o script já existe no documento
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Aguardar o script existente carregar
      await new Promise<void>((resolve, reject) => {
        if (existingScript.getAttribute('data-loaded') === 'true') {
          resolve();
        } else {
          const handleLoad = () => {
            existingScript.removeEventListener('load', handleLoad);
            existingScript.removeEventListener('error', handleError);
            resolve();
          };
          const handleError = () => {
            existingScript.removeEventListener('load', handleLoad);
            existingScript.removeEventListener('error', handleError);
            reject(new Error('Script loading failed'));
          };
          
          existingScript.addEventListener('load', handleLoad);
          existingScript.addEventListener('error', handleError);
          
          // Timeout para evitar espera infinita
          setTimeout(() => {
            existingScript.removeEventListener('load', handleLoad);
            existingScript.removeEventListener('error', handleError);
            reject(new Error('Script loading timeout'));
          }, 10000);
        }
      });
    } else if (!isScriptLoaded) {
      // Criar novo script tag para carregar Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=pt-BR&region=BR`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-loaded', 'false');
      
      // Aguardar carregamento do script com timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          script.removeEventListener('load', handleLoad);
          script.removeEventListener('error', handleError);
          reject(new Error('Google Maps script loading timeout (10s)'));
        }, 10000); // 10 segundos timeout
        
        const handleLoad = () => {
          clearTimeout(timeout);
          script.setAttribute('data-loaded', 'true');
          resolve();
        };
        const handleError = () => {
          clearTimeout(timeout);
          reject(new Error('Google Maps script failed to load - verifique a chave da API'));
        };
        
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        
        document.head.appendChild(script);
      });
      
      isScriptLoaded = true;
    }

    // Aguardar disponibilidade do objeto google com timeout
    const startTime = Date.now();
    const maxWaitTime = 15000; // 15 segundos máximo de espera
    
    while (typeof google === 'undefined' || !google.maps) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Google Maps object não disponível após timeout. Verifique sua conexão com a internet.');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    googleMaps = google.maps;
    return googleMaps;
  } catch (error) {
    console.error('Erro ao carregar Google Maps:', error);
    
    // Retry mechanism para erros de rede
    if (retryCount > 0 && (error instanceof Error && (
      error.message.includes('timeout') || 
      error.message.includes('network') || 
      error.message.includes('failed to fetch')
    ))) {
      console.log(`Tentando carregar Google Maps novamente... (${retryCount} tentativas restantes)`);
      isScriptLoaded = false; // Reset the flag to try loading again
      
      // Remover script falho se existir
      const failedScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (failedScript) {
        failedScript.remove();
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      return loadGoogleMaps(retryCount - 1);
    }
    
    throw new Error(`Falha ao carregar Google Maps após múltiplas tentativas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Função para verificar status do Google Maps
export const checkGoogleMapsStatus = (): { loaded: boolean; error?: string } => {
  if (googleMaps && typeof google !== 'undefined' && google.maps) {
    return { loaded: true };
  }
  
  const script = document.querySelector(`script[src*="maps.googleapis.com"]`);
  if (!script) {
    return { loaded: false, error: 'Script do Google Maps não encontrado' };
  }
  
  if (script.getAttribute('data-loaded') === 'true') {
    return { loaded: false, error: 'Script carregado mas objeto google.maps não disponível' };
  }
  
  return { loaded: false, error: 'Script ainda carregando' };
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

// Geocodificação reversa (coordenadas para endereço) com melhor tratamento de erros
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Validar coordenadas
    if (typeof lat !== 'number' || typeof lng !== 'number' || 
        isNaN(lat) || isNaN(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Coordenadas inválidas fornecidas para geocodificação reversa');
    }
    
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    
    // Promise wrapper para geocoder.geocode
    const geocodePromise = new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            reject(new Error('Nenhum resultado encontrado para estas coordenadas'));
          } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            reject(new Error('Limite de consultas excedido. Tente novamente em alguns minutos.'));
          } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
            reject(new Error('Requisição negada. Verifique sua chave da API.'));
          } else if (status === google.maps.GeocoderStatus.INVALID_REQUEST) {
            reject(new Error('Requisição inválida.'));
          } else {
            reject(new Error(`Erro na geocodificação reversa: ${status}`));
          }
        }
      );
    });
    
    const response = await Promise.race([
      geocodePromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na geocodificação reversa')), 10000)
      )
    ]);

    if (response && response.length > 0) {
      // Tentar encontrar o endereço mais específico
      const bestResult = response.find(result => 
        result.types.includes('street_address') || 
        result.types.includes('premise')
      ) || response[0];
      
      return bestResult.formatted_address;
    }
    
    throw new Error('Nenhum endereço encontrado para estas coordenadas');
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('INVÁLIDAS') || error.message.includes('Timeout')) {
        throw error; // Re-throw validation and timeout errors
      }
      if (error.message.includes('ZERO_RESULTS')) {
        throw new Error('Nenhum endereço encontrado nestas coordenadas');
      }
      if (error.message.includes('API')) {
        throw new Error('Erro de configuração da API. Verifique sua chave.');
      }
    }
    
    throw new Error(`Falha ao obter endereço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

// Obter localização atual do usuário com melhor tratamento de erros
export const getCurrentLocation = async (retryCount = 2): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    // Verificar suporte à geolocalização
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador. Por favor, use um navegador moderno ou ative a localização.'));
      return;
    }

    // Verificar se estamos em contexto seguro (HTTPS ou localhost)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      reject(new Error('Geolocalização requer contexto seguro (HTTPS).'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Aumentado para 15 segundos
      maximumAge: 300000 // 5 minutos
    };

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        console.warn('Erro de geolocalização:', error);
        
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Acesso à localização foi negado. Por favor, permita o acesso à localização nas configurações do navegador e recarregue a página.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Verifique se o GPS está ativado e tente novamente.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout na obtenção da localização. Verifique sua conexão e tente novamente.';
            break;
          default:
            errorMessage = 'Erro desconhecido ao obter localização. Tente novamente.';
        }
        
        // Retry mechanism para erros temporários
        if ((error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) && retryCount > 0) {
          console.log(`Tentando obter localização novamente... (${retryCount} tentativas restantes)`);
          setTimeout(async () => {
            try {
              const position = await getCurrentLocation(retryCount - 1);
              resolve(position);
            } catch (retryError) {
              reject(retryError);
            }
          }, 2000); // Aguardar 2 segundos antes da nova tentativa
          return;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Função auxiliar para verificar status da geolocalização
export const checkGeolocationPermission = async (): Promise<PermissionState> => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'prompt'; // Fallback se não suportado
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('Não foi possível verificar status da permissão:', error);
    return 'prompt';
  }
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