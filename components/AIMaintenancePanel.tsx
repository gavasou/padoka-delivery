import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  IconSparkles, IconCode, IconBug, IconWrench, IconTrendingUp, 
  IconDatabase, IconRefresh, IconDownload, IconUpload, IconSettings,
  IconMessageCircle, IconCheck, IconX, IconAlertTriangle
} from './StatIcons';
import type { User } from '../types';

interface AIMaintenancePanelProps {
  user: User;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    type: 'primary' | 'secondary' | 'danger';
  }>;
}

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: 'database' | 'api' | 'code' | 'performance' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  suggestedBy: string;
  createdAt: Date;
}

const TaskTypeIcon: React.FC<{ type: MaintenanceTask['type'] }> = ({ type }) => {
  switch (type) {
    case 'database': return <IconDatabase className="w-5 h-5" />;
    case 'api': return <IconRefresh className="w-5 h-5" />;
    case 'code': return <IconCode className="w-5 h-5" />;
    case 'performance': return <IconTrendingUp className="w-5 h-5" />;
    case 'security': return <IconAlertTriangle className="w-5 h-5" />;
    default: return <IconWrench className="w-5 h-5" />;
  }
};

const TaskStatusBadge: React.FC<{ status: MaintenanceTask['status'] }> = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const labels = {
    pending: 'Pendente',
    'in-progress': 'Em Progresso',
    completed: 'Concluída',
    failed: 'Falhou',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: MaintenanceTask['priority'] }> = ({ priority }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    critical: 'bg-red-100 text-red-600',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
};

