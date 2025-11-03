
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast, Toaster } from 'react-hot-toast';
import type { Bakery, Product, PackageType, ReceiptData, User } from '../types';
import { IconChevronLeft, IconCreditCard, IconPix, IconBarcode, IconWallet, IconCheckCircle } from './StatIcons';
import { calculateDeliveryFee, calculateServiceFee } from '../services/feeService';
import { getStripe, createStripeSubscription, createStripePayment } from '../services/stripeService';
import { supabase } from '../lib/supabase';

type Basket = { [productId: string]: { product: Product; quantity: number } };

interface PaymentScreenProps {
    user: User;
    bakery: Bakery;
    basket: Basket;
    selectedPackage: PackageType;
    packageDetails: { days: number; isRecurring: boolean };
    onBack: () => void;
    onPaymentSuccess: (receiptData: Omit<ReceiptData, 'orderId' | 'date'>) => void;
}

type PaymentStep = 'method_selection' | 'card_form' | 'pix_display' | 'boleto_display' | 'processing' | 'success';

// Mapeamento dos tipos de pacote para os planos do Stripe
const PACKAGE_TO_STRIPE_PLAN = {
    'Diário': 'diario',
    'Semanal': 'semanal', 
    'Quinzenal': 'quinzenal',
    'Mensal': 'mensal'
} as const;

const PAYMENT_METHODS = [
    { id: 'credit_card', label: 'Cartão de Crédito', icon: <IconCreditCard className="w-6 h-6" />, type: 'subscription' },
    { id: 'pix', label: 'Pix', icon: <IconPix className="w-6 h-6" />, type: 'one_time' },
    { id: 'boleto', label: 'Boleto Bancário', icon: <IconBarcode className="w-6 h-6" />, type: 'one_time' },
    { id: 'wallet', label: 'Carteiras Digitais', icon: <IconWallet className="w-6 h-6" />, type: 'one_time' },
];

const PaymentScreen: React.FC<PaymentScreenProps> = ({ user, bakery, basket, selectedPackage, packageDetails, onBack, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('method_selection');
    
    const { 
        totalItemCost, 
        totalDeliveryFee, 
        serviceFee,
        finalTotal 
    } = useMemo(() => {
        const dailyItemCost = Object.values(basket).reduce((sum, { product, quantity }) => sum + (product.price * quantity), 0);
        const totalItemCost = dailyItemCost * packageDetails.days;

        const deliveryFeePerDay = calculateDeliveryFee(bakery.distance, bakery.deliveryVehicle);
        const totalDeliveryFee = deliveryFeePerDay * packageDetails.days;
        
        const subtotal = totalItemCost + totalDeliveryFee;
        const serviceFee = calculateServiceFee(subtotal);

        const discountToApply = discount;
        const finalTotal = subtotal + serviceFee - discountToApply;

        return { totalItemCost, totalDeliveryFee, serviceFee, finalTotal };
    }, [bakery, basket, packageDetails, discount]);
    
    const handleApplyCoupon = () => {
        setCouponError('');
        if (couponCode.toUpperCase() === 'PDK10') {
            const newDiscount = totalItemCost * 0.10; // 10% off items
            setDiscount(newDiscount);
        } else {
            setDiscount(0);
            setCouponError('Cupom inválido.');
        }
    };
    
    // Processa divisao automatica de vendas
    // LOGICA CORRETA: Plataforma recebe APENAS taxas (~10.3% total)
    // - Padaria: 90% dos itens (plataforma fica com 10%)
    // - Entregador: 97% da entrega (plataforma fica com 3%)
    // - Cliente: NAO recebe credito
    const processSalesDivision = async (paymentId: string, totalAmount: number, bakeryId: string, deliveryId?: string, customerId?: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('daily-sales-processor', {
                body: {
                    paymentId,
                    totalAmount,
                    itemsTotal: totalItemCost,      // Valor dos itens separado
                    deliveryTotal: totalDeliveryFee, // Valor da entrega separado
                    bakeryId,
                    deliveryId: deliveryId || null,
                    customerId: customerId || null
                }
            });

            if (error) {
                console.error('Erro ao processar divisao de vendas:', error);
                // Nao bloqueia o pagamento, apenas loga o erro
            } else {
                console.log('Divisao de vendas processada:', data);
            }
        } catch (error) {
            console.error('Erro ao processar divisao de vendas:', error);
            // Nao bloqueia o pagamento, apenas loga o erro
        }
    };
    
    const handleConfirmPayment = useCallback(async () => {
        if (selectedMethod === 'credit_card') {
            // Para cartão de crédito, vamos para o formulário Stripe
            setPaymentStep('card_form');
            return;
        }
        
        setPaymentStep('processing');
        const selectedMethodLabel = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label || 'N/A';
        
        try {
            // Para outros métodos de pagamento, usar mock payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            const receiptData: Omit<ReceiptData, 'orderId' | 'date'> = {
                bakery,
                basket,
                package: {
                    type: selectedPackage,
                    days: packageDetails.days,
                },
                costs: {
                    totalItemCost,
                    totalDeliveryFee,
                    serviceFee,
                    discount,
                    finalTotal,
                },
                paymentMethod: selectedMethodLabel,
            };
            
            onPaymentSuccess(receiptData);

        } catch (error) {
            console.error("Payment failed", error);
            toast.error('Falha no pagamento. Tente novamente.');
            setPaymentStep('method_selection');
        }
    }, [
        selectedMethod, user.name, finalTotal, bakery, basket, selectedPackage, packageDetails.days,
        totalItemCost, totalDeliveryFee, serviceFee, discount, onPaymentSuccess
    ]);

    const handleStripePayment = useCallback(async () => {
        setPaymentStep('processing');
        
        try {
            const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
            
            if (selectedPaymentMethod?.type === 'subscription') {
                // Para cartão de crédito - criar assinatura recorrente
                const stripePlan = PACKAGE_TO_STRIPE_PLAN[selectedPackage as keyof typeof PACKAGE_TO_STRIPE_PLAN];
                if (!stripePlan) {
                    throw new Error('Tipo de pacote não suportado');
                }

                const result = await createStripeSubscription(
                    user.id,
                    bakery.id,
                    stripePlan,
                    Object.values(basket),
                    user.email,
                    user.name
                );

                if (result.checkoutUrl) {
                    toast.success('Redirecionando para o checkout...');
                    
                    // Processar divisao automatica antes de redirecionar
                    if (result.subscriptionId) {
                        await processSalesDivision(
                            result.subscriptionId,
                            finalTotal,
                            bakery.id,
                            undefined,
                            user.id
                        );
                    }
                    
                    window.location.href = result.checkoutUrl;
                } else {
                    throw new Error('URL de checkout não retornada');
                }
            } else {
                // Para PIX, boleto e carteiras - pagamento único
                const paymentMethodType = selectedMethod === 'credit_card' ? 'card' : selectedMethod;
                
                const result = await createStripePayment(
                    user.id,
                    bakery.id,
                    selectedPackage,
                    finalTotal,
                    user.email,
                    user.name,
                    paymentMethodType
                );

                if (result.checkoutUrl) {
                    toast.success(`Redirecionando para pagamento via ${selectedPaymentMethod?.label}...`);
                    
                    // Processar divisao automatica antes de redirecionar
                    if (result.paymentId) {
                        await processSalesDivision(
                            result.paymentId,
                            finalTotal,
                            bakery.id,
                            undefined,
                            user.id
                        );
                    }
                    
                    window.location.href = result.checkoutUrl;
                } else {
                    throw new Error('URL de checkout não retornada');
                }
            }

        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Falha no pagamento. Tente novamente.');
            setPaymentStep('method_selection');
        }
    }, [selectedMethod, selectedPackage, user, bakery.id, basket, finalTotal, processSalesDivision]);

    // FIX: Moved useEffect to the top level of the component to follow the Rules of Hooks.
    useEffect(() => {
        let timer: number | undefined;
        if (paymentStep === 'pix_display') {
            timer = setTimeout(() => handleConfirmPayment(), 5000); // Auto-confirm after 5s
        }
        return () => clearTimeout(timer);
    }, [paymentStep, handleConfirmPayment]);

    const handleContinueToPayment = () => {
        handleConfirmPayment();
    };

    const renderHeader = (title: string, onBackAction: () => void) => (
        <header className="p-4 bg-white sticky top-0 z-10 text-center border-b border-gray-200/80">
            <button onClick={onBackAction} className="absolute top-1/2 -translate-y-1/2 left-4 text-brand-secondary">
                <IconChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg text-brand-text">{title}</h1>
        </header>
    );
    
    const ViewContainer: React.FC<{children: React.ReactNode, showFooter: boolean, footerButtonText: string, onFooterClick: () => void}> = ({ children, showFooter, footerButtonText, onFooterClick }) => (
        <>
        <main className="flex-1 overflow-y-auto p-4">
            {children}
        </main>
        {showFooter && (
             <footer className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/80">
                <button onClick={onFooterClick} className="w-full bg-brand-primary text-brand-secondary font-bold py-3 px-4 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg flex justify-between items-center text-lg">
                    <span>{footerButtonText}</span>
                    <span>R$ {finalTotal.toFixed(2)}</span>
                </button>
            </footer>
        )}
        </>
    );

    const renderContent = () => {
        switch(paymentStep) {
            case 'method_selection':
                return (
                    <>
                    {renderHeader("Pagamento", onBack)}
                    <ViewContainer showFooter={true} footerButtonText="Continuar para Pagamento" onFooterClick={handleContinueToPayment}>
                        {/* Summary and Coupon sections go here */}
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 mb-6">
                            <h2 className="font-bold text-brand-text mb-3">Resumo do Pedido</h2>
                            <div className="space-y-2 text-sm text-brand-text-secondary">
                                <div className="flex justify-between"><span >Pacote:</span> <span className="font-semibold text-brand-text">{selectedPackage} ({packageDetails.days} dias)</span></div>
                                <div className="border-t my-2"></div>
                                <div className="flex justify-between"><span>Valor dos Itens:</span> <span>R$ {totalItemCost.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Taxa de Entrega:</span> <span>R$ {totalDeliveryFee.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Taxa de Serviço:</span> <span>R$ {serviceFee.toFixed(2)}</span></div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Desconto (PDK10):</span>
                                        <span>- R$ {discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-3 border-t-2 border-dashed flex justify-between font-bold text-lg text-brand-text">
                                <span>Total a Pagar</span>
                                <span>R$ {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 mb-6">
                            <h2 className="font-bold text-brand-text mb-2">Cupom de Desconto</h2>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Ex: PDK10" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button onClick={handleApplyCoupon} className="primary !px-6">Aplicar</button>
                            </div>
                            {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                            {discount > 0 && <p className="text-green-600 text-xs mt-1">Cupom aplicado com sucesso!</p>}
                        </div>


                        <h2 className="font-bold text-brand-text mb-3">Forma de Pagamento</h2>
                        <div className="space-y-3">
                        {PAYMENT_METHODS.map(method => (
                            <button 
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`flex items-center w-full text-left p-4 rounded-xl border-2 transition-all ${selectedMethod === method.id ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-200 bg-white'}`}
                            >
                                <div className="text-brand-secondary mr-4">{method.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-brand-text">{method.label}</span>
                                        {method.type === 'subscription' ? 
                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Recorrente</span> :
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Único</span>
                                        }
                                    </div>
                                    <span className="text-xs text-brand-text-secondary">
                                        {method.id === 'pix' && 'Confirmação em até 2 horas • Instantâneo'}
                                        {method.id === 'boleto' && 'Confirmação em até 3 dias úteis'}
                                        {method.id === 'credit_card' && 'Renovação automática • Cancele quando quiser'}
                                        {method.id === 'wallet' && 'Mercado Pago, PicPay e outros'}
                                    </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-brand-primary' : 'border-gray-300'}`}>
                                    {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
                                </div>
                            </button>
                        ))}
                        </div>
                    </ViewContainer>
                    </>
                );
            case 'card_form':
                 return (
                    <>
                    {renderHeader(
                        selectedMethod === 'credit_card' ? "Pagamento por Assinatura" :
                        selectedMethod === 'pix' ? "Pagamento via PIX" :
                        selectedMethod === 'boleto' ? "Pagamento via Boleto" :
                        "Confirmar Pagamento",
                        () => setPaymentStep('method_selection')
                    )}
                    <ViewContainer showFooter={true} footerButtonText={
                        selectedMethod === 'credit_card' ? "Confirmar Assinatura" :
                        selectedMethod === 'pix' ? "Confirmar PIX" :
                        selectedMethod === 'boleto' ? "Confirmar Boleto" :
                        "Confirmar Pagamento"
                    } onFooterClick={handleStripePayment}>
                        <div className="bg-white p-4 rounded-xl space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="font-bold text-lg text-brand-text mb-2">
                                    {selectedMethod === 'credit_card' ? 
                                        `Assinatura ${selectedPackage}` : 
                                        `Pagamento ${selectedPackage}`
                                    }
                                </h3>
                                <p className="text-brand-text-secondary">
                                    {selectedMethod === 'credit_card' ? 
                                        'Você será redirecionado para o checkout seguro do Stripe' :
                                        `Pagamento via ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label} - Redirecionamento seguro`
                                    }
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-brand-text mb-2">Detalhes do Pagamento:</h4>
                                <ul className="text-sm text-brand-text-secondary space-y-1">
                                    <li>• {selectedMethod === 'credit_card' ? 
                                        (packageDetails.isRecurring ? 'Cobrança recorrente' : 'Pagamento único') :
                                        'Pagamento único'
                                    }</li>
                                    <li>• Entrega por {packageDetails.days} dias</li>
                                    <li>• {selectedMethod === 'credit_card' ? 'Cancele a qualquer momento' : 'Confirmação instantânea'}</li>
                                    <li>• Pagamento seguro via Stripe Brasil</li>
                                    {selectedMethod === 'pix' && <li>• PIX: Confirmação em até 2 horas</li>}
                                    {selectedMethod === 'boleto' && <li>• Boleto: Confirmação em até 3 dias úteis</li>}
                                </ul>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-brand-text mb-2">Total do Pagamento:</h4>
                                <p className="text-2xl font-bold text-green-600">R$ {finalTotal.toFixed(2)}</p>
                                <p className="text-sm text-brand-text-secondary">
                                    {selectedMethod === 'credit_card' && packageDetails.isRecurring ? 'Por período' : 'Pagamento único'}
                                </p>
                                {selectedMethod === 'pix' && (
                                    <p className="text-xs text-blue-600 mt-2">PIX: Desconto especial já aplicado!</p>
                                )}
                            </div>
                        </div>
                    </ViewContainer>
                    </>
                );
            case 'pix_display':
                 return (
                    <>
                    {renderHeader("Pagar com Pix", () => setPaymentStep('method_selection'))}
                    <ViewContainer showFooter={false} footerButtonText="" onFooterClick={() => {}}>
                        <div className="bg-white p-6 rounded-xl text-center">
                           <h3 className="font-bold text-brand-text mb-2">Escaneie o QR Code</h3>
                           <img src="https://i.imgur.com/g88v3h2.png" alt="QR Code" className="w-48 h-48 mx-auto" />
                           <p className="text-sm text-brand-text-secondary mt-4">Ou use a chave Pix Copia e Cola:</p>
                           <p className="text-xs bg-gray-100 p-2 rounded-lg font-mono my-2 break-all">00020126...d5030001</p>
                           <button className="primary w-full">Copiar Chave</button>
                           <p className="text-sm font-semibold text-brand-text mt-6 animate-pulse">Aguardando confirmação do pagamento...</p>
                        </div>
                    </ViewContainer>
                    </>
                );
            case 'boleto_display':
                 return (
                    <>
                    {renderHeader("Pagamento com Boleto", () => setPaymentStep('method_selection'))}
                    <ViewContainer showFooter={true} footerButtonText="Confirmar e Voltar" onFooterClick={onBack}>
                        <div className="bg-white p-6 rounded-xl text-center">
                           <IconCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                           <h3 className="font-bold text-brand-text mb-2">Boleto Gerado!</h3>
                           <p className="text-sm text-brand-text-secondary mb-4">Pague usando o código de barras abaixo. A confirmação pode levar até 2 dias úteis.</p>
                           <img src="https://i.imgur.com/uN2PoaD.png" alt="Código de Barras" className="w-full h-auto mx-auto" />
                           <button className="primary w-full !mt-6">Copiar Linha Digitável</button>
                        </div>
                    </ViewContainer>
                    </>
                );
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 font-semibold text-brand-text">Processando seu pagamento...</p>
                    </div>
                );
            default: return null;
        }
    }


    return (
        <div className="flex flex-col h-full bg-brand-background">
           <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
           {renderContent()}
        </div>
    );
};

export default PaymentScreen;