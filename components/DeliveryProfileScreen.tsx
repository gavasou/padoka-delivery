import React, { useState, useEffect } from 'react';
import type { User, FaqItem, Achievement, ChatMessage } from '../types';
import { 
    IconEdit, IconShieldCheck, IconHelpCircle, IconMessageCircle, IconChevronRight, 
    IconChevronLeft, IconSend, IconLogout, IconStar, IconTruck, IconClock, IconAward
} from './StatIcons';
import { 
    getDeliveryFaqs, getDeliveryAchievements, getSupportChatMessages
} from '../services/api';

interface DeliveryProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold text-brand-text text-center mb-4">Termo de Uso para Entregadores</h2>
            <div className="text-sm text-brand-text-secondary space-y-3 overflow-y-auto pr-2">
                <p><strong>1. Objeto do Contrato:</strong> Prestação de serviços de entrega de produtos das padarias cadastradas na plataforma Padoka e uso do app para gestão das entregas.</p>
                <p><strong>2. Ausência de Vínculo Empregatício:</strong> O entregador atua como prestador de serviço independente. Não há vínculo empregatício, societário ou qualquer relação trabalhista entre o entregador e o Padoka. Todas as obrigações trabalhistas, previdenciárias, fiscais ou tributárias são de responsabilidade do entregador.</p>
                <p><strong>3. Obrigações do Entregador:</strong> Cumprir a legislação de trânsito, realizar entregas com pontualidade e cuidado, manter dados cadastrais atualizados e informar imediatamente qualquer problema.</p>
                <p><strong>4. Pagamento e Comissão:</strong> O valor da entrega é pago diretamente pela padaria, conforme tabela ou acordo do estabelecimento. O Padoka não se responsabiliza pelo pagamento do entregador; apenas facilita o repasse de informações de pedidos.</p>
                <p><strong>5. Responsabilidades do Padoka:</strong> Disponibilizar plataforma funcional e segura. A Padoka não se responsabiliza por acidentes de trânsito, furtos ou perdas causadas por terceiros durante a entrega.</p>
                <p><strong>6. Conduta e Penalidades:</strong> O entregador deve atuar com ética e profissionalismo. O descumprimento das regras pode levar a advertência, suspensão ou exclusão do app.</p>
                <p><strong>7. Confidencialidade:</strong> O entregador não pode compartilhar dados de clientes, rotas ou informações de pedidos com terceiros.</p>
                 <p><strong>8. Legislação:</strong> Este termo é regido pela legislação brasileira. Qualquer disputa será resolvida no foro da cidade do empreendedor.</p>
            </div>
            <button onClick={onClose} className="primary w-full mt-6">Entendi</button>
        </div>
    </div>
);

const ProfileHeader: React.FC<{ user: User, onBack?: () => void, title: string, onLogout?: () => void }> = ({ user, onBack, title, onLogout }) => (
    <header className="p-4 bg-white sticky top-0 z-10 text-center border-b border-gray-200/80">
        {onBack && (
            <button onClick={onBack} className="absolute top-1/2 -translate-y-1/2 left-4 text-brand-secondary">
                <IconChevronLeft className="w-6 h-6" />
            </button>
        )}
        <h1 className="font-bold text-lg text-brand-text">{title}</h1>
        {onLogout && (
             <button onClick={onLogout} className="absolute top-1/2 -translate-y-1/2 right-4 text-brand-text-secondary hover:text-brand-secondary">
                <IconLogout className="w-6 h-6" />
            </button>
        )}
    </header>
);

const StatCard: React.FC<{icon: React.ReactNode, value: string, label: string}> = ({ icon, value, label }) => (
    <div className="bg-white p-3 rounded-xl flex-1 flex items-center shadow-sm border border-gray-200/50">
        <div className="text-brand-primary mr-3">{icon}</div>
        <div>
            <p className="font-bold text-lg text-brand-text">{value}</p>
            <p className="text-xs text-brand-text-secondary">{label}</p>
        </div>
    </div>
);

const DeliveryProfileScreen: React.FC<DeliveryProfileScreenProps> = ({ user, onLogout }) => {
    const [view, setView] = useState('main');
    const [showTerms, setShowTerms] = useState(false);
    
    // Mock data state
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
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

        if (view === 'faq') fetchData(getDeliveryFaqs, setFaqs);
        if (view === 'achievements') fetchData(getDeliveryAchievements, setAchievements);
        if (view === 'chat') fetchData(getSupportChatMessages, setChatMessages);
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
        {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        <ProfileHeader user={user} title="Meu Perfil" onLogout={onLogout} />
        <div className="p-4 bg-white pb-6">
            <div className="flex items-center">
                <img src={user.profileImageUrl} alt="Foto de Perfil" className="w-20 h-20 rounded-full border-4 border-brand-primary/50 shadow-md" />
                <div className="ml-4">
                    <h1 className="text-2xl font-bold text-brand-text">{user.name}</h1>
                    <p className="text-md font-semibold text-brand-secondary">{user.deliveryStats?.level}</p>
                </div>
            </div>
        </div>
        <div className="p-4">
            <h2 className="font-bold text-brand-text mb-3">Seu Desempenho</h2>
            <div className="flex gap-3 mb-4">
                <StatCard icon={<IconTruck className="w-6 h-6"/>} value={`${user.deliveryStats?.deliveriesMonth || 0}`} label="Entregas no mês"/>
                <StatCard icon={<IconStar className="w-6 h-6"/>} value={`${user.deliveryStats?.averageRating || 0}`} label="Avaliação Média"/>
                <StatCard icon={<IconClock className="w-6 h-6"/>} value={`${user.deliveryStats?.onTimeRate || 0}%`} label="Pontualidade"/>
            </div>

            <div className="space-y-3">
                {renderMenuItem(<IconEdit className="w-6 h-6" />, 'Editar Perfil', () => setView('edit'))}
                {/* Fix: IconAward was not imported */}
                {renderMenuItem(<IconAward className="w-6 h-6" />, 'Minhas Conquistas', () => setView('achievements'))}
                {renderMenuItem(<IconHelpCircle className="w-6 h-6" />, 'Central de Ajuda', () => setView('faq'))}
                {renderMenuItem(<IconMessageCircle className="w-6 h-6" />, 'Falar com Suporte', () => setView('chat'))}
                {renderMenuItem(<IconShieldCheck className="w-6 h-6" />, 'Termos de Uso', () => setShowTerms(true))}
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
                <div><label className="text-sm font-medium">Veículo</label><input type="text" defaultValue={user.vehicle} /></div>
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
            <ProfileHeader user={user} onBack={() => setView('main')} title="Suporte Padoka" />
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

export default DeliveryProfileScreen;