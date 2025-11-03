import { useEffect, useState, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

export const usePWA = () => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const updateSWFunction = registerSW({
      onOfflineReady() {
        setOfflineReady(true);
      },
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegistered(registration) {
        console.log('SW Registered: ', registration);
      },
      onRegisterError(error) {
        console.log('SW registration error', error);
      },
    });

    setUpdateSW(() => updateSWFunction);
  }, []);

  const close = useCallback(() => {
    setOfflineReady(false);
    setNeedRefresh(false);
  }, []);

  return {
    offlineReady,
    needRefresh,
    updateSW,
    close,
  };
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstallable(false);
      return true;
    }
    
    return false;
  };

  return {
    isInstallable,
    promptInstall,
  };
};