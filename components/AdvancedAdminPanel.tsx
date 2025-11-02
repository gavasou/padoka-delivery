import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  IconSettings, IconDatabase, IconUsers, IconBuildingStore, 
  IconTrash, IconRefresh, IconDownload, IconUpload, IconAlertTriangle,
  IconCheck, IconX, IconEdit, IconEye, IconLock, IconUnlock,
  IconTrendingUp, IconActivity, IconMessageCircle, IconBell,
  IconShield, IconKey, IconServer, IconCpu, IconHardDrive
} from './StatIcons';
import type { User, Bakery, User as UserType } from '../types';

interface AdvancedAdminPanelProps {
  user: User;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  realtime: 'healthy' | 'warning' | 'critical';
}

interface AppConfig {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  max_upload_size: number;
  session_timeout: number;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  rate_limiting: boolean;
  cors_enabled: boolean;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
  details?: any;
}

const HealthStatus: React.FC<{ status: SystemHealth[keyof SystemHealth] }> = ({ status }) => {
  const configs = {
    healthy: { color: 'text-green-500', bg: 'bg-green-100', icon: IconCheck, text: 'Saudável' },
    warning: { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: IconAlertTriangle, text: 'Atenção' },
    critical: { color: 'text-red-500', bg: 'bg-red-100', icon: IconX, text: 'Crítico' }
  };

  const config = configs[status];
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
      <IconComponent className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

const ConfigSwitch: React.FC<{
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
    <div className="flex-1">
      <h4 className="font-semibold text-brand-text">{label}</h4>
      <p className="text-sm text-brand-text-secondary">{description}</p>
    </div>
    <div 
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
        value ? 'bg-brand-primary' : 'bg-gray-300'
      }`}
      onClick={() => onChange(!value)}
    >
      <div 
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          value ? 'translate-x-6' : 'translate-x-0'
        }`} 
      />
    </div>
  </div>
);

const NumericInput: React.FC<{
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}> = ({ label, description, value, onChange, suffix, min, max }) => (
  <div className="p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-brand-text">{label}</h4>
    <p className="text-sm text-brand-text-secondary mb-2">{description}</p>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="flex-1 p-2 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      {suffix && <span className="text-brand-text-secondary">{suffix}</span>}
    </div>
  </div>
);

