import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../services/stripeService';
import PaymentScreen from './PaymentScreen';
import type { Bakery, Product, PackageType, ReceiptData, User } from '../types';

type Basket = { [productId: string]: { product: Product; quantity: number } };

interface StripePaymentWrapperProps {
    user: User;
    bakery: Bakery;
    basket: Basket;
    selectedPackage: PackageType;
    packageDetails: { days: number; isRecurring: boolean };
    onBack: () => void;
    onPaymentSuccess: (receiptData: Omit<ReceiptData, 'orderId' | 'date'>) => void;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = (props) => {
    const stripePromise = getStripe();

    return (
        <Elements stripe={stripePromise}>
            <PaymentScreen {...props} />
        </Elements>
    );
};

export default StripePaymentWrapper;