import { supabase } from './supabase';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = "pk_test_51QRGvkHZlSuemtbDELGp9VrL7EHqQTv8NaKkDFk3HZVywvbrzXkrDHSrq8YwqU2uYTy7h3GYZ3gVUMHOF0DoDPrP00fNJn5gxM";

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

export const confirmStripePayment = async (clientSecret: string) => {
    try {
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe não inicializado');

        const { error } = await stripe.confirmCardPayment(clientSecret);

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Payment confirmation error:', error);
        throw error;
    }
};
