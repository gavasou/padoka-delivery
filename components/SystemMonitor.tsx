import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface SystemHealth {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'error';
  checks: {
    database: { status: string; responseTime: number };
    storage: { status: string; responseTime: number };
    functions: { status: string; responseTime: number };
    analytics: { status: string; responseTime: number };
  };
  metrics: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    systemLoad: string;
  };
}

interface SystemMetrics {
  period: { start: string; end: string };
  system: {
    uptime: string;
    avgResponseTime: number;
    errorRate: number;
  };
  business: {
    newUsers: number;
    newOrders: number;
    revenue: number;
    activeUsers: number;
  };
  performance: {
    databaseQueries: number;
    storageUsage: number;
    functionInvocations: number;
  };
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface SystemMonitorProps {
  user: User;
}

const HealthStatus: React.FC<{ health: SystemHealth | null }> = ({ health }) => {
  if (!health) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-brand-text">Status do Sistema</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
          {getStatusIcon(health.status)}
          <span className="capitalize">{health.status === 'healthy' ? 'Saudável' : health.status === 'degraded' ? 'Degradado' : 'Erro'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(health.checks).map(([service, check]) => (
          <div key={service} className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${check.status === 'healthy' ? 'bg-green-500' : check.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <div className="text-sm font-medium text-brand-text capitalize">{service}</div>
            <div className="text-xs text-brand-text-secondary">{check.responseTime}ms</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-text">{health.metrics.totalUsers}</div>
          <div className="text-sm text-brand-text-secondary">Usuários</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-text">{health.metrics.totalOrders}</div>
          <div className="text-sm text-brand-text-secondary">Pedidos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-text">R$ {health.metrics.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-brand-text-secondary">Receita</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${health.metrics.systemLoad === 'low' ? 'text-green-600' : health.metrics.systemLoad === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
            {health.metrics.systemLoad}
          </div>
          <div className="text-sm text-brand-text-secondary">Carga</div>
        </div>
      </div>

      <div className="text-xs text-brand-text-secondary mt-4 text-right">
        Último check: {new Date(health.timestamp).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

const MetricsOverview: React.FC<{ metrics: SystemMetrics | null }> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Métricas de Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.system.uptime}</div>
            <div className="text-sm text-brand-text-secondary">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-text">{metrics.system.avgResponseTime}ms</div>
            <div className="text-sm text-brand-text-secondary">Resp. Média</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.system.errorRate}%</div>
            <div className="text-sm text-brand-text-secondary">Taxa de Erro</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Métricas de Negócio</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-brand-text">{metrics.business.newUsers}</div>
            <div className="text-sm text-brand-text-secondary">Novos Usuários</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-brand-text">{metrics.business.newOrders}</div>
            <div className="text-sm text-brand-text-secondary">Novos Pedidos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-brand-text">{metrics.business.activeUsers}</div>
            <div className="text-sm text-brand-text-secondary">Usuários Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">R$ {metrics.business.revenue.toFixed(2)}</div>
            <div className="text-sm text-brand-text-secondary">Receita</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-xl font-bold text-brand-text">{metrics.performance.databaseQueries}</div>
            <div className="text-sm text-brand-text-secondary">Consultas DB</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-brand-text">{metrics.performance.storageUsage}</div>
            <div className="text-sm text-brand-text-secondary">Uso Storage</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-brand-text">{metrics.performance.functionInvocations}</div>
            <div className="text-sm text-brand-text-secondary">Invocações</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertsList: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Alertas do Sistema</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-brand-text-secondary py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>Nenhum alerta no momento</div>
            <div className="text-sm">Sistema funcionando normalmente</div>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <h4 className="font-medium text-brand-text">{alert.title}</h4>
                  <p className="text-sm text-brand-text-secondary mt-1">{alert.message}</p>
                  <div className="text-xs text-brand-text-secondary mt-2">
                    {new Date(alert.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SystemMonitor: React.FC<SystemMonitorProps> = ({ user }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadSystemHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-monitor', {
        body: {
          action: 'health_check'
        }
      });

      if (error) throw error;
      setHealth(data);
    } catch (error) {
      console.error('Erro ao carregar status do sistema:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-monitor', {
        body: {
          action: 'get_metrics',
          config: {
            timeRange: '7d'
          }
        }
      });

      if (error) throw error;
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-monitor', {
        body: {
          action: 'get_alerts',
          config: {
            severity: 'all'
          }
        }
      });

      if (error) throw error;
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadSystemHealth(),
      loadMetrics(),
      loadAlerts()
    ]);
    setLoading(false);
  };

  const createBackup = async () => {
    if (!confirm('Deseja criar um backup completo do sistema? Isso pode levar alguns minutos.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('system-monitor', {
        body: {
          action: 'create_backup',
          config: {
            includeStorage: true
          }
        }
      });

      if (error) throw error;

      alert(`Backup criado com sucesso!\nID: ${data.backupId}\nTabelas: ${data.summary.tables}\nRegistros: ${data.summary.totalRecords}`);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup: ' + error.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSystemHealth();
      loadAlerts();
    }, 30000); // Refresh a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Monitoramento do Sistema</h2>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>
          
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-brand-primary text-brand-secondary rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Atualizar
          </button>
          
          <button
            onClick={createBackup}
            className="px-4 py-2 border border-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-background transition-colors"
          >
            Criar Backup
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <>
          <HealthStatus health={health} />
          <MetricsOverview metrics={metrics} />
          <AlertsList alerts={alerts} />
        </>
      )}
    </div>
  );
};

export default SystemMonitor;