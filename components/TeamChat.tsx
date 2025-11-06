import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { 
  IconMessageCircle, IconSend, IconUsers, IconCircle, 
  IconPhone, IconVideo, IconPaperclip, IconSearch,
  IconSettings, IconExit, IconCheck, IconClock, IconX
} from './StatIcons';
import type { User } from '../types';

interface TeamChatProps {
  currentUser: User;
  onLogout: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'suporte' | 'moderador' | 'desenvolvedor';
  avatar_url?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: TeamMember['role'];
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reply_to?: {
    id: string;
    content: string;
    sender_name: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group' | 'support';
  members: TeamMember[];
  last_message?: ChatMessage;
  unread_count: number;
}

const StatusIndicator: React.FC<{ status: TeamMember['status'] }> = ({ status }) => {
  const colors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400',
  };

  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]}`} title={status} />
  );
};

const getRoleColor = (role: TeamMember['role']) => {
  const colors = {
    admin: 'bg-red-100 text-red-600',
    suporte: 'bg-blue-100 text-blue-600',
    moderador: 'bg-purple-100 text-purple-600',
    desenvolvedor: 'bg-green-100 text-green-600',
  };
  return colors[role] || 'bg-gray-100 text-gray-600';
};

const getRoleLabel = (role: TeamMember['role']) => {
  const labels = {
    admin: 'Admin',
    suporte: 'Suporte',
    moderador: 'Moderação',
    desenvolvedor: 'Dev',
  };
  return labels[role] || role;
};

const MemberList: React.FC<{ 
  members: TeamMember[];
  onStartPrivateChat: (member: TeamMember) => void;
  onSettings?: () => void;
}> = ({ members, onStartPrivateChat, onSettings }) => {
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl p-4 border h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-brand-text">Equipe ({members.length})</h3>
        <button 
          onClick={onSettings}
          className="text-brand-text-secondary hover:text-brand-text"
          title="Configurações da equipe"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
        <input
          type="text"
          placeholder="Buscar membro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-background cursor-pointer transition-colors"
            onClick={() => onStartPrivateChat(member)}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                {member.avatar_url ? (
                  <img 
                    src={member.avatar_url} 
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  member.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <StatusIndicator status={member.status} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brand-text truncate">{member.name}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
                {member.status === 'offline' && member.last_seen && (
                  <span className="text-xs text-brand-text-secondary">
                    {new Date(member.last_seen).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatHeader: React.FC<{ 
  room: ChatRoom | null;
  onCall: () => void;
  onVideoCall: () => void;
  onExit: () => void;
}> = ({ room, onCall, onVideoCall, onExit }) => {
  if (!room) {
    return (
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-brand-text">Chat da Equipe</h3>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
          <IconMessageCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-text">{room.name}</h3>
          <p className="text-sm text-brand-text-secondary">
            {room.members.length} membro{room.members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onCall}
          className="p-2 text-brand-text-secondary hover:text-brand-text hover:bg-gray-100 rounded-lg transition-colors"
          title="Chamada de voz"
        >
          <IconPhone className="w-4 h-4" />
        </button>
        <button 
          onClick={onVideoCall}
          className="p-2 text-brand-text-secondary hover:text-brand-text hover:bg-gray-100 rounded-lg transition-colors"
          title="Videoconferência"
        >
          <IconVideo className="w-4 h-4" />
        </button>
        <button 
          onClick={onExit}
          className="p-2 text-brand-text-secondary hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          title="Sair do chat"
        >
          <IconExit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ 
  message: ChatMessage;
  isOwn: boolean;
  onReply?: (message: ChatMessage) => void;
}> = ({ message, isOwn, onReply }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleClick = () => {
    if (message.type === 'text' && onReply) {
      onReply(message);
    }
  };

  if (message.type === 'system') {
    return (
      <div className="text-center my-2">
        <span className="text-xs text-brand-text-secondary bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-brand-text">{message.sender_name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(message.sender_role)}`}>
              {getRoleLabel(message.sender_role)}
            </span>
          </div>
        )}
        
        <div
          className={`p-3 rounded-lg ${
            isOwn 
              ? 'bg-brand-primary text-white rounded-br-sm' 
              : 'bg-gray-100 text-brand-text rounded-bl-sm'
          }`}
          onClick={handleClick}
        >
          {message.reply_to && (
            <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
              isOwn ? 'bg-white/20 border-white/30' : 'bg-brand-background border-brand-primary/30'
            }`}>
              <span className="font-medium">Responder a {message.reply_to.sender_name}:</span>
              <p className="truncate">{message.reply_to.content}</p>
            </div>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2 mb-2">
              {message.attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white/20 rounded">
                  <IconPaperclip className="w-4 h-4" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-brand-text-secondary ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && (
            <div className="flex items-center">
              <IconCheck className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatMessages: React.FC<{ 
  messages: ChatMessage[];
  currentUserId: string;
  onReply: (message: ChatMessage) => void;
}> = ({ messages, currentUserId, onReply }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-brand-background">
      {messages.length === 0 ? (
        <div className="text-center text-brand-text-secondary py-8">
          <IconMessageCircle className="w-16 h-16 mx-auto mb-4 text-brand-primary/50" />
          <p className="font-medium">Bem-vindo ao Chat da Equipe!</p>
          <p className="text-sm">Compartilhe informações e coordene atividades aqui.</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
            onReply={onReply}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const MessageInput: React.FC<{ 
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
}> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-4 border-t">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <IconPaperclip className="w-4 h-4" />
              <span className="text-sm">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-red-500 hover:text-red-700"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-brand-text-secondary hover:text-brand-text hover:bg-gray-100 rounded-lg transition-colors"
          title="Anexar arquivo"
        >
          <IconPaperclip className="w-5 h-5" />
        </button>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="flex-1 p-3 border border-brand-primary rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
          rows={1}
          disabled={disabled}
        />
        
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconSend className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TeamChat: React.FC<TeamChatProps> = ({ currentUser, onLogout }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      id: 'team-general',
      name: 'Geral da Equipe',
      type: 'group',
      members: [],
      unread_count: 2,
    },
    {
      id: 'support-chat',
      name: 'Suporte',
      type: 'support',
      members: [],
      unread_count: 0,
    },
  ]);

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Você',
      email: currentUser.email || '',
      role: 'admin',
      status: 'online',
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao@padoka.com',
      role: 'suporte',
      status: 'online',
    },
    {
      id: '3',
      name: 'Maria Santos',
      email: 'maria@padoka.com',
      role: 'moderador',
      status: 'away',
    },
    {
      id: '4',
      name: 'Pedro Costa',
      email: 'pedro@padoka.com',
      role: 'desenvolvedor',
      status: 'busy',
    },
  ]);

  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(rooms[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Sistema de chat da equipe iniciado com sucesso! 🚀',
      sender_id: 'system',
      sender_name: 'Sistema',
      sender_role: 'admin',
      timestamp: new Date(Date.now() - 300000),
      type: 'system',
    },
    {
      id: '2',
      content: 'Todos podem se comunicar aqui para coordenarem atividades.',
      sender_id: '1',
      sender_name: currentUser.name || 'Admin',
      sender_role: 'admin',
      timestamp: new Date(Date.now() - 240000),
      type: 'text',
    },
    {
      id: '3',
      content: 'Ótimo! Vou usar para organizar as tarefas do suporte.',
      sender_id: '2',
      sender_name: 'João Silva',
      sender_role: 'suporte',
      timestamp: new Date(Date.now() - 180000),
      type: 'text',
    },
  ]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);

  const handleSendMessage = (content: string, attachments?: File[]) => {
    setSending(true);
    
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: replyTo ? `${content} (responder a ${replyTo.sender_name})` : content,
        sender_id: currentUser.id,
        sender_name: currentUser.name || 'Admin',
        sender_role: 'admin',
        timestamp: new Date(),
        type: 'text',
        reply_to: replyTo ? {
          id: replyTo.id,
          content: replyTo.content,
          sender_name: replyTo.sender_name,
        } : undefined,
        attachments: attachments?.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
        })),
      };

      setMessages(prev => [...prev, newMessage]);
      setReplyTo(null);
      setSending(false);
    }, 1000);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
  };

  const handleCall = () => {
    alert('Funcionalidade de chamada em breve!');
  };

  const handleVideoCall = () => {
    alert('Videoconferência será implementada em breve!');
  };

  const handleExit = () => {
    setCurrentRoom(null);
  };

  const handleStartPrivateChat = (member: TeamMember) => {
    // Criar sala privada
    const privateRoom: ChatRoom = {
      id: `private-${member.id}`,
      name: `Chat com ${member.name}`,
      type: 'private',
      members: [currentUser, member],
      unread_count: 0,
    };
    
    setRooms(prev => [...prev, privateRoom]);
    setCurrentRoom(privateRoom);
  };

  const getUnreadCount = (roomId: string) => {
    return rooms.find(room => room.id === roomId)?.unread_count || 0;
  };

  return (
    <div className="flex h-screen bg-brand-background">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-text">Chat da Equipe</h2>
            <button
              onClick={onLogout}
              className="text-brand-text-secondary hover:text-brand-text"
            >
              <IconExit className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-brand-background rounded-lg">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-medium text-brand-text">{currentUser.name || 'Admin'}</p>
              <div className="flex items-center gap-1">
                <StatusIndicator status="online" />
                <span className="text-xs text-brand-text-secondary">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">SALAS</h3>
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setCurrentRoom(room)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    currentRoom?.id === room.id 
                      ? 'bg-brand-primary text-white' 
                      : 'hover:bg-brand-background text-brand-text'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentRoom?.id === room.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <IconMessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{room.name}</p>
                    <p className="text-xs opacity-70">
                      {room.members.length} membros
                    </p>
                  </div>
                  {getUnreadCount(room.id) > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getUnreadCount(room.id)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <MemberList 
            members={members}
            onStartPrivateChat={handleStartPrivateChat}
            onSettings={() => alert('Configurações da equipe em breve!')}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader
          room={currentRoom}
          onCall={handleCall}
          onVideoCall={handleVideoCall}
          onExit={handleExit}
        />

        <ChatMessages
          messages={messages}
          currentUserId={currentUser.id}
          onReply={handleReply}
        />

        {currentRoom && (
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={sending}
          />
        )}
      </div>
    </div>
  );
};

export default TeamChat;