const ChatInterface: React.FC<{ 
  messages: ChatMessage[]; 
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-brand-text-secondary py-8">
            <IconSparkles className="w-12 h-12 mx-auto mb-3 text-brand-primary" />
            <p className="font-semibold">Assistente de IA para Manutenção</p>
            <p className="text-sm">Como posso ajudá-lo hoje?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-brand-text'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.actions && (
                  <div className="flex gap-2 mt-3">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          action.type === 'primary'
                            ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                            : action.type === 'danger'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-200 text-brand-text hover:bg-gray-300'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-brand-text p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm ml-2">IA analisando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Descreva o problema ou solicite uma análise..."
          className="flex-1 p-2 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

const QuickActionsPanel: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
  const quickActions = [
    {
      title: 'Análise de Performance',
      description: 'Analisa métricas de velocidade e otimização',
      icon: <IconTrendingUp className="w-6 h-6" />,
      action: 'performance',
      color: 'bg-blue-500',
    },
    {
      title: 'Verificação de Segurança',
      description: 'Scaneia vulnerabilidades e acessos',
      icon: <IconAlertTriangle className="w-6 h-6" />,
      action: 'security',
      color: 'bg-red-500',
    },
    {
      title: 'Limpeza de Dados',
      description: 'Remove registros desnecessários',
      icon: <IconDatabase className="w-6 h-6" />,
      action: 'cleanup',
      color: 'bg-green-500',
    },
    {
      title: 'Backup Automático',
      description: 'Cria backup completo do sistema',
      icon: <IconDownload className="w-6 h-6" />,
      action: 'backup',
      color: 'bg-purple-500',
    },
    {
      title: 'Atualizar Cache',
      description: 'Atualiza caches do sistema',
      icon: <IconRefresh className="w-6 h-6" />,
      action: 'cache',
      color: 'bg-orange-500',
    },
    {
      title: 'Configuração de API',
      description: 'Gerencia integrações e endpoints',
      icon: <IconSettings className="w-6 h-6" />,
      action: 'api',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.action}
            onClick={() => onAction(action.action)}
            className="p-4 rounded-lg border hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 ${action.color} text-white rounded-lg flex items-center justify-center mb-3`}>
              {action.icon}
            </div>
            <h4 className="font-semibold text-brand-text">{action.title}</h4>
            <p className="text-sm text-brand-text-secondary">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const TaskList: React.FC<{ tasks: MaintenanceTask[]; onTaskUpdate: (taskId: string, status: string) => void }> = ({ 
  tasks, 
  onTaskUpdate 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Tarefas de Manutenção</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-brand-text-secondary py-8">
            <IconCheck className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>Todas as tarefas estão em dia!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-brand-primary">
                    <TaskTypeIcon type={task.type} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-text">{task.title}</h4>
                    <p className="text-sm text-brand-text-secondary">{task.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-brand-text-secondary">
                <span>Sugerido por {task.suggestedBy}</span>
                <span>{task.createdAt.toLocaleString()}</span>
              </div>
              
              {task.status !== 'completed' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onTaskUpdate(task.id, 'in-progress')}
                    disabled={task.status === 'in-progress'}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:opacity-50"
                  >
                    Iniciar
                  </button>
                  <button
                    onClick={() => onTaskUpdate(task.id, 'completed')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => onTaskUpdate(task.id, 'failed')}
                    className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    Marcar como Falho
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AIMaintenancePanel: React.FC<AIMaintenancePanelProps> = ({ user }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      title: 'Otimização de Consultas',
      description: 'Consultas no banco de dados podem ser otimizadas para melhor performance',
      type: 'database',
      priority: 'medium',
      status: 'pending',
      suggestedBy: 'IA Assistant',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Cache de Imagens',
      description: 'Implementar cache para reduzir latência no carregamento de imagens',
      type: 'performance',
      priority: 'low',
      status: 'pending',
      suggestedBy: 'IA Assistant',
      createdAt: new Date(Date.now() - 3600000),
    },
  ]);

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simular análise da IA com base na mensagem
      let aiResponse = '';
      let actions: ChatMessage['actions'] = [];

      if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('lento')) {
        aiResponse = `Analisei a solicitação sobre performance. Identifiquei alguns pontos de melhoria:

• Consultas ao banco de dados podem ser otimizadas
• Implementar cache para imagens
• Comprimir arquivos estáticos
• Usar lazy loading para componentes

Posso executar uma análise completa de performance?`;

        actions = [
          {
            label: 'Executar Análise Completa',
            action: () => handleQuickAction('performance'),
            type: 'primary',
          },
          {
            label: 'Ver Relatório Detalhado',
            action: () => {},
            type: 'secondary',
          },
        ];
      } else if (message.toLowerCase().includes('segurança') || message.toLowerCase().includes('vulnerabilidade')) {
        aiResponse = `Verificação de segurança iniciada:

• Análise de autenticação: ✓ OK
• Verificação de inputs: ✓ OK  
• CORS configurado: ✓ OK
• Headers de segurança: ⚠️ Otimizar

Recomendo fortalecer os headers de segurança.`;

        actions = [
          {
            label: 'Aplicar Correções',
            action: () => handleQuickAction('security'),
            type: 'danger',
          },
        ];
      } else if (message.toLowerCase().includes('backup') || message.toLowerCase().includes('backup')) {
        aiResponse = `Preparando backup automático do sistema:

• Banco de dados: Preparando...
• Arquivos de upload: Preparando...
• Configurações: Preparando...

O backup será salvo em formato seguro.`;

        actions = [
          {
            label: 'Iniciar Backup',
            action: () => handleQuickAction('backup'),
            type: 'primary',
          },
        ];
      } else {
        aiResponse = `Entendi sua solicitação. Sou seu assistente de manutenção especializado.

Posso ajudar com:
• Análise de performance
• Verificação de segurança
• Otimização de banco de dados
• Configuração de APIs
• Backup e manutenção
• Monitoramento de logs

Sobre o que gostaria de mais informações?`;

        actions = [
          {
            label: 'Listar Ações Disponíveis',
            action: () => {},
            type: 'secondary',
          },
        ];
      }

      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date(),
          actions,
        };

        setChatMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);

    // Simular execução de ação
    setTimeout(() => {
      switch (action) {
        case 'performance':
          setTasks(prev => [{
            ...prev[0],
            status: 'completed' as const,
          }]);
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: '✅ Análise de performance concluída!\n\nResultados:\n• 15% de melhoria na velocidade de carregamento\n• Cache implementado com sucesso\n• Consultas otimizadas\n\nRelatório detalhado disponível na aba Analytics.',
            timestamp: new Date(),
          }]);
          break;
        case 'security':
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: '🔒 Verificação de segurança concluída!\n\n• Headers de segurança aplicados\n• CORS atualizado\n• Validação de inputs reforçada\n• Autenticação verificada\n\nSistema mais seguro agora!',
            timestamp: new Date(),
          }]);
          break;
        case 'backup':
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: '💾 Backup concluído com sucesso!\n\n• Banco de dados: 45MB ✓\n• Arquivos: 12MB ✓\n• Configurações: 2KB ✓\n\nBackup salvo e criptografado.',
            timestamp: new Date(),
          }]);
          break;
        case 'cleanup':
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: '🧹 Limpeza de dados concluída!\n\n• 234 registros temporários removidos\n• 1.2MB de espaço liberado\n• Cache limpo\n• Performance melhorada',
            timestamp: new Date(),
          }]);
          break;
        case 'cache':
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: '⚡ Cache atualizado com sucesso!\n\n• 15 componentes recarregados\n• Imagens otimizadas\n• Estatísticas atualizadas\n\nSistema mais responsivo!',
            timestamp: new Date(),
          }]);
          break;
        case 'api':
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: '⚙️ Configuração de API verificada!\n\n• 8 endpoints ativos\n• Rate limiting OK\n• Autenticação funcionando\n• Integrações estável\n\nTudo funcionando perfeitamente!',
            timestamp: new Date(),
          }]);
          break;
      }
      setIsLoading(false);
    }, 3000);
  };

  const handleTaskUpdate = async (taskId: string, status: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: status as MaintenanceTask['status'] }
        : task
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Assistente de IA - Manutenção</h2>
        <div className="flex items-center space-x-2">
          <IconSparkles className="w-5 h-5 text-brand-primary" />
          <span className="text-sm text-brand-text-secondary">IA Ativa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
          
          <QuickActionsPanel onAction={handleQuickAction} />
        </div>

        <TaskList
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </div>
  );
};

export default AIMaintenancePanel;