
import React, { useState, useEffect } from 'react';
import type { User, PlatformStats, Bakery, FeedPost, Product, MarketingCampaign, AppNotification, AIMarketingSuggestion, PaymentGateway, PaymentStats, PaymentTransaction } from '../types';
import { 
    getPlatformStats, getAllBakeriesForAdmin, getAllFeedPostsForModeration, moderatePost,
    getAllProductsForAdmin, createMarketingCampaign, getMarketingCampaigns, sendNotification, getNotifications,
    getPendingRegistrations, updateRegistrationStatus, getAIMarketingSuggestions,
    updateMarketingCampaign, removeMarketingCampaign,
    getPaymentGateways, updatePaymentGateway, getPaymentStats, getRecentTransactions
} from '../services/api';
import { 
    IconLogout, IconCurrencyDollar, IconRepeat, IconBuildingStore, IconUsers, IconEye, 
    IconCheck, IconTrash, IconCash, IconTruck, IconLayoutDashboard, IconMegaphone, IconTarget, IconShield,
    IconUserCheck, IconUserX, IconSparkles, IconEdit, IconCreditCard, IconMessageCircle, IconSettings, IconCpu
} from './StatIcons';
import Analytics from './Analytics';
import SystemMonitor from './SystemMonitor';
import WhatsAppIntegration from './WhatsAppIntegration';
import AIMaintenancePanel from './AIMaintenancePanel';
import TeamChat from './TeamChat';
import AdvancedAdminPanel from './AdvancedAdminPanel';
import BankingManager from './BankingManager';
import PIXPaymentSystem from './PIXPaymentSystem';
import FinancialDashboard from './FinancialDashboard';

interface AdminAppProps {
  user: User;
  onLogout: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string; }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 flex-1 min-w-[150px]">
        <div className={`w-8 h-8 mb-2 ${colorClass}`}>{icon}</div>
        <p className="text-sm text-brand-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-brand-text">{value}</p>
    </div>
);

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

// --- SUB-COMPONENTS FOR TABS ---

const DashboardView: React.FC<{ stats: PlatformStats | null }> = ({ stats }) => (
     <section className="space-y-6">
        <div>
            <h3 className="font-bold text-lg mb-3 text-brand-text">Visão Geral Financeira</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
                <StatCard title="Receita Total" value={formatCurrency(stats?.totalRevenue || 0)} icon={<IconCurrencyDollar />} colorClass="text-green-500" />
                <StatCard title="Comissão (10%)" value={formatCurrency(stats?.appCommission || 0)} icon={<IconCash />} colorClass="text-brand-primary" />
                <StatCard title="Repasses" value={formatCurrency(stats?.payoutsToBakeries || 0)} icon={<IconTruck />} colorClass="text-blue-500" />
            </div>
        </div>
        <div>
            <h3 className="font-bold text-lg mb-3 text-brand-text">Métricas da Plataforma</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
                <StatCard title="Assinaturas Ativas" value={`${stats?.activeSubscriptions || 0}`} icon={<IconRepeat />} colorClass="text-brand-secondary" />
                <StatCard title="Padarias" value={`${stats?.totalBakeries || 0}`} icon={<IconBuildingStore />} colorClass="text-purple-500" />
                <StatCard title="Clientes" value={`${stats?.totalClients || 0}`} icon={<IconUsers />} colorClass="text-pink-500" />
            </div>
        </div>
    </section>
);

const CampaignFormModal: React.FC<{
    campaign: Partial<MarketingCampaign> | null;
    allProducts: (Product & { bakeryName: string })[];
    onSave: (campaign: Omit<MarketingCampaign, 'id' | 'views' | 'clicks'> | MarketingCampaign) => void;
    onClose: () => void;
}> = ({ campaign, allProducts, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        productId: campaign?.productId || '',
        startDate: campaign?.startDate || '',
        endDate: campaign?.endDate || '',
        status: campaign?.status || 'Agendada',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedProduct = allProducts.find(p => p.id === formData.productId);
        if (!selectedProduct) {
            alert("Selecione um produto válido.");
            return;
        }

        const campaignData = {
            ...formData,
            productName: selectedProduct.name,
            bakeryName: selectedProduct.bakeryName,
        };
        
        if (campaign && 'id' in campaign) {
            onSave({ ...campaign, ...campaignData });
        } else {
            onSave(campaignData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-brand-text mb-4">{campaign?.id ? 'Editar Campanha' : 'Criar Campanha'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="productId" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} required>
                        <option value="">Selecione um produto</option>
                        {allProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.bakeryName})</option>
                        ))}
                    </select>
                    <input type="date" name="startDate" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                    <input type="date" name="endDate" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                    <select name="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MarketingCampaign['status']})} required>
                        <option value="Agendada">Agendada</option>
                        <option value="Ativa">Ativa</option>
                        <option value="Concluída">Concluída</option>
                    </select>
                    <div className="flex gap-3 !mt-6">
                        <button type="button" onClick={onClose} className="secondary w-full !bg-gray-200 !text-gray-700">Cancelar</button>
                        <button type="submit" className="primary w-full">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const MarketingView: React.FC = () => {
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [allProducts, setAllProducts] = useState<(Product & { bakeryName: string })[]>([]);
    const [suggestions, setSuggestions] = useState<AIMarketingSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

    const fetchCampaigns = async () => {
        const data = await getMarketingCampaigns();
        setCampaigns(data);
    };

    useEffect(() => {
        fetchCampaigns();
        getAllProductsForAdmin().then(setAllProducts);
    }, []);

    const handleGenerateSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const data = await getAIMarketingSuggestions();
            setSuggestions(data);
        } catch(e) {
            console.error(e);
            alert("Erro ao gerar sugestões.");
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSaveCampaign = async (campaignData: Omit<MarketingCampaign, 'id' | 'views' | 'clicks'> | MarketingCampaign) => {
        if ('id' in campaignData) {
            await updateMarketingCampaign(campaignData);
        } else {
            await createMarketingCampaign(campaignData);
        }
        setShowModal(false);
        setEditingCampaign(null);
        fetchCampaigns();
    };

    const handleDeleteCampaign = async (campaignId: string) => {
        if (window.confirm("Tem certeza que deseja remover esta campanha?")) {
            await removeMarketingCampaign(campaignId);
            fetchCampaigns();
        }
    };

    return (
        <section className="space-y-6">
            {showModal && (
                <CampaignFormModal 
                    campaign={editingCampaign} 
                    allProducts={allProducts}
                    onClose={() => {setShowModal(false); setEditingCampaign(null);}} 
                    onSave={handleSaveCampaign} 
                />
            )}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-brand-text">Campanhas de Marketing</h3>
                    <button onClick={() => {setEditingCampaign(null); setShowModal(true);}} className="primary !py-2 !px-4 text-sm">Criar Campanha</button>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 space-y-3">
                   {campaigns.map(c => (
                       <div key={c.id} className="pb-2 border-b last:border-none">
                           <div className="flex justify-between items-start">
                               <div>
                                   <p className="font-bold">{c.productName} <span className="text-xs font-normal text-brand-text-secondary">({c.bakeryName})</span></p>
                                   <p className="text-sm text-brand-text-secondary">{c.startDate} - {c.endDate}</p>
                               </div>
                               <div className="flex gap-2">
                                   <button onClick={() => {setEditingCampaign(c); setShowModal(true);}} className="p-1 text-brand-text-secondary"><IconEdit className="w-4 h-4" /></button>
                                   <button onClick={() => handleDeleteCampaign(c.id)} className="p-1 text-red-500"><IconTrash className="w-4 h-4" /></button>
                               </div>
                           </div>
                           <div className="flex justify-between items-center text-xs mt-1">
                               <span className={`font-bold px-2 py-0.5 rounded-full ${c.status === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                               <span>{c.views} visualizações / {c.clicks} cliques</span>
                           </div>
                       </div>
                   ))}
                </div>
            </div>
            <div>
                 <h3 className="font-bold text-lg mb-3 text-brand-text">Marketing Inteligente</h3>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50">
                    <button onClick={handleGenerateSuggestions} disabled={loadingSuggestions} className="w-full secondary flex items-center justify-center gap-2">
                        {loadingSuggestions ? 'Analisando dados...' : <> <IconSparkles className="w-5 h-5"/> Obter Sugestões com IA </>}
                    </button>
                    {suggestions.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {suggestions.map((s, i) => (
                                <div key={i} className="bg-brand-background p-3 rounded-lg">
                                    <h4 className="font-bold text-brand-text">{s.title}</h4>
                                    <p className="text-sm text-brand-text-secondary my-1">"{s.description}"</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs font-semibold text-brand-secondary">Produto: {s.productName}</span>
                                        <button onClick={() => {
                                            const product = allProducts.find(p => p.name === s.productName);
                                            setEditingCampaign({ productId: product?.id || ''} as MarketingCampaign);
                                            setShowModal(true);
                                        }} className="primary !py-1 !px-3 text-xs">Criar Campanha</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            </div>
        </section>
    );
};

const LeadsView: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    useEffect(() => {
        getNotifications().then(setNotifications);
    }, []);
    
    return (
        <section>
             <h3 className="font-bold text-lg mb-3 text-brand-text">Ativação de Leads</h3>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 mb-6">
                <h4 className="font-semibold text-brand-text mb-2">Enviar Nova Notificação</h4>
                <textarea placeholder="Sua mensagem para os clientes..." rows={3}></textarea>
                <div className="flex justify-between items-center mt-2">
                    <select className="!p-2 text-sm">
                        <option>Clientes Recentes</option>
                        <option>Assinantes Ativos</option>
                        <option>Todos os Clientes</option>
                    </select>
                    <button className="primary !py-2 !px-4 text-sm">Enviar</button>
                </div>
             </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50">
                 <h4 className="font-semibold text-brand-text mb-2">Histórico de Envios</h4>
                 <div className="space-y-3">
                    {notifications.map(n => (
                        <div key={n.id} className="pb-2 border-b last:border-none">
                            <p className="text-sm text-brand-text-secondary truncate">{n.message}</p>
                            <div className="flex justify-between items-center text-xs mt-1 text-brand-text-secondary">
                                <span>Para: <span className="font-semibold">{n.segment}</span></span>
                                <span>{n.opens} aberturas / {n.clicks} cliques</span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
        </section>
    );
};

const ModerationView: React.FC = () => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    
    const fetchPosts = async () => {
        const data = await getAllFeedPostsForModeration();
        setPosts(data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleModeratePost = async (postId: string, action: 'approve' | 'remove') => {
        await moderatePost(postId, action);
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <section>
            <h3 className="font-bold text-lg mb-3 text-brand-text">Moderar Feed ({posts.length})</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="pb-3 border-b last:border-none">
                        <div className="flex items-start gap-3">
                            <img src={post.user.profileImageUrl} alt={post.user.name} className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-brand-text">{post.user.name} <span className="font-normal text-xs text-brand-text-secondary">em</span> {post.bakeryName}</p>
                                <p className="text-sm text-brand-text-secondary mt-1">{post.caption}</p>
                                {post.imageUrl && <img src={post.imageUrl} className="mt-2 rounded-lg w-full h-auto max-h-40 object-cover" />}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => handleModeratePost(post.id, 'remove')} className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-md flex items-center gap-1"><IconTrash className="w-3 h-3" /> Remover</button>
                            <button onClick={() => handleModeratePost(post.id, 'approve')} className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-md flex items-center gap-1"><IconCheck className="w-3 h-3" /> Aprovar</button>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && <p className="text-center text-sm text-brand-text-secondary py-4">Nenhum post para moderar. Tudo em ordem!</p>}
            </div>
        </section>
    );
};

const BakeriesView: React.FC = () => {
    const [bakeries, setBakeries] = useState<Bakery[]>([]);
    useEffect(() => {
        getAllBakeriesForAdmin().then(setBakeries);
    }, []);

    return (
        <section>
            <h3 className="font-bold text-lg mb-3 text-brand-text">Gerenciar Padarias</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 space-y-3">
                {bakeries.map(bakery => (
                    <div key={bakery.id} className="flex justify-between items-center pb-2 border-b last:border-none">
                        <div>
                            <p className="font-semibold text-brand-text">{bakery.name}</p>
                            <p className="text-xs text-brand-text-secondary">{bakery.activeSubscriptions} assinantes</p>
                        </div>
                        <button className="text-sm font-semibold text-brand-secondary flex items-center gap-1"><IconEye className="w-4 h-4" /> Visualizar</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

const RegistrationManagementView: React.FC = () => {
    const [pending, setPending] = useState<{ bakeries: Bakery[], deliveries: User[] }>({ bakeries: [], deliveries: [] });

    const fetchPending = async () => {
        const data = await getPendingRegistrations();
        setPending(data);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleUpdate = async (id: string, type: 'bakery' | 'delivery', status: 'approved' | 'suspended') => {
        await updateRegistrationStatus(id, type, status);
        fetchPending(); // Refresh the list
    };

    return (
        <section className="space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-3 text-brand-text">Novas Padarias ({pending.bakeries.length})</h3>
                {pending.bakeries.length > 0 ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 space-y-3">
                        {pending.bakeries.map(b => (
                            <div key={b.id} className="pb-2 border-b last:border-none">
                                <p className="font-bold">{b.name}</p>
                                <p className="text-sm text-brand-text-secondary">{b.address}</p>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => handleUpdate(b.id, 'bakery', 'suspended')} className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-md">Recusar</button>
                                    <button onClick={() => handleUpdate(b.id, 'bakery', 'approved')} className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-md">Aprovar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-sm text-brand-text-secondary py-4 bg-white rounded-xl">Nenhuma nova padaria para aprovar.</p>}
            </div>
             <div>
                <h3 className="font-bold text-lg mb-3 text-brand-text">Novos Entregadores ({pending.deliveries.length})</h3>
                 {pending.deliveries.length > 0 ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 space-y-3">
                        {pending.deliveries.map(d => (
                            <div key={d.id} className="pb-2 border-b last:border-none">
                                <p className="font-bold">{d.name}</p>
                                <p className="text-sm text-brand-text-secondary">{d.email} - Veículo: {d.vehicle}</p>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => handleUpdate(d.id, 'delivery', 'suspended')} className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-md">Recusar</button>
                                    <button onClick={() => handleUpdate(d.id, 'delivery', 'approved')} className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-md">Aprovar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-sm text-brand-text-secondary py-4 bg-white rounded-xl">Nenhum novo entregador para aprovar.</p>}
            </div>
        </section>
    );
};

const GatewayConfigModal: React.FC<{
    gateway: PaymentGateway;
    onSave: (gateway: PaymentGateway) => void;
    onClose: () => void;
}> = ({ gateway, onSave, onClose }) => {
    const [formData, setFormData] = useState(gateway);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-brand-text mb-4">Configurar {gateway.name}</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="API Key / Chave" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
                    <label className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold text-brand-text">Ativar Gateway</span>
                        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setFormData({...formData, status: formData.status === 'active' ? 'inactive' : 'active'})}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </label>
                </div>
                <div className="flex gap-3 !mt-6">
                    <button type="button" onClick={onClose} className="secondary w-full !bg-gray-200 !text-gray-700">Cancelar</button>
                    <button type="button" onClick={handleSave} className="primary w-full">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const PIXSystemView: React.FC<{ user: User }> = ({ user }) => {
    const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'banking' | 'transfers'>('dashboard');

    return (
        <section className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50">
                <h3 className="font-bold text-xl mb-4 text-brand-text">Sistema PIX e Repasses Automaticos</h3>
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveSubTab('dashboard')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            activeSubTab === 'dashboard'
                                ? 'bg-brand-primary text-brand-secondary'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Dashboard Financeiro
                    </button>
                    <button
                        onClick={() => setActiveSubTab('banking')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            activeSubTab === 'banking'
                                ? 'bg-brand-primary text-brand-secondary'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Dados Bancarios
                    </button>
                    <button
                        onClick={() => setActiveSubTab('transfers')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            activeSubTab === 'transfers'
                                ? 'bg-brand-primary text-brand-secondary'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Transferencias PIX
                    </button>
                </div>
            </div>

            {activeSubTab === 'dashboard' && (
                <FinancialDashboard userId={user.id} userRole={user.role} />
            )}

            {activeSubTab === 'banking' && (
                <div className="space-y-6">
                    {(user.role === 'BAKERY' || user.role === 'ADMIN') && (
                        <BankingManager userType="BAKERY" userId={user.id} />
                    )}
                    {(user.role === 'DELIVERY' || user.role === 'ADMIN') && (
                        <BankingManager userType="DELIVERY" userId={user.id} />
                    )}
                    {user.role === 'ADMIN' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                            <p className="text-sm text-blue-800">
                                Como administrador, voce pode visualizar e gerenciar os dados bancarios de todas as padarias e entregadores.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'transfers' && (
                <PIXPaymentSystem userId={user.id} userRole={user.role} />
            )}
        </section>
    );
};

const PaymentsView: React.FC = () => {
    const [gateways, setGateways] = useState<PaymentGateway[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);

    const fetchData = async () => {
        const [gwData, statsData, trData] = await Promise.all([
            getPaymentGateways(),
            getPaymentStats(),
            getRecentTransactions(),
        ]);
        setGateways(gwData);
        setStats(statsData);
        setTransactions(trData);
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleSaveGateway = async (gateway: PaymentGateway) => {
        await updatePaymentGateway(gateway);
        fetchData(); // Refresh all data
    };
    
    const statusColors = {
        'Aprovada': 'text-green-600',
        'Pendente': 'text-orange-500',
        'Recusada': 'text-red-500'
    };

    return (
        <section className="space-y-6">
            {editingGateway && <GatewayConfigModal gateway={editingGateway} onClose={() => setEditingGateway(null)} onSave={handleSaveGateway} />}
            <div>
                <h3 className="font-bold text-lg mb-3 text-brand-text">Financeiro</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <StatCard title="Receita (Hoje)" value={formatCurrency(stats?.revenueToday || 0)} icon={<IconCurrencyDollar />} colorClass="text-green-500" />
                    <StatCard title="Transações Aprovadas" value={`${stats?.approvedTransactions || 0}`} icon={<IconCheck />} colorClass="text-blue-500" />
                    <StatCard title="Falhas de Pagamento" value={`${stats?.failedTransactions || 0}`} icon={<IconTrash />} colorClass="text-red-500" />
                </div>
            </div>
            
            <div>
                 <h3 className="font-bold text-lg mb-3 text-brand-text">Configurar Gateways</h3>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 space-y-3">
                    {gateways.map(gw => (
                        <div key={gw.id} className="flex justify-between items-center pb-2 border-b last:border-none">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${gw.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                <p className="font-semibold text-brand-text">{gw.name}</p>
                            </div>
                            <button onClick={() => setEditingGateway(gw)} className="text-sm font-semibold text-brand-secondary">Configurar</button>
                        </div>
                    ))}
                 </div>
            </div>

            <div>
                 <h3 className="font-bold text-lg mb-3 text-brand-text">Log de Transações Recentes</h3>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50">
                    <div className="space-y-3">
                        {transactions.map(tr => (
                            <div key={tr.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-none">
                                <div>
                                    <p className="font-semibold text-brand-text">{tr.clientName}</p>
                                    <p className="text-xs text-brand-text-secondary">{tr.method} - {tr.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-brand-text">{formatCurrency(tr.amount)}</p>
                                    <p className={`text-xs font-semibold ${statusColors[tr.status]}`}>{tr.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </section>
    );
};


// --- MAIN ADMIN COMPONENT ---

const AdminApp: React.FC<AdminAppProps> = ({ user, onLogout }) => {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    useEffect(() => {
        getPlatformStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard /> },
        { id: 'analytics', label: 'Analytics', icon: <IconTarget /> },
        { id: 'system-monitor', label: 'Monitor', icon: <IconShield /> },
        { id: 'advanced-controls', label: 'Controles', icon: <IconCpu /> },
        { id: 'registrations', label: 'Cadastros', icon: <IconUserCheck /> },
        { id: 'marketing', label: 'Marketing', icon: <IconMegaphone /> },
        { id: 'leads', label: 'Leads', icon: <IconTarget /> },
        { id: 'whatsapp', label: 'WhatsApp', icon: <IconCash /> },
        { id: 'ai-maintenance', label: 'IA Manutenção', icon: <IconSparkles /> },
        { id: 'team-chat', label: 'Chat Equipe', icon: <IconMessageCircle /> },
        { id: 'pix-system', label: 'PIX e Repasses', icon: <IconCash /> },
        { id: 'payments', label: 'Pagamentos', icon: <IconCreditCard /> },
        { id: 'moderation', label: 'Moderação', icon: <IconShield /> },
        { id: 'bakeries', label: 'Padarias', icon: <IconBuildingStore /> },
    ];
    
    const renderContent = () => {
        if (loading && activeTab === 'dashboard') return <div className="p-8 text-center text-brand-text-secondary">Carregando...</div>;
        
        // Chat da equipe deve ocupar toda a tela
        if (activeTab === 'team-chat') {
            return <TeamChat currentUser={user} onLogout={onLogout} />;
        }
        
        switch (activeTab) {
            case 'dashboard': return <DashboardView stats={stats} />;
            case 'analytics': return <Analytics user={user} />;
            case 'system-monitor': return <SystemMonitor user={user} />;
            case 'advanced-controls': return <AdvancedAdminPanel user={user} />;
            case 'marketing': return <MarketingView />;
            case 'leads': return <LeadsView />;
            case 'whatsapp': return <WhatsAppIntegration user={user} />;
            case 'ai-maintenance': return <AIMaintenancePanel user={user} />;
            case 'pix-system': return <PIXSystemView user={user} />;
            case 'moderation': return <ModerationView />;
            case 'bakeries': return <BakeriesView />;
            case 'registrations': return <RegistrationManagementView />;
            case 'payments': return <PaymentsView />;
            default: return null;
        }
    };
    

    return (
        <div className={`${activeTab === 'team-chat' ? '' : 'flex flex-col h-full bg-brand-background'}`}>
            {activeTab !== 'team-chat' && (
                <header className="p-4 border-b border-gray-200/80 bg-white sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-brand-text-secondary">Painel do Administrador</p>
                            <h2 className="font-bold text-lg text-brand-text">{user.name}</h2>
                        </div>
                        <button onClick={onLogout} className="text-brand-text-secondary hover:text-brand-secondary">
                            <IconLogout className="w-6 h-6" />
                        </button>
                    </div>
                </header>
            )}
            
            {activeTab !== 'team-chat' && (
                <nav className="flex justify-start items-center gap-4 p-4 border-b border-gray-200/80 bg-white overflow-x-auto">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                                activeTab === item.id ? 'bg-brand-primary text-brand-secondary' : 'bg-gray-100 text-brand-text-secondary hover:bg-gray-200'
                            }`}
                        >
                           <div className="w-5 h-5">{item.icon}</div>
                           {item.label}
                        </button>
                    ))}
                </nav>
            )}

            <main className={`${activeTab === 'team-chat' ? '' : 'flex-1 overflow-y-auto p-4'}`}>
               {renderContent()}
            </main>
        </div>
    );
};

export default AdminApp;