import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  pushEnabled: boolean;
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  user: User;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Verificar se push notifications estão disponíveis
  const isPushSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  };

  // Carregar notificações do usuário
  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Configurar service worker
  const setupServiceWorker = async () => {
    if (!isPushSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      setServiceWorkerRegistration(registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar service worker:', error);
      return null;
    }
  };

  // Habilitar notificações push
  const enablePushNotifications = async (): Promise<boolean> => {
    if (!isPushSupported()) {
      alert('Seu navegador não suporta notificações push');
      return false;
    }

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permissão para notificações negada');
        return false;
      }

      // Configurar service worker
      const registration = serviceWorkerRegistration || await setupServiceWorker();
      if (!registration) {
        throw new Error('Falha ao registrar service worker');
      }

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HcCeNiU2aeXJy7k8XyVaePE1ECF_T_DuKvkPl-3DdHWlN7uJ1PsQx1Wc_c'
      });

      // Salvar subscription no backend
      const { error } = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'subscribe',
          userId: user.id,
          subscription: subscription.toJSON()
        }
      });

      if (error) throw error;

      setPushEnabled(true);
      console.log('Push notifications habilitadas com sucesso');
      return true;

    } catch (error) {
      console.error('Erro ao habilitar push notifications:', error);
      alert('Erro ao habilitar notificações: ' + error.message);
      return false;
    }
  };

  // Desabilitar notificações push
  const disablePushNotifications = async () => {
    try {
      if (serviceWorkerRegistration) {
        const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          
          // Remover do backend
          await supabase.functions.invoke('push-notifications', {
            body: {
              action: 'unsubscribe',
              userId: user.id,
              subscription: subscription.toJSON()
            }
          });
        }
      }

      setPushEnabled(false);
      console.log('Push notifications desabilitadas');
    } catch (error) {
      console.error('Erro ao desabilitar push notifications:', error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Enviar notificação de teste
  const sendTestNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'send',
          notification: {
            userId: user.id,
            title: 'Notificação de Teste - Padoka',
            message: 'Esta é uma notificação de teste do sistema Padoka!',
            data: { type: 'test', timestamp: new Date().toISOString() }
          }
        }
      });

      if (error) throw error;
      console.log('Notificação de teste enviada');
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
    }
  };

  // Verificar status das push notifications
  const checkPushStatus = async () => {
    if (!isPushSupported()) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setPushEnabled(!!subscription);
        setServiceWorkerRegistration(registration);
      }
    } catch (error) {
      console.error('Erro ao verificar status do push:', error);
    }
  };

  // Setup inicial
  useEffect(() => {
    if (user) {
      loadNotifications();
      checkPushStatus();
      setupServiceWorker();
    }
  }, [user]);

  // Listener para novas notificações via realtime
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        
        // Mostrar notificação nativa se disponível
        if (Notification.permission === 'granted' && document.hidden) {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/pwa-192x192.png',
            badge: '/pwa-64x64.png',
            tag: newNotification.id
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    pushEnabled,
    enablePushNotifications,
    disablePushNotifications,
    markAsRead,
    markAllAsRead,
    sendTestNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};