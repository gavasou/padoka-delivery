import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/usePWA';

interface CacheManager {
  setItem: (key: string, data: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
  clear: () => void;
}

const createOfflineCache = (): CacheManager => {
  const CACHE_PREFIX = 'padoka_offline_';
  
  return {
    setItem: (key: string, data: any) => {
      try {
        const timestamp = Date.now();
        const cacheData = { data, timestamp };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Falha ao salvar no cache offline:', error);
      }
    },
    
    getItem: (key: string) => {
      try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Cache expira em 24 horas para dados dinâmicos
        if (age > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(CACHE_PREFIX + key);
          return null;
        }
        
        return data;
      } catch (error) {
        console.warn('Falha ao ler do cache offline:', error);
        return null;
      }
    },
    
    removeItem: (key: string) => {
      localStorage.removeItem(CACHE_PREFIX + key);
    },
    
    clear: () => {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    }
  };
};

export const offlineCache = createOfflineCache();

// Hook para dados com cache offline
export const useOfflineData = <T,>(key: string, fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      // Tentar carregar do cache primeiro
      const cachedData = offlineCache.getItem(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      }

      // Se online, tentar buscar dados atualizados
      if (isOnline) {
        try {
          const freshData = await fetcher();
          setData(freshData);
          offlineCache.setItem(key, freshData);
          setError(null);
        } catch (err) {
          setError('Erro ao carregar dados');
          // Se não há cache e houve erro, mostrar erro
          if (!cachedData) {
            console.error('Erro ao carregar dados:', err);
          }
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, [key, isOnline]);

  return { data, loading, error, isOnline };
};

// Componente para exibir status offline
export const OfflineStatus: React.FC = () => {
  const isOnline = useNetworkStatus();
  
  if (isOnline) return null;

  return (
    <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-orange-700">
            <strong>Modo Offline:</strong> Algumas funcionalidades podem estar limitadas. 
            Os dados serão sincronizados quando a conexão for restabelecida.
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente para queue de operações offline
export const OfflineQueue: React.FC = () => {
  const [queueSize, setQueueSize] = useState(0);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    // Verificar se há operações na queue
    const updateQueueSize = () => {
      const queue = offlineCache.getItem('operation_queue') || [];
      setQueueSize(Array.isArray(queue) ? queue.length : 0);
    };

    updateQueueSize();
    
    // Processar queue quando voltar online
    if (isOnline && queueSize > 0) {
      processOfflineQueue();
    }
  }, [isOnline, queueSize]);

  const processOfflineQueue = async () => {
    const queue = offlineCache.getItem('operation_queue') || [];
    if (queue.length === 0) return;

    console.log(`Processando ${queue.length} operações offline...`);
    
    // Aqui você implementaria o processamento real das operações
    // Por exemplo: upload de dados, envio de formulários, etc.
    
    // Limpar queue após processamento
    offlineCache.removeItem('operation_queue');
    setQueueSize(0);
  };

  if (queueSize === 0) return null;

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            <strong>Sincronização:</strong> {queueSize} operação(ões) aguardando sincronização.
            {isOnline && ' Processando...'}
          </p>
        </div>
      </div>
    </div>
  );
};