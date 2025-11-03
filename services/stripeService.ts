import { supabase } from './supabase';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Usar a chave que já está hardcoded como fallback, mas idealmente seria via env
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51QRGvkHZlSuemtbDELGp9VrL7EHqQTv8NaKkDFk3HZVywvbrzXkrDHSrq8YwqU2uYTy7h3GYZ3gVUMHOF0DoDPrP00fNJn5gxM";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

export const createStripeSubscription = async (
    userId: string,
    bakeryId: string,
    plan: string,
    items: any[],
    customerEmail: string,
    customerName: string
) => {
    try {
        const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: {
                planType: plan.toLowerCase().replace(' ', '_'),
                customerEmail,
                customerName
            }
        });

        if (error) throw error;

        return data.data;
    } catch (error: any) {
        console.error('Stripe subscription error:', error);
        throw new Error(error.message || 'Falha ao criar assinatura');
    }
};

export const createStripePayment = async (
    userId: string,
    bakeryId: string,
    packageType: string,
    totalAmount: number,
    customerEmail: string,
    customerName: string,
    paymentMethod: string = 'pix'
) => {
    try {
        const { data, error } = await supabase.functions.invoke('create-payment', {
            body: {
                planType: packageType.toLowerCase().replace(' ', '_'),
                customerEmail,
                customerName,
                paymentMethod,
                totalAmount
            }
        });

        if (error) throw error;

        return data.data;
    } catch (error: any) {
        console.error('Stripe payment error:', error);
        throw new Error(error.message || 'Falha ao criar pagamento');
    }
};
