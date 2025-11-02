import React from 'react';
import { usePWA, useNetworkStatus, useInstallPrompt } from '../hooks/usePWA';

const PWANotifications: React.FC = () => {
  const { offlineReady, needRefresh, updateSW, close } = usePWA();
  const isOnline = useNetworkStatus();
  const { isInstallable, promptInstall } = useInstallPrompt();

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      console.log('Padoka app instalado com sucesso!');
    }
  };

  const handleUpdate = async () => {
    if (updateSW) {
      await updateSW();
      window.location.reload();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Install Prompt */}
      {isInstallable && (
        <div className="bg-brand-primary text-brand-secondary px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Instalar Padoka</span>
            </div>
            <button
              onClick={handleInstall}
              className="text-xs bg-brand-secondary text-white px-3 py-1 rounded-lg hover:opacity-90 transition-opacity"
            >
              Instalar
            </button>
          </div>
        </div>
      )}

      {/* Update Available */}
      {needRefresh && (
        <div className="bg-blue-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Atualização disponível</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={close}
                className="text-xs text-blue-200 hover:text-white"
              >
                Depois
              </button>
              <button
                onClick={handleUpdate}
                className="text-xs bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Ready */}
      {offlineReady && (
        <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">App pronto para uso offline</span>
            </div>
            <button
              onClick={close}
              className="text-xs text-green-200 hover:text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Network Status */}
      {!isOnline && (
        <div className="bg-orange-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center max-w-md mx-auto">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.5 4a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5h9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Modo offline - algumas funcionalidades limitadas</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWANotifications;