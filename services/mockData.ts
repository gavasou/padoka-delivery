
import { User, Bakery, Subscription, Delivery, UserRole, PackageType, DeliveryStatus, Product, FaqItem, GalleryImage, ChatMessage, Achievement, WeeklyRevenue, FeedPost, PlatformStats, MarketingCampaign, AppNotification, PaymentGateway, PaymentTransaction, PaymentStats } from '../types';

// --- USERS ---
export let MOCK_USERS: User[] = [
  { 
    id: 'user-1', 
    name: 'Ana Silva', 
    email: 'cliente@padoka.com', 
    password: '123', 
    role: UserRole.CLIENT, 
    address: 'Rua das Flores, 123',
    phone: '(11) 98765-4321',
    profileImageUrl: 'https://i.imgur.com/kFHFGv1.png',
    gamification: {
        level: 'Pão de Ouro 🥇',
        points: 450,
        nextLevelPoints: 1000,
    },
    status: 'approved',
  },
  { 
    id: 'user-2', 
    name: 'Carlos Ferreira (Dono)', 
    email: 'padaria@padoka.com', 
    password: '123', 
    role: UserRole.BAKERY,
    phone: '(11) 91122-3344',
    profileImageUrl: 'https://i.imgur.com/jJSBvE9.png',
    status: 'approved',
  },
  { 
    id: 'user-3', 
    name: 'João Entregador', 
    email: 'entregador@padoka.com', 
    password: '123', 
    role: UserRole.DELIVERY, 
    vehicle: 'moto',
    address: 'Região Central',
    phone: '(11) 91234-5678',
    profileImageUrl: 'https://i.imgur.com/jJSBvE9.png',
    deliveryStats: {
        level: 'Entregador Diamante 💎',
        deliveriesMonth: 124,
        averageRating: 4.9,
        onTimeRate: 98,
    },
    status: 'approved',
  },
   { 
    id: 'user-admin', 
    name: 'Admin Padoka', 
    email: 'admin@padoka.com', 
    password: '123', 
    role: UserRole.ADMIN,
    status: 'approved',
  },
  { 
    id: 'user-pending-delivery', 
    name: 'Maria Souza', 
    email: 'maria.entrega@email.com', 
    password: '123', 
    role: UserRole.DELIVERY, 
    vehicle: 'bicicleta',
    address: 'Zona Sul',
    phone: '(21) 99887-6655',
    profileImageUrl: 'https://i.imgur.com/kFHFGv1.png',
    status: 'pending',
  },
];

// --- PRODUCTS ---
export const MOCK_PRODUCTS: Product[] = [
    { id: 'prod-1', name: 'Pão Francês (un)', price: 0.75, imageUrl: 'https://i.imgur.com/8L5gG9L.png', popularity: 'high' },
    { id: 'prod-2', name: 'Leite Integral 1L', price: 5.50, imageUrl: 'https://i.imgur.com/Kz8V2kG.png', popularity: 'medium' },
    { id: 'prod-3', name: 'Manteiga 200g', price: 8.00, imageUrl: 'https://i.imgur.com/uVjd5j1.png', popularity: 'medium' },
    { id: 'prod-4', name: 'Café em Pó 500g', price: 15.00, imageUrl: 'https://i.imgur.com/a6Zc4b9.png', popularity: 'low' },
    { id: 'prod-5', name: 'Pão de Queijo (100g)', price: 4.50, imageUrl: 'https://i.imgur.com/yKkL5p8.png', popularity: 'high' },
    { id: 'prod-6', name: 'Croissant', price: 6.00, imageUrl: 'https://i.imgur.com/wVdSU2L.png', popularity: 'high' },
];

// --- BAKERIES ---
export let MOCK_BAKERIES: Bakery[] = [
  { 
    id: 'bakery-1', 
    name: 'Pão Quente & Cia', 
    ownerId: 'user-2', 
    logoUrl: 'https://lh3.googleusercontent.com/d/1O4l7fXusiXbrHKqGR8947n0S4vFgNb-O', // <-- Updated with new compact PDK logo
    address: 'Av. Principal, 456', 
    distance: 1.2, 
    rating: 4.8, 
    products: MOCK_PRODUCTS,
    activeSubscriptions: 132,
    deliveryVehicle: 'bicicleta',
    availablePackages: [PackageType.DIARIO_AVULSO, PackageType.SEMANAL, PackageType.QUINZENAL, PackageType.MENSAL],
    status: 'approved',
  },
  { 
    id: 'bakery-2', 
    name: 'Delícias da Vovó', 
    ownerId: 'user-4', 
    logoUrl: 'https://i.imgur.com/O61Yq8s.png', 
    address: 'Rua do Trigo, 789', 
    distance: 3.5, 
    rating: 4.9, 
    products: [
        { ...MOCK_PRODUCTS[0], popularity: 'high' }, 
        { ...MOCK_PRODUCTS[4], popularity: 'high' }, 
        { ...MOCK_PRODUCTS[5], popularity: 'medium' }
    ],
    activeSubscriptions: 89,
    deliveryVehicle: 'moto',
    availablePackages: [PackageType.DIARIO_AVULSO, PackageType.SEMANAL, PackageType.QUINZENAL, PackageType.MENSAL],
    status: 'approved',
  },
  { 
    id: 'bakery-3', 
    name: 'Padaria Esquina do Sabor', 
    ownerId: 'user-5', 
    logoUrl: 'https://i.imgur.com/5gqZ1fX.png', 
    address: 'Travessa dos Pães, 10', 
    distance: 0.8, 
    rating: 4.5, 
    products: [
        { ...MOCK_PRODUCTS[0], popularity: 'high' }, 
        { ...MOCK_PRODUCTS[1], popularity: 'medium' },
        { ...MOCK_PRODUCTS[2], popularity: 'low' },
    ],
    activeSubscriptions: 210,
    deliveryVehicle: 'bicicleta',
    availablePackages: [PackageType.DIARIO_AVULSO, PackageType.SEMANAL, PackageType.QUINZENAL, PackageType.MENSAL],
    status: 'approved',
  },
  { 
    id: 'bakery-pending-1', 
    name: 'O Cantinho do Pão', 
    ownerId: 'user-pending-bakery', 
    logoUrl: 'https://i.imgur.com/O61Yq8s.png', 
    address: 'Rua Nova, 1010', 
    distance: 2.1, 
    rating: 0, 
    products: [],
    activeSubscriptions: 0,
    deliveryVehicle: 'moto',
    status: 'pending',
  },
];

// --- CLIENT SUBSCRIPTIONS ---
export const MOCK_CLIENT_SUBSCRIPTIONS: Subscription[] = [
    { id: 'sub-1', userId: 'user-1', bakeryId: 'bakery-1', bakeryName: 'Pão Quente & Cia', plan: PackageType.SEMANAL, items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]], status: 'Active', nextDelivery: 'Amanhã' },
    { id: 'sub-2', userId: 'user-1', bakeryId: 'bakery-2', bakeryName: 'Delícias da Vovó', plan: PackageType.MENSAL, items: [MOCK_PRODUCTS[0]], status: 'Paused', nextDelivery: '25/07' },
];

// --- BAKERY DASHBOARD DATA ---
export const MOCK_BAKERY_STATS = {
    activeSubscriptions: 132,
    pendingDeliveries: 15,
    totalRevenueMonth: 4890.50
};
export const MOCK_BAKERY_WEEKLY_REVENUE: WeeklyRevenue[] = [
    { day: 'Seg', Receita: 210.45 },
    { day: 'Ter', Receita: 250.00 },
    { day: 'Qua', Receita: 230.80 },
    { day: 'Qui', Receita: 275.50 },
    { day: 'Sex', Receita: 350.10 },
    { day: 'Sáb', Receita: 410.00 },
    { day: 'Dom', Receita: 380.25 },
];
export const MOCK_BAKERY_ALERTS = [
    { id: 'alert-1', time: '20:00', text: 'Prepare 115 pães para as entregas de amanhã.' }
];


// --- DELIVERY JOBS ---
export const MOCK_DELIVERY_JOBS: Delivery[] = [
    { id: 'del-1', subscriptionId: 'sub-1', customerName: 'Ana Silva', address: 'Rua das Flores, 123', timeSlot: '07:00 - 07:30', status: DeliveryStatus.PENDING, items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]] },
    { id: 'del-2', subscriptionId: 'sub-3', customerName: 'Carlos Pereira', address: 'Av. dos Ventos, 789', timeSlot: '07:30 - 08:00', status: DeliveryStatus.PENDING, items: [MOCK_PRODUCTS[4]] },
    { id: 'del-3', subscriptionId: 'sub-4', customerName: 'Mariana Costa', address: 'Beco da Padaria, 42', timeSlot: '08:00 - 08:30', status: DeliveryStatus.PENDING, items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[5]] },
];

// --- DELIVERY HISTORY ---
export const MOCK_DELIVERY_HISTORY: Delivery[] = [
    { id: 'del-hist-1', subscriptionId: 'sub-1', customerName: 'Ana Silva', address: 'Rua das Flores, 123', timeSlot: '07:00 - 07:30', status: DeliveryStatus.DELIVERED, date: 'Ontem', rating: 5, customerFeedback: 'Entrega perfeita e muito rápida! O pão chegou quentinho.', items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]] },
    { id: 'del-hist-2', subscriptionId: 'sub-3', customerName: 'Carlos Pereira', address: 'Av. dos Ventos, 789', timeSlot: '07:30 - 08:00', status: DeliveryStatus.DELIVERED, date: 'Ontem', rating: 4.5, customerFeedback: 'Tudo certo.', items: [MOCK_PRODUCTS[4]] },
    { id: 'del-hist-3', subscriptionId: 'sub-4', customerName: 'Mariana Costa', address: 'Beco da Padaria, 42', timeSlot: '08:00 - 08:30', status: DeliveryStatus.DELIVERED, date: '2 dias atrás', rating: 5, customerFeedback: 'Entregador muito simpático e pontual. Recomendo!', items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[5]] },
    { id: 'del-hist-4', subscriptionId: 'sub-5', customerName: 'Ricardo Alves', address: 'Praça Central, 100', timeSlot: '06:30 - 07:00', status: DeliveryStatus.DELIVERED, date: '3 dias atrás', rating: 3, items: [MOCK_PRODUCTS[0]] },
    { id: 'del-hist-5', subscriptionId: 'sub-6', customerName: 'Beatriz Lima', address: 'Rua Longa, 2020', timeSlot: '07:00 - 07:30', status: DeliveryStatus.DELIVERED, date: '3 dias atrás', items: [MOCK_PRODUCTS[2]] },
];

// --- BAKERY FEED DATA ---
export const MOCK_BAKERY_FEED_POSTS: FeedPost[] = [
    {
        id: 'feed-1', bakeryId: 'bakery-1', createdAt: 'Há 2 horas', rating: 5,
        user: { id: 'user-1', name: 'Ana Silva', profileImageUrl: 'https://i.imgur.com/kFHFGv1.png' },
        caption: 'O melhor pão de queijo que já comi! Chegou super quentinho na assinatura de hoje. Recomendo demais! ❤️',
        imageUrl: 'https://i.imgur.com/yKkL5p8.png',
    },
    {
        id: 'feed-2', bakeryId: 'bakery-1', createdAt: 'Ontem', rating: 4.5,
        user: { id: 'user-10', name: 'Marcos Rocha', profileImageUrl: 'https://i.imgur.com/jJSBvE9.png' },
        caption: 'Café da manhã de hotel em casa, graças à @PãoQuente&Cia. O croissant é divino!',
        imageUrl: 'https://i.imgur.com/wVdSU2L.png',
    },
     {
        id: 'feed-3', bakeryId: 'bakery-1', createdAt: '3 dias atrás', rating: 5,
        user: { id: 'user-11', name: 'Carla Dias', profileImageUrl: 'https://i.imgur.com/kFHFGv1.png' },
        caption: 'Assinatura mensal vale muito a pena, nunca mais me preocupei em sair pra comprar pão.',
    },
];

// --- ADMIN MOCK DATA ---
export const MOCK_PLATFORM_STATS: PlatformStats = {
    totalRevenue: 12450.75,
    appCommission: 1245.07, // 10%
    payoutsToBakeries: 11205.68,
    activeSubscriptions: 431,
    totalBakeries: MOCK_BAKERIES.filter(b => b.status === 'approved').length,
    totalClients: MOCK_USERS.filter(u => u.role === UserRole.CLIENT).length,
};

export let MOCK_ALL_FEED_POSTS: FeedPost[] = [
    ...MOCK_BAKERY_FEED_POSTS.map(p => ({...p, bakeryName: 'Pão Quente & Cia'})),
    {
        id: 'feed-4', bakeryId: 'bakery-2', bakeryName: 'Delícias da Vovó', createdAt: 'Há 5 horas', rating: 5,
        user: { id: 'user-12', name: 'Pedro Lima', profileImageUrl: 'https://i.imgur.com/jJSBvE9.png' },
        caption: 'Que delícia! Padaria nota 10!',
    },
     {
        id: 'feed-5', bakeryId: 'bakery-3', bakeryName: 'Esquina do Sabor', createdAt: 'Há 1 dia', rating: 3.5,
        user: { id: 'user-13', name: 'Juliana Paes', profileImageUrl: 'https://i.imgur.com/kFHFGv1.png' },
        caption: 'A entrega atrasou um pouco hoje, mas o pão estava bom.',
        imageUrl: 'https://i.imgur.com/8L5gG9L.png'
    },
];

export let MOCK_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
    { id: 'camp-1', productId: 'prod-6', productName: 'Croissant', bakeryName: 'Pão Quente & Cia', startDate: '2024-07-01', endDate: '2024-07-07', status: 'Ativa', views: 10520, clicks: 830 },
    { id: 'camp-2', productId: 'prod-5', productName: 'Pão de Queijo', bakeryName: 'Delícias da Vovó', startDate: '2024-06-28', endDate: '2024-07-05', status: 'Concluída', views: 8900, clicks: 650 },
];

export const MOCK_APP_NOTIFICATIONS: AppNotification[] = [
    { id: 'notif-1', message: 'Novo croissant de chocolate na Pão Quente & Cia! 🥐🍫 Experimente agora mesmo na sua próxima assinatura.', segment: 'Clientes Recentes', sentAt: 'Ontem, 10:00', opens: 150, clicks: 25 },
    { id: 'notif-2', message: 'Use o cupom BOMDIA15 e ganhe 15% de desconto em qualquer assinatura mensal! Válido até domingo.', segment: 'Todos os Clientes', sentAt: '2 dias atrás, 09:00', opens: 450, clicks: 98 },
];


// --- NEW MOCK DATA FOR PROFILES ---

// CLIENT PROFILE DATA
export const MOCK_CLIENT_FAQS: FaqItem[] = [
    { id: 'faq-c-1', question: 'Como pauso minha assinatura?', answer: 'Vá para a aba "Assinaturas", selecione a assinatura desejada e clique no botão "Pausar". Você pode reativá-la a qualquer momento.' },
    { id: 'faq-c-2', question: 'Posso alterar os itens da minha cesta?', answer: 'Sim! Acesse os detalhes da sua assinatura e clique em "Editar Itens". A alteração será válida para a próxima entrega.' },
    { id: 'faq-c-3', question: 'Qual o horário de entrega?', answer: 'As entregas são realizadas geralmente entre 06:00 e 09:00 da manhã para garantir seu pão fresquinho no café da manhã.' },
];
export const MOCK_CLIENT_ACHIEVEMENTS: Achievement[] = [
    { id: 'ach-c-1', icon: '📅', title: 'Fidelidade Mensal', description: 'Completou seu primeiro mês de assinatura.' },
    { id: 'ach-c-2', icon: '🥐', title: 'Amante de Croissant', description: 'Pediu mais de 20 croissants.' },
    { id: 'ach-c-3', icon: '⭐', title: 'Avaliador', description: 'Deixou sua primeira avaliação para uma padaria.' },
];
export const MOCK_GALLERY_IMAGES: GalleryImage[] = [
    { id: 'gal-1', imageUrl: 'https://i.imgur.com/wVdSU2L.png', caption: 'Meu café da manhã com pão da Padoka!', likes: 12 },
    { id: 'gal-2', imageUrl: 'https://i.imgur.com/yKkL5p8.png', caption: 'Melhor pão de queijo da cidade ❤️', likes: 25 },
];
export const MOCK_CLIENT_CHAT_MESSAGES: ChatMessage[] = [
    { id: 'chat-c-1', sender: 'bakery', text: 'Olá, Ana! Notamos que o seu pão favorito está em promoção. Gostaria de adicionar?', timestamp: '09:15' },
    { id: 'chat-c-2', sender: 'user', text: 'Opa, que legal! Sim, pode adicionar dois para amanhã, por favor.', timestamp: '09:16' },
];

