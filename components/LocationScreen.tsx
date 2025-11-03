import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { filterBakeriesByDistance } from '../services/googleMapsService';
import { Bakery, User } from '../types';
import MapView from './MapView';
import AddressSearch from './AddressSearch';
import { IconMapPin, IconFilter, IconList, IconMap } from './StatIcons';

interface LocationScreenProps {
  user: User;
  bakeries: Bakery[];
  onBakerySelect: (bakery: Bakery) => void;
  onBack: () => void;
}

type ViewMode = 'map' | 'list';

const LocationScreen: React.FC<LocationScreenProps> = ({
  user,
  bakeries,
  onBakerySelect,
  onBack
}) => {
  const { location, loading: locationLoading, error: locationError, requestLocation } = useGeolocation();
  const [filteredBakeries, setFilteredBakeries] = useState<Bakery[]>(bakeries);
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [userAddress, setUserAddress] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Atualizar coordenadas do usuário quando a geolocalização mudar
  useEffect(() => {
    if (location.latitude && location.longitude) {
      setUserCoords({
        lat: location.latitude,
        lng: location.longitude
      });
      
      if (location.address) {
        setUserAddress(location.address);
      }
    }
  }, [location]);

  // Filtrar padarias por distância quando coordenadas ou distância máxima mudar
  useEffect(() => {
    if (userCoords) {
      const filtered = filterBakeriesByDistance(
        bakeries,
        userCoords.lat,
        userCoords.lng,
        maxDistance
      );
      setFilteredBakeries(filtered);
    } else {
      setFilteredBakeries(bakeries);
    }
  }, [bakeries, userCoords, maxDistance]);

  // Manipular seleção de endereço
  const handleAddressSelect = (address: string, coordinates?: { lat: number; lng: number }) => {
    setUserAddress(address);
    if (coordinates) {
      setUserCoords(coordinates);
    }
  };

  // Manipular seleção de padaria
  const handleBakerySelect = (bakery: Bakery) => {
    setSelectedBakery(bakery);
    onBakerySelect(bakery);
  };

  // Solicitar localização atual
  const handleCurrentLocationRequest = () => {
    requestLocation();
  };

  // Renderizar card de padaria
  const renderBakeryCard = (bakery: Bakery & { calculatedDistance?: number }) => (
    <div
      key={bakery.id}
      onClick={() => handleBakerySelect(bakery)}
      className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-primary hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <img
          src={bakery.logoUrl}
          alt={bakery.name}
          className="w-16 h-16 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNMjQgMjBIMzZWMjRIMjRWMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgMjhIMzJWMzJIMjBWMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjggMzZINDBWNDBIMjhWMzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-brand-text truncate">{bakery.name}</h3>
              <p className="text-sm text-brand-text-secondary mt-1">{bakery.address}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-sm font-medium">{bakery.rating}</span>
                <span className="text-xs">★</span>
              </div>
              {bakery.calculatedDistance !== undefined && (
                <p className="text-xs text-brand-text-secondary mt-1">
                  {bakery.calculatedDistance.toFixed(1)}km
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
              {bakery.activeSubscriptions} assinantes
            </span>
            <span className="text-xs text-brand-text-secondary">
              Entrega: {bakery.deliveryVehicle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-brand-background">
      {/* Header */}
      <header className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-brand-secondary">
            <IconMapPin className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg text-brand-text">Padarias Próximas</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary'}`}
            >
              <IconMap className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary'}`}
            >
              <IconList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="p-4 bg-white border-b border-gray-200">
        <AddressSearch
          onAddressSelect={handleAddressSelect}
          placeholder="Digite seu endereço para buscar padarias próximas..."
          initialValue={userAddress}
          showCurrentLocation={true}
          onCurrentLocationRequest={handleCurrentLocationRequest}
          className="mb-4"
        />

        {/* Status da localização */}
        {locationLoading && (
          <div className="flex items-center gap-2 text-brand-text-secondary text-sm mb-3">
            <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full"></div>
            <span>Obtendo sua localização...</span>
          </div>
        )}

        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-red-600 text-sm">{locationError}</p>
            <button
              onClick={requestLocation}
              className="text-red-700 underline text-sm mt-1"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Filtro de distância */}
        <div className="flex items-center gap-3">
          <IconFilter className="w-5 h-5 text-brand-text-secondary" />
          <div className="flex-1">
            <label className="text-sm text-brand-text-secondary">
              Raio: {maxDistance}km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
          <span className="text-sm text-brand-text">
            {filteredBakeries.length} padarias
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <MapView
            bakeries={filteredBakeries}
            userLocation={userCoords || undefined}
            selectedBakery={selectedBakery}
            onBakerySelect={handleBakerySelect}
            className="h-full"
          />
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {filteredBakeries.length === 0 ? (
              <div className="text-center py-12">
                <IconMapPin className="w-16 h-16 text-brand-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-brand-text mb-2">
                  Nenhuma padaria encontrada
                </h3>
                <p className="text-brand-text-secondary mb-4">
                  Tente aumentar o raio de busca ou verificar seu endereço
                </p>
                <button
                  onClick={() => setMaxDistance(50)}
                  className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-primary/90"
                >
                  Aumentar raio para 50km
                </button>
              </div>
            ) : (
              <>
                <div className="text-center text-sm text-brand-text-secondary mb-4">
                  {userCoords ? 
                    `${filteredBakeries.length} padarias encontradas em um raio de ${maxDistance}km` :
                    `${filteredBakeries.length} padarias disponíveis`
                  }
                </div>
                {filteredBakeries.map(renderBakeryCard)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationScreen;