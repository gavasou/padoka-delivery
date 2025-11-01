import { Database } from './supabase/types';

// Extracted types from database schema
export type User = Database['public']['Tables']['users']['Row'];
export type Bakery = Database['public']['Tables']['bakeries']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Delivery = Database['public']['Tables']['deliveries']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];

// Insert types for creating records
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type BakeryInsert = Database['public']['Tables']['bakeries']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type DeliveryInsert = Database['public']['Tables']['deliveries']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

// Update types for modifying records
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type BakeryUpdate = Database['public']['Tables']['bakeries']['Update'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
export type DeliveryUpdate = Database['public']['Tables']['deliveries']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// Enums for better type safety
export enum UserRole {
  CLIENT = 'client',
  BAKERY = 'bakery',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

export enum PackageType {
  DIARIO_AVULSO = 'Diário / Avulso',
  SEMANAL = 'Semanal',
  QUINZENAL = 'Quinzenal',
  MENSAL = 'Mensal',
}

export enum DeliveryStatus {
  PENDING = 'Pendente',
  DELIVERED = 'Entregue',
  RESCHEDULED = 'Reagendada',
}

export enum PaymentStatus {
  APPROVED = 'Aprovada',
  PENDING = 'Pendente',
  DECLINED = 'Recusada',
}

// Extended types with computed fields
export interface UserWithStats extends User {
  gamification?: {
    level: string;
    points: number;
    nextLevelPoints: number;
  };
  deliveryStats?: {
    deliveriesMonth: number;
    averageRating: number;
    onTimeRate: number;
    level: string;
  };
}

export interface ProductWithPopularity extends Product {
  popularity?: 'high' | 'medium' | 'low';
}

export interface SubscriptionWithDetails extends Subscription {
  products?: Product[];
  bakery?: Bakery;
  user?: User;
}

export interface DeliveryWithDetails extends Delivery {
  subscription?: Subscription;
  products?: Product[];
}

// Utility types for form submissions
export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  address?: string;
  phone?: string;
  vehicle?: 'moto' | 'bicicleta';
}

export interface CreateBakeryData {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  logo_url?: string;
  delivery_vehicle: 'moto' | 'bicicleta';
}

export interface CreateProductData {
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  popularity?: 'high' | 'medium' | 'low';
  padaria_id: string;
}

export interface CreateSubscriptionData {
  cliente_id: string;
  padaria_id: string;
  plan: PackageType;
  preco_total: number;
  next_delivery: string;
  bakery_name: string;
}

export interface CreatePaymentData {
  client_name: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  pedido_id: string;
  stripe_payment_intent_id?: string;
}