// DELIVERY PROFILE DATA
export const MOCK_DELIVERY_FAQS: FaqItem[] = [
    { id: 'faq-d-1', question: 'O que fazer se o cliente não estiver em casa?', answer: 'Siga o protocolo: tente contato por telefone. Se não houver resposta, aguarde 5 minutos e siga para a próxima entrega. Marque a ocorrência no app.' },
    { id: 'faq-d-2', question: 'Como funcionam os pagamentos?', answer: 'Os pagamentos são processados semanalmente, toda sexta-feira, com base nas entregas concluídas com sucesso na semana anterior.' },
    { id: 'faq-d-3', question: 'Minha rota pode ser alterada?', answer: 'As rotas são otimizadas diariamente. Pequenos ajustes podem ocorrer para garantir a eficiência. Verifique sempre o app antes de sair.' },
];
export const MOCK_DELIVERY_ACHIEVEMENTS: Achievement[] = [
    { id: 'ach-d-1', icon: '💯', title: '100 Entregas', description: 'Completou suas primeiras 100 entregas.' },
    { id: 'ach-d-2', icon: '⚡', title: 'Super Rápido', description: 'Manteve uma média de tempo de entrega excelente por um mês.' },
    { id: 'ach-d-3', icon: '👍', title: '5 Estrelas', description: 'Recebeu 20 avaliações 5 estrelas de clientes.' },
];
export const MOCK_SUPPORT_CHAT_MESSAGES: ChatMessage[] = [
    { id: 'chat-d-1', sender: 'user', text: 'Olá, tive um problema com o pneu da moto. Vou me atrasar um pouco.', timestamp: '06:45' },
    { id: 'chat-d-2', sender: 'support', text: 'Olá, João. Obrigado por avisar! Segurança em primeiro lugar. Já estamos recalculando sua rota e notificando os clientes. Fique tranquilo.', timestamp: '06:46' },
];

// PAYMENT MANAGEMENT MOCK DATA
export let MOCK_PAYMENT_GATEWAYS: PaymentGateway[] = [
    { id: 'stripe', name: 'Cartão de Crédito (Stripe)', apiKey: 'pk_test_...xyz', status: 'active' },
    { id: 'pix', name: 'PIX (Banco Central)', apiKey: 'pix-key-...123', status: 'active' },
    { id: 'boleto', name: 'Boleto Bancário', apiKey: '', status: 'inactive' },
    { id: 'picpay', name: 'Carteiras Digitais (PicPay)', apiKey: '', status: 'inactive' },
];

export let MOCK_PAYMENT_STATS: PaymentStats = {
    revenueToday: 1250.60,
    approvedTransactions: 85,
    failedTransactions: 3,
};

export let MOCK_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
    { id: 'tr-1', clientName: 'Ana Silva', amount: 45.50, method: 'Cartão de Crédito', status: 'Aprovada', date: 'Hoje, 09:30' },
    { id: 'tr-2', clientName: 'Marcos Rocha', amount: 22.00, method: 'PIX', status: 'Aprovada', date: 'Hoje, 09:25' },
    { id: 'tr-3', clientName: 'Carla Dias', amount: 15.75, method: 'Cartão de Crédito', status: 'Recusada', date: 'Hoje, 09:10' },
    { id: 'tr-4', clientName: 'Pedro Lima', amount: 33.80, method: 'PIX', status: 'Aprovada', date: 'Hoje, 08:55' },
];