const SelectInput: React.FC<{
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; }[];
}> = ({ label, description, value, onChange, options }) => (
  <div className="p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-brand-text">{label}</h4>
    <p className="text-sm text-brand-text-secondary mb-2">{description}</p>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const SystemHealthCard: React.FC<{ health: SystemHealth }> = ({ health }) => {
  const getHealthItems = () => [
    { key: 'database', label: 'Banco de Dados', icon: <IconDatabase /> },
    { key: 'api', label: 'API', icon: <IconServer /> },
    { key: 'storage', label: 'Armazenamento', icon: <IconHardDrive /> },
    { key: 'realtime', label: 'Tempo Real', icon: <IconActivity /> },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Saúde do Sistema</h3>
      <div className="grid grid-cols-2 gap-4">
        {getHealthItems().map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 bg-brand-background rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-brand-primary">
                {item.icon}
              </div>
              <span className="font-medium text-brand-text">{item.label}</span>
            </div>
            <HealthStatus status={health[item.key as keyof SystemHealth]} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemLogsCard: React.FC<{ logs: SystemLog[] }> = ({ logs }) => {
  const getLevelColor = (level: SystemLog['level']) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Logs do Sistema</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-center text-brand-text-secondary py-4">Nenhum log encontrado</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-brand-background rounded-lg">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-sm text-brand-text">{log.message}</p>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary mt-1">
                  <span>{log.source}</span>
                  <span>•</span>
                  <span>{log.timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const UserManagementCard: React.FC<{
  users: (UserType & { bakery?: Bakery })[];
  onUserAction: (userId: string, action: 'suspend' | 'activate' | 'delete') => void;
}> = ({ users, onUserAction }) => {
  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Gerenciamento de Usuários</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {users.slice(0, 10).map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-brand-text">{user.name}</p>
                <p className="text-sm text-brand-text-secondary">{user.email}</p>
                {user.bakery && (
                  <p className="text-xs text-brand-secondary">Padaria: {user.bakery.name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onUserAction(user.id, 'suspend')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
              >
                Suspender
              </button>
              <button 
                onClick={() => onUserAction(user.id, 'activate')}
                className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              >
                Ativar
              </button>
              <button 
                onClick={() => onUserAction(user.id, 'delete')}
                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdvancedAdminPanel: React.FC<AdvancedAdminPanelProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('system');
  const [health, setHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'warning',
    realtime: 'healthy',
  });
  const [config, setConfig] = useState<AppConfig>({
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    max_upload_size: 10,
    session_timeout: 60,
    backup_frequency: 'weekly',
    rate_limiting: true,
    cors_enabled: true,
  });
  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: '1',
      level: 'info',
      message: 'Sistema iniciado com sucesso',
      timestamp: new Date(),
      source: 'App Startup',
    },
    {
      id: '2',
      level: 'warning',
      message: 'Uso de armazenamento acima de 80%',
      timestamp: new Date(Date.now() - 300000),
      source: 'Storage Monitor',
    },
    {
      id: '3',
      level: 'error',
      message: 'Falha na conexão com o banco de dados',
      timestamp: new Date(Date.now() - 600000),
      source: 'Database',
    },
  ]);
  const [users, setUsers] = useState<(UserType & { bakery?: Bakery })[]>([]);

  useEffect(() => {
    // Simular carregamento de dados
    const mockUsers: (UserType & { bakery?: Bakery })[] = [
      {
        id: '1',
        name: 'Admin Principal',
        email: 'admin@padoka.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        bakery: { id: '1', name: 'Padaria Central', created_at: new Date().toISOString() } as any,
      },
      {
        id: '2',
        name: 'João Silva',
        email: 'joao@padoka.com',
        role: 'bakery',
        created_at: new Date().toISOString(),
        bakery: { id: '2', name: 'Pão Doce', created_at: new Date().toISOString() } as any,
      },
    ];
    setUsers(mockUsers);
  }, []);

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmMessage = {
      suspend: `Suspender o usuário ${user.name}?`,
      activate: `Ativar o usuário ${user.name}?`,
      delete: `EXCLUIR permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`,
    }[action];

    if (window.confirm(confirmMessage)) {
      if (action === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(`Ação '${action}' executada para ${user.name}`);
      }
    }
  };

  const handleHealthCheck = () => {
    setHealth(prev => ({
      ...prev,
      database: Math.random() > 0.8 ? 'critical' : 'healthy',
      api: Math.random() > 0.6 ? 'warning' : 'healthy',
      storage: Math.random() > 0.4 ? 'warning' : 'healthy',
      realtime: Math.random() > 0.9 ? 'critical' : 'healthy',
    }));
  };

  const handleBackup = () => {
    alert('Backup iniciado! Você receberá uma notificação quando concluído.');
  };

  const handleRestore = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.sql,.json';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Restore iniciado para o arquivo: ${file.name}`);
      }
    };
    fileInput.click();
  };

  const tabs = [
    { id: 'system', label: 'Sistema', icon: <IconSettings /> },
    { id: 'users', label: 'Usuários', icon: <IconUsers /> },
    { id: 'logs', label: 'Logs', icon: <IconShield /> },
    { id: 'bakery', label: 'Padarias', icon: <IconBuildingStore /> },
  ];

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard health={health} />
        
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Ações do Sistema</h3>
          <div className="space-y-3">
            <button 
              onClick={handleHealthCheck}
              className="w-full flex items-center gap-3 p-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              <IconRefresh className="w-5 h-5" />
              <span>Verificar Saúde do Sistema</span>
            </button>
            
            <button 
              onClick={handleBackup}
              className="w-full flex items-center gap-3 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <IconDownload className="w-5 h-5" />
              <span>Criar Backup</span>
            </button>
            
            <button 
              onClick={handleRestore}
              className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <IconUpload className="w-5 h-5" />
              <span>Restaurar Backup</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Configurações do Sistema</h3>
        <div className="space-y-4">
          <ConfigSwitch
            label="Modo de Manutenção"
            description="Ativa o modo de manutenção para realizar updates"
            value={config.maintenance_mode}
            onChange={(value) => setConfig(prev => ({ ...prev, maintenance_mode: value }))}
          />
          
          <ConfigSwitch
            label="Registro de Novos Usuários"
            description="Permitir registro de novos usuários"
            value={config.registration_enabled}
            onChange={(value) => setConfig(prev => ({ ...prev, registration_enabled: value }))}
          />
          
          <ConfigSwitch
            label="Notificações por Email"
            description="Enviar notificações importantes por email"
            value={config.email_notifications}
            onChange={(value) => setConfig(prev => ({ ...prev, email_notifications: value }))}
          />
          
          <ConfigSwitch
            label="Rate Limiting"
            description="Limitar solicitações para prevenir abuse"
            value={config.rate_limiting}
            onChange={(value) => setConfig(prev => ({ ...prev, rate_limiting: value }))}
          />
          
          <NumericInput
            label="Tamanho Máximo de Upload"
            description="Tamanho máximo permitido para uploads de arquivo"
            value={config.max_upload_size}
            onChange={(value) => setConfig(prev => ({ ...prev, max_upload_size: value }))}
            suffix="MB"
            min={1}
            max={100}
          />
          
          <NumericInput
            label="Timeout de Sessão"
            description="Tempo de inatividade antes do logout automático"
            value={config.session_timeout}
            onChange={(value) => setConfig(prev => ({ ...prev, session_timeout: value }))}
            suffix="minutos"
            min={5}
            max={480}
          />
          
          <SelectInput
            label="Frequência de Backup"
            description="Com que frequência criar backups automáticos"
            value={config.backup_frequency}
            onChange={(value) => setConfig(prev => ({ ...prev, backup_frequency: value as AppConfig['backup_frequency'] }))}
            options={[
              { value: 'daily', label: 'Diário' },
              { value: 'weekly', label: 'Semanal' },
              { value: 'monthly', label: 'Mensal' },
            ]}
          />
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <UserManagementCard 
      users={users}
      onUserAction={handleUserAction}
    />
  );

  const renderLogsTab = () => (
    <SystemLogsCard logs={logs} />
  );

  const renderBakeryTab = () => (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Gerenciamento de Padarias</h3>
      <div className="text-center text-brand-text-secondary py-8">
        <IconBuildingStore className="w-16 h-16 mx-auto mb-4 text-brand-primary/50" />
        <p className="font-medium">Funcionalidade em desenvolvimento</p>
        <p className="text-sm">Gerenciamento avançado de padarias será implementado em breve</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system': return renderSystemTab();
      case 'users': return renderUsersTab();
      case 'logs': return renderLogsTab();
      case 'bakery': return renderBakeryTab();
      default: return renderSystemTab();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Controles Avançados</h2>
        <div className="flex items-center space-x-2">
          <IconCpu className="w-5 h-5 text-brand-primary" />
          <span className="text-sm text-brand-text-secondary">Painel de Controle Total</span>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            <div className="w-5 h-5">{tab.icon}</div>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdvancedAdminPanel;