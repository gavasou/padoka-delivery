import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface WhatsAppMessage {
  id: string;
  user_id: string;
  phone_number: string;
  template_name: string;
  message_content: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

interface WhatsAppIntegrationProps {
  user: User;
}

const WhatsAppTemplates = {
  order_confirmation: {
    name: 'Confirmação de Pedido',
    description: 'Confirma o pedido realizado pelo cliente',
    fields: ['customerName', 'orderNumber', 'totalAmount']
  },
  delivery_update: {
    name: 'Atualização de Entrega',
    description: 'Informa status da entrega ao cliente',
    fields: ['customerName', 'status', 'estimatedTime']
  },
  promotional: {
    name: 'Promoção',
    description: 'Envia promoções e ofertas especiais',
    fields: ['customerName', 'promotionTitle', 'discount']
  }
};

const MessageTemplateForm: React.FC<{
  template: keyof typeof WhatsAppTemplates;
  onSend: (phoneNumber: string, templateData: any) => void;
  onCancel: () => void;
}> = ({ template, onSend, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [templateData, setTemplateData] = useState<any>({});

  const templateInfo = WhatsAppTemplates[template];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      alert('Por favor, informe o número do WhatsApp');
      return;
    }

    // Validar se todos os campos obrigatórios estão preenchidos
    const missingFields = templateInfo.fields.filter(field => !templateData[field]?.trim());
    if (missingFields.length > 0) {
      alert(`Por favor, preencha todos os campos: ${missingFields.join(', ')}`);
      return;
    }

    onSend(phoneNumber, templateData);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-brand-text">
          {templateInfo.name}
        </h3>
        <button
          onClick={onCancel}
          className="text-brand-text-secondary hover:text-brand-text"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-brand-text-secondary mb-6">
        {templateInfo.description}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">
            Número do WhatsApp
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full p-3 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            maxLength={15}
          />
        </div>

        {templateInfo.fields.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-brand-text mb-2">
              {field === 'customerName' && 'Nome do Cliente'}
              {field === 'orderNumber' && 'Número do Pedido'}
              {field === 'totalAmount' && 'Valor Total'}
              {field === 'status' && 'Status da Entrega'}
              {field === 'estimatedTime' && 'Tempo Estimado'}
              {field === 'promotionTitle' && 'Título da Promoção'}
              {field === 'discount' && 'Desconto'}
            </label>
            <input
              type="text"
              value={templateData[field] || ''}
              onChange={(e) => setTemplateData(prev => ({
                ...prev,
                [field]: e.target.value
              }))}
              className="w-full p-3 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder={
                field === 'customerName' ? 'João Silva' :
                field === 'orderNumber' ? 'PDK001' :
                field === 'totalAmount' ? 'R$ 25,90' :
                field === 'status' ? 'Saiu para entrega' :
                field === 'estimatedTime' ? '15 minutos' :
                field === 'promotionTitle' ? 'Pães frescos' :
                field === 'discount' ? '20%' : ''
              }
            />
          </div>
        ))}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span>Enviar WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 border border-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-background transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

const MessageHistory: React.FC<{ messages: WhatsAppMessage[] }> = ({ messages }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'failed': return 'Falhou';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">
        Histórico de Mensagens
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-brand-text-secondary py-8">
            Nenhuma mensagem enviada ainda
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-brand-text">
                    {WhatsAppTemplates[message.template_name as keyof typeof WhatsAppTemplates]?.name || message.template_name}
                  </div>
                  <div className="text-sm text-brand-text-secondary">
                    Para: {message.phone_number}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                  {getStatusText(message.status)}
                </span>
              </div>

              <div className="text-sm text-brand-text-secondary">
                {new Date(message.created_at).toLocaleString('pt-BR')}
              </div>

              {message.error_message && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  Erro: {message.error_message}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const WhatsAppIntegration: React.FC<WhatsAppIntegrationProps> = ({ user }) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof WhatsAppTemplates | null>(null);
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = async (phoneNumber: string, templateData: any) => {
    if (!selectedTemplate) return;

    setSending(true);

    try {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-sender', {
        body: {
          userId: user.id,
          phoneNumber: `+55${cleanPhoneNumber}`,
          templateName: selectedTemplate,
          messageData: templateData,
          messageType: 'template'
        }
      });

      if (error) throw error;

      alert('Mensagem enviada com sucesso!');
      setSelectedTemplate(null);
      loadMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [user.id]);

  // Listener para novas mensagens
  useEffect(() => {
    const subscription = supabase
      .channel('whatsapp_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'whatsapp_messages',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newMessage = payload.new as WhatsAppMessage;
        setMessages(prev => [newMessage, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">WhatsApp Business</h2>
        
        <div className="flex items-center space-x-2 text-sm text-brand-text-secondary">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Integração Ativa</span>
        </div>
      </div>

      {/* Formulário de template ativo */}
      {selectedTemplate && (
        <MessageTemplateForm
          template={selectedTemplate}
          onSend={sendWhatsAppMessage}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}

      {/* Seleção de templates */}
      {!selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(WhatsAppTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key as keyof typeof WhatsAppTemplates)}
              disabled={sending}
              className="bg-white rounded-xl p-6 shadow-sm border text-left hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-text">{template.name}</h3>
                  <p className="text-sm text-brand-text-secondary">{template.description}</p>
                </div>
              </div>
              
              <div className="text-xs text-brand-text-secondary">
                Campos: {template.fields.join(', ')}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Histórico de mensagens */}
      <MessageHistory messages={messages} />
    </div>
  );
};

export default WhatsAppIntegration;