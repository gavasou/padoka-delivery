import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, DEFAULT_MAP_CONFIG } from '../services/googleMapsService';
import { Bakery } from '../types';

interface MapViewProps {
  bakeries: Bakery[];
  userLocation?: { lat: number; lng: number; address?: string };
  selectedBakery?: Bakery | null;
  onBakerySelect?: (bakery: Bakery) => void;
  className?: string;
  height?: string;
}

const MapView: React.FC<MapViewProps> = ({
  bakeries,
  userLocation,
  selectedBakery,
  onBakerySelect,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limpar marcadores existentes
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
  };

  // Criar marcador do usuário
  const createUserMarker = (map: google.maps.Map, location: { lat: number; lng: number }) => {
    const userMarker = new google.maps.Marker({
      position: location,
      map,
      title: 'Sua localização',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
            <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      },
      zIndex: 1000
    });

    userMarkerRef.current = userMarker;
  };

  // Criar marcadores das padarias
  const createBakeryMarkers = (map: google.maps.Map, bakeries: Bakery[]) => {
    bakeries.forEach((bakery) => {
      // Usar coordenadas fake se não existirem (para demo)
      const lat = bakery.latitude || (-23.5505 + (Math.random() - 0.5) * 0.1);
      const lng = bakery.longitude || (-46.6333 + (Math.random() - 0.5) * 0.1);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: bakery.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#F59E0B" stroke="#FFFFFF" stroke-width="3"/>
              <path d="M16 8v8l6 4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      // Info window para a padaria
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1F2937;">
                ${bakery.name}
              </h3>
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">
                ${bakery.address}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #F59E0B; font-weight: bold;">⭐ ${bakery.rating}</span>
                <span style="color: #6B7280; font-size: 12px;">${bakery.distance || '0.0'}km</span>
              </div>
              <button 
                onclick="window.selectBakery('${bakery.id}')"
                style="
                  width: 100%; 
                  background: #F59E0B; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 8px; 
                  font-weight: bold;
                  cursor: pointer;
                "
              >
                Ver Cardápio
              </button>
            </div>
          `
        });

        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;

        // Callback para seleção da padaria
        if (onBakerySelect) {
          onBakerySelect(bakery);
        }
      });

      markersRef.current.push(marker);
    });
  };

  // Inicializar mapa
  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      await loadGoogleMaps();

      const mapOptions: google.maps.MapOptions = {
        ...DEFAULT_MAP_CONFIG,
        center: userLocation || DEFAULT_MAP_CONFIG.center
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Adicionar marcador do usuário se disponível
      if (userLocation) {
        createUserMarker(map, userLocation);
      }

      // Adicionar marcadores das padarias
      createBakeryMarkers(map, bakeries);

      // Ajustar zoom para mostrar todos os marcadores
      if (bakeries.length > 0 || userLocation) {
        const bounds = new google.maps.LatLngBounds();
        
        if (userLocation) {
          bounds.extend(userLocation);
        }
        
        bakeries.forEach(bakery => {
          const lat = bakery.latitude || (-23.5505 + (Math.random() - 0.5) * 0.1);
          const lng = bakery.longitude || (-46.6333 + (Math.random() - 0.5) * 0.1);
          bounds.extend({ lat, lng });
        });

        map.fitBounds(bounds);
        
        // Garantir zoom mínimo
        const listener = google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
          google.maps.event.removeListener(listener);
        });
      }

    } catch (err: any) {
      console.error('Erro ao inicializar mapa:', err);
      setError('Falha ao carregar o mapa');
    } finally {
      setIsLoading(false);
    }
  };

  // Callback global para seleção de padaria no info window
  useEffect(() => {
    (window as any).selectBakery = (bakeryId: string) => {
      const bakery = bakeries.find(b => b.id === bakeryId);
      if (bakery && onBakerySelect) {
        onBakerySelect(bakery);
      }
    };

    return () => {
      delete (window as any).selectBakery;
    };
  }, [bakeries, onBakerySelect]);

  // Inicializar mapa quando o componente monta
  useEffect(() => {
    initializeMap();

    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  // Atualizar marcadores quando bakeries ou userLocation mudam
  useEffect(() => {
    if (mapInstanceRef.current) {
      clearMarkers();
      
      if (userLocation) {
        createUserMarker(mapInstanceRef.current, userLocation);
      }
      
      createBakeryMarkers(mapInstanceRef.current, bakeries);
    }
  }, [bakeries, userLocation]);

  // Destacar padaria selecionada
  useEffect(() => {
    if (selectedBakery && mapInstanceRef.current) {
      const lat = selectedBakery.latitude || (-23.5505 + (Math.random() - 0.5) * 0.1);
      const lng = selectedBakery.longitude || (-46.6333 + (Math.random() - 0.5) * 0.1);
      
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [selectedBakery]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Erro ao carregar mapa</p>
          <button 
            onClick={initializeMap}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-brand-text-secondary">Carregando mapa...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ height }}
      />
    </div>
  );
};

export default MapView;