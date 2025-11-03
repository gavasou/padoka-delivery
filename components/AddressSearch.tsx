import React, { useState, useRef, useEffect } from 'react';
import { loadGoogleMaps, geocodeAddress } from '../services/googleMapsService';
import { IconMapPin, IconSearch, IconX } from './StatIcons';

interface AddressSearchProps {
  onAddressSelect: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  showCurrentLocation?: boolean;
  onCurrentLocationRequest?: () => void;
}

interface AddressSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  placeholder = "Digite seu endereço...",
  initialValue = "",
  className = "",
  showCurrentLocation = true,
  onCurrentLocationRequest
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Inicializar serviços do Google Maps
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await loadGoogleMaps();
        autocompleteService.current = new google.maps.places.AutocompleteService();
        geocoder.current = new google.maps.Geocoder();
      } catch (error) {
        console.error('Erro ao inicializar Google Maps:', error);
      }
    };

    initializeServices();
  }, []);

  // Buscar sugestões de endereços
  const searchAddresses = async (input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const request = {
        input,
        componentRestrictions: { country: 'br' },
        types: ['address'],
        fields: ['description', 'place_id', 'structured_formatting']
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions as AddressSuggestion[]);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Erro na busca de endereços:', error);
      setIsLoading(false);
    }
  };

  // Selecionar endereço
  const selectAddress = async (address: string, placeId?: string) => {
    setQuery(address);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    // Obter coordenadas do endereço
    try {
      let coordinates;
      
      if (placeId && geocoder.current) {
        // Usar Place ID para maior precisão
        const response = await geocoder.current.geocode({ placeId });
        if (response.results && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };
        }
      } else {
        // Fallback para geocodificação via edge function
        const result = await geocodeAddress(address);
        coordinates = {
          lat: result.latitude,
          lng: result.longitude
        };
      }

      onAddressSelect(address, coordinates);
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
      onAddressSelect(address); // Selecionar sem coordenadas
    }
  };

  // Manipular mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      searchAddresses(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Manipular teclas (navegação por setas e Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectAddress(
            suggestions[selectedIndex].description,
            suggestions[selectedIndex].place_id
          );
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Limpar campo
  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">
          <IconSearch className="w-5 h-5" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        />

        {query && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text"
          >
            <IconX className="w-5 h-5" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Botão de localização atual */}
      {showCurrentLocation && onCurrentLocationRequest && (
        <button
          onClick={onCurrentLocationRequest}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/10 transition-colors"
        >
          <IconMapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Usar minha localização atual</span>
        </button>
      )}

      {/* Lista de sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              onClick={() => selectAddress(suggestion.description, suggestion.place_id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-brand-primary/10 border-brand-primary/20' : ''
              }`}
            >
              <div className="font-medium text-brand-text">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="text-sm text-brand-text-secondary">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;