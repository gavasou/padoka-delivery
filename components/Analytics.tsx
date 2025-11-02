import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  topEvents: { eventName: string; count: number }[];
  eventsByDay: { [key: string]: number };
  userActivity: { [key: string]: { events: number; lastActivity: string } };
}

interface AnalyticsProps {
  user: User;
}

const useAnalytics = (user: User) => {
  const trackEvent = async (eventName: string, properties?: any) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          action: 'track',
          userId: user.id,
          eventData: {
            eventName,
            properties: properties || {},
            sessionId: getSessionId()
          }
        }
      });
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('padoka_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('padoka_session_id', sessionId);
    }
    return sessionId;
  };

  return { trackEvent };
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}> = ({ title, value, subtitle, trend, icon }) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="text-brand-primary">{icon}</div>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-brand-text-secondary">{title}</h3>
        <div className="text-2xl font-bold text-brand-text">{value}</div>
        {subtitle && (
          <p className="text-xs text-brand-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const EventChart: React.FC<{ events: { eventName: string; count: number }[] }> = ({ events }) => {
  const maxCount = Math.max(...events.map(e => e.count));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Top Eventos</h3>
      
      <div className="space-y-3">
        {events.slice(0, 8).map((event, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-brand-text-secondary truncate">
              {event.eventName}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(event.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-brand-text text-right">
              {event.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityChart: React.FC<{ eventsByDay: { [key: string]: number } }> = ({ eventsByDay }) => {
  const days = Object.keys(eventsByDay).sort().slice(-7); // Últimos 7 dias
  const maxEvents = Math.max(...Object.values(eventsByDay));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Atividade dos Últimos 7 Dias</h3>
      
      <div className="flex items-end justify-between h-32 space-x-2">
        {days.map(day => {
          const count = eventsByDay[day] || 0;
          const height = maxEvents > 0 ? (count / maxEvents) * 100 : 0;
          const dayName = new Date(day).toLocaleDateString('pt-BR', { weekday: 'short' });
          
          return (
            <div key={day} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t flex items-end" style={{ height: '100px' }}>
                <div 
                  className="w-full bg-brand-primary rounded-t transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="text-xs text-brand-text-secondary mt-2 text-center">
                {dayName}
              </div>
              <div className="text-xs font-medium text-brand-text">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RealTimeEvents: React.FC<{ user: User }> = ({ user }) => {
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    // Listener para eventos em tempo real
    const subscription = supabase
      .channel('analytics_events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'analytics_events',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newEvent = payload.new;
        setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Manter apenas 10 eventos
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Eventos em Tempo Real</h3>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {recentEvents.length === 0 ? (
          <div className="text-center text-brand-text-secondary py-4">
            Aguardando eventos...
          </div>
        ) : (
          recentEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-brand-background rounded text-sm">
              <span className="font-medium text-brand-text">{event.event_name}</span>
              <span className="text-brand-text-secondary">
                {new Date(event.created_at).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Analytics: React.FC<AnalyticsProps> = ({ user }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { trackEvent } = useAnalytics(user);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('analytics-tracker', {
        body: {
          action: 'get_metrics',
          eventData: {
            timeRange,
            userId: user.id // Filtrar apenas dados do usuário atual
          }
        }
      });

      if (error) throw error;

      setAnalyticsData(data.metrics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    trackEvent('analytics_time_range_changed', { timeRange: newRange });
  };

  useEffect(() => {
    loadAnalytics();
    trackEvent('analytics_viewed', { timeRange });
  }, [timeRange]);

  useEffect(() => {
    // Rastrear eventos automaticamente
    trackEvent('page_view', { page: 'analytics' });
    
    // Rastrear cliques
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        trackEvent('button_click', { buttonText: target.textContent });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-12">
        <div className="text-brand-text-secondary">Erro ao carregar dados</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Analytics</h2>
        
        <div className="flex space-x-2">
          {[
            { value: '24h', label: '24h' },
            { value: '7d', label: '7 dias' },
            { value: '30d', label: '30 dias' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-brand-primary text-brand-secondary'
                  : 'bg-gray-100 text-brand-text hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Eventos"
          value={analyticsData.totalEvents}
          subtitle="Ações registradas"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <MetricCard
          title="Usuários Únicos"
          value={analyticsData.uniqueUsers}
          subtitle="Usuários ativos"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          }
        />
        
        <MetricCard
          title="Sessões"
          value={analyticsData.uniqueSessions}
          subtitle="Sessões únicas"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <MetricCard
          title="Engajamento"
          value={`${analyticsData.uniqueSessions > 0 ? (analyticsData.totalEvents / analyticsData.uniqueSessions).toFixed(1) : 0}`}
          subtitle="Eventos por sessão"
          trend="stable"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventChart events={analyticsData.topEvents} />
        <ActivityChart eventsByDay={analyticsData.eventsByDay} />
      </div>

      {/* Eventos em tempo real */}
      <RealTimeEvents user={user} />
    </div>
  );
};

export default Analytics;

export { Analytics, useAnalytics };