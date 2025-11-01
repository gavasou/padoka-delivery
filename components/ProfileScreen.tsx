
import React, { useState, useEffect } from 'react';
import type { User, FaqItem, Achievement, GalleryImage, ChatMessage } from '../types';
import { 
    IconEdit, IconAward, IconCamera, IconHelpCircle, IconMessageCircle, IconChevronRight, 
    IconChevronLeft, IconSend, IconLogout
} from './StatIcons';
import { 
    getClientFaqs, getClientAchievements, getGalleryImages, getClientChatMessages 
} from '../services/api';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const ProfileHeader: React.FC<{ user: User, onBack?: () => void, title: string }> = ({ user, onBack, title }) => (
    <header className="p-4 bg-white sticky top-0 z-10 text-center border-b border-gray-200/80">
        {onBack && (
            <button onClick={onBack} className="absolute top-1/2 -translate-y-1/2 left-4 text-brand-secondary">
                <IconChevronLeft className="w-6 h-6" />
            </button>
        )}
        <h1 className="font-bold text-lg text-brand-text">{title}</h1>
    </header>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
    const [view, setView] = useState('main');
    
    // Mock data state
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async (fetcher: () => Promise<any>, setter: (data: any) => void) => {
            setLoading(true);
            try {
                const data = await fetcher();
                setter(data);
            } catch (e) {
                console.error("Failed to fetch profile data", e);
            } finally {
                setLoading(false);
            }
        };

        if (view === 'faq') fetchData(getClientFaqs, setFaqs);
        if (view === 'achievements') fetchData(getClientAchievements, setAchievements);
        if (view === 'gallery') fetchData(getGalleryImages, setGalleryImages);
        if (view === 'chat') fetchData(getClientChatMessages, setChatMessages);
    }, [view]);

    const renderMenuItem = (icon: React.ReactNode, label: string, onClick: () => void) => (
        <button onClick={onClick} className="flex items-center w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-200/50 active:scale-[0.98] transition-transform">
            <div className="text-brand-primary mr-4">{icon}</div>
            <span className="flex-1 font-semibold text-brand-text">{label}</span>
            <IconChevronRight className="w-5 h-5 text-gray-400" />
        </button>
    );
    
    const MainView = () => (
        <>
        <div className="p-4 bg-white pb-6 rounded-b-2xl shadow-sm">
            <div className="flex flex-col items-center">
                <img src={user.profileImageUrl} alt="Foto de Perfil" className="w-24 h-24 rounded-full border-4 border-brand-primary/50 shadow-md" />
                <h1 className="text-2xl font-bold mt-3 text-brand-text">{user.name}</h1>
                <p className="text-md font-semibold text-brand-secondary">{user.gamification?.level}</p>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-brand-text-secondary mb-1">
                    <span>Progresso</span>
                    <span>{user.gamification?.points} / {user.gamification?.nextLevelPoints} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${((user.gamification?.points || 0) / (user.gamification?.nextLevelPoints || 1)) * 100}%` }}></div>
                </div>
            </div>
        </div>
        <div className="p-4 space-y-3">
            {renderMenuItem(<IconEdit className="w-6 h-6" />, 'Editar Perfil', () => setView('edit'))}
            {renderMenuItem(<IconAward className="w-6 h-6" />, 'Minhas Conquistas', () => setView('achievements'))}
            {renderMenuItem(<IconCamera className="w-6 h-6" />, 'Galeria de Fotos', () => setView('gallery'))}
            {renderMenuItem(<IconHelpCircle className="w-6 h-6" />, 'Central de Ajuda', () => setView('faq'))}
            {renderMenuItem(<IconMessageCircle className="w-6 h-6" />, 'Falar com a Padaria', () => setView('chat'))}
            
            {/* Botão de Logout */}
            <div className="pt-2">
                <button 
                    onClick={onLogout} 
                    className="flex items-center w-full text-left p-4 bg-red-50 rounded-xl shadow-sm border border-red-200/50 active:scale-[0.98] transition-transform text-red-600"
                >
                    <div className="text-red-500 mr-4">
                        <IconLogout className="w-6 h-6" />
                    </div>
                    <span className="flex-1 font-semibold">Sair</span>
                    <IconChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </div>
        </>
    );

    const SubViewContainer: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
        <div className="flex flex-col h-full bg-brand-background">
            <ProfileHeader user={user} onBack={() => setView('main')} title={title} />
            <main className="flex-1 overflow-y-auto p-4">
                {loading ? <div className="text-center">Carregando...</div> : children}
            </main>
        </div>
    );

    switch (view) {
        case 'edit': return <SubViewContainer title="Editar Perfil">
            <div className="bg-white p-4 rounded-xl space-y-4">
                <div><label className="text-sm font-medium">Nome</label><input type="text" defaultValue={user.name} /></div>
                <div><label className="text-sm font-medium">Email</label><input type="email" defaultValue={user.email} /></div>
                <div><label className="text-sm font-medium">Telefone</label><input type="tel" defaultValue={user.phone} /></div>
                <div><label className="text-sm font-medium">Endereço</label><input type="text" defaultValue={user.address} /></div>
                <button className="primary w-full !mt-6">Salvar Alterações</button>
            </div>
        </SubViewContainer>;
        case 'achievements': return <SubViewContainer title="Minhas Conquistas">
            <div className="space-y-3">
                {achievements.map(ach => (
                    <div key={ach.id} className="bg-white p-4 rounded-xl flex items-center">
                        <span className="text-3xl mr-4">{ach.icon}</span>
                        <div>
                            <h3 className="font-bold text-brand-text">{ach.title}</h3>
                            <p className="text-sm text-brand-text-secondary">{ach.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </SubViewContainer>;
        case 'gallery': return <SubViewContainer title="Galeria de Fotos">
            <div className="grid grid-cols-2 gap-3">
            {galleryImages.map(img => (
                <div key={img.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <img src={img.imageUrl} alt={img.caption} className="w-full h-32 object-cover" />
                    <div className="p-2">
                        <p className="text-xs text-brand-text-secondary truncate">{img.caption}</p>
                        <p className="text-xs font-semibold text-brand-text">❤️ {img.likes} curtidas</p>
                    </div>
                </div>
            ))}
            </div>
        </SubViewContainer>;
        case 'faq': return <SubViewContainer title="Central de Ajuda">
            <div className="space-y-3">
                {faqs.map(faq => (
                    <details key={faq.id} className="bg-white p-4 rounded-xl shadow-sm">
                        <summary className="font-semibold text-brand-text cursor-pointer">{faq.question}</summary>
                        <p className="text-sm text-brand-text-secondary mt-2">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </SubViewContainer>;
        case 'chat': return <div className="flex flex-col h-full bg-brand-background">
            <ProfileHeader user={user} onBack={() => setView('main')} title="Pão Quente & Cia" />
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-primary text-brand-secondary rounded-br-none' : 'bg-white text-brand-text rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-brand-secondary/70' : 'text-brand-text-secondary'} text-right`}>{msg.timestamp}</p>
                        </div>
                    </div>
                ))}
            </main>
            <footer className="p-2 bg-white border-t">
                <div className="flex items-center">
                    <input type="text" placeholder="Digite sua mensagem..." className="flex-1 !border-transparent focus:!ring-0" />
                    <button className="p-2 rounded-full bg-brand-primary text-brand-secondary"><IconSend className="w-6 h-6" /></button>
                </div>
            </footer>
        </div>;
        default: return <MainView />;
    }
};

export default ProfileScreen;