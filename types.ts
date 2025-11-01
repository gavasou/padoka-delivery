
export enum UserRole {
  CLIENT = 'client',
  BAKERY = 'bakery',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

export interface GamificationStats {
  level: string;
  points: number;
  nextLevelPoints: number;
}

export interface DeliveryPersonStats {
    deliveriesMonth: number;
    averageRating: number;
    onTimeRate: number; // percentage
    level: string;
}

export interface Achievement {
    id: string;
    icon: string; // emoji
    title: string;
    description: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface GalleryImage {
    id: string;
    imageUrl: string;
    caption: string;
    likes: number;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'support' | 'bakery';
    text: string;
    timestamp: string;
}

export interface FeedPost {
    id: string;
    bakeryId: string;
    bakeryName?: string; // For admin view
    user: {
        id: string;
        name: string;
        profileImageUrl: string;
    };
    imageUrl?: string;
    caption: string;
    rating: number;
    createdAt: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // For mock auth
  address?: string; // For clients/deliveries
  vehicle?: 'moto' | 'bicicleta'; // For delivery personnel
  phone?: string;
  profileImageUrl?: string;
  gamification?: GamificationStats;
  deliveryStats?: DeliveryPersonStats;
  status?: 'pending' | 'approved' | 'suspended';
}

export interface Product {
  id: string;
  name:string;
  price: number;
  imageUrl: string;
  popularity?: 'high' | 'medium' | 'low';
}

export interface Bakery {
  id: string;
  name: string;
  ownerId: string;
  logoUrl: string;
  address: string;
  distance: number; // in km
  rating: number;
  products: Product[];
  activeSubscriptions: number;
  deliveryVehicle: 'moto' | 'bicicleta';
  availablePackages?: PackageType[]; // Each bakery can now have specific packages
  status?: 'pending' | 'approved' | 'suspended';
}

export enum PackageType {
  DIARIO_AVULSO = 'Diário / Avulso',
  SEMANAL = 'Semanal',
  QUINZENAL = 'Quinzenal',
  MENSAL = 'Mensal',
}


export interface Subscription {
  id: string;
  userId: string;
  bakeryId: string;
  bakeryName: string;
  plan: PackageType;
  items: Product[];
  status: 'Active' | 'Paused' | 'Cancelled';
  nextDelivery: string;
}

export enum DeliveryStatus {
  PENDING = 'Pendente',
  DELIVERED = 'Entregue',
  RESCHEDULED = 'Reagendada',
}

export interface Delivery {
  id: string;
  subscriptionId: string;
  customerName: string;
  address: string;
  timeSlot: string;
  status: DeliveryStatus;
  items: Product[]; // Products included in the delivery
  date?: string;
  rating?: number;
  customerFeedback?: string;
}

// Data type for the new bakery revenue chart
export interface WeeklyRevenue {
    day: string;
    Receita: number;
}

// Data type for the admin dashboard
export interface PlatformStats {
    totalRevenue: number;
    appCommission: number;
    payoutsToBakeries: number;
    activeSubscriptions: number;
    totalBakeries: number;
    totalClients: number;
}

// Data types for new Admin features
export interface MarketingCampaign {
    id: string;
    productId: string;
    productName: string;
    bakeryName: string;
    startDate: string;
    endDate: string;
    status: 'Ativa' | 'Agendada' | 'Concluída';
    views: number;
    clicks: number;
}

export interface AppNotification {
    id: string;
    message: string;
    segment: string;
    sentAt: string;
    opens: number;
    clicks: number;
}

export interface AIMarketingSuggestion {
    title: string;
    description: string;
    productName: string;
}

// Payment Management Types
export interface PaymentGateway {
    id: string;
    name: string;
    apiKey: string;
    status: 'active' | 'inactive';
}

export interface PaymentTransaction {
    id: string;
    clientName: string;
    amount: number;
    method: string;
    status: 'Aprovada' | 'Pendente' | 'Recusada';
    date: string;
}

export interface PaymentStats {
    revenueToday: number;
    approvedTransactions: number;
    failedTransactions: number;
}

// Type for the final receipt
export interface ReceiptData {
    orderId: string;
    date: string;
    bakery: Bakery;
    basket: { [productId: string]: { product: Product; quantity: number } };
    package: {
        type: PackageType;
        days: number;
    };
    costs: {
        totalItemCost: number;
        totalDeliveryFee: number;
        serviceFee: number;
        discount: number;
        finalTotal: number;
    };
    paymentMethod: string;
}