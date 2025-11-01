
import React, { useState, useEffect } from 'react';
import type { User, Bakery, Product, ReceiptData } from '../types';
import { PackageType } from '../types';
import { getBakeryById, createSubscription } from '../services/api';
import { IconChevronLeft, IconStar, IconUsers } from './StatIcons';
import PaymentScreen from './PaymentScreen';
import StripePaymentWrapper from './StripePaymentWrapper';
import BakeryFeedScreen from './BakeryFeedScreen';
import ReceiptScreen from './ReceiptScreen';

interface BakeryDetailProps {
  bakeryId: string;
  user: User;
  onBack: () => void;
  onSubscribed: () => void;
}

type Basket = { [productId: string]: { product: Product; quantity: number } };
type FlowStep = 'products' | 'packages' | 'payment' | 'feed' | 'receipt';

const PACKAGE_DETAILS = {
    [PackageType.DIARIO_AVULSO]: { days: 1, isRecurring: false, description: 'Ideal para experimentar ou para um dia específico.' },
    [PackageType.SEMANAL]: { days: 7, isRecurring: true, description: 'Receba pão todos os dias durante 7 dias.' },
    [PackageType.QUINZENAL]: { days: 15, isRecurring: true, description: 'Receba pão todos os dias durante 15 dias.' },
    [PackageType.MENSAL]: { days: 30, isRecurring: true, description: 'Sua entrega garantida por um mês inteiro.' },
};


const PackageSelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelectPackage: (pkg: PackageType) => void;
    availablePackages: PackageType[];
}> = ({ isOpen, onClose, onSelectPackage, availablePackages }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold text-brand-text text-center mb-4">Escolha seu Pacote</h2>
                <div className="space-y-3">
                    {availablePackages.map(pkg => (
                        <button 
                            key={pkg} 
                            onClick={() => onSelectPackage(pkg)} 
                            className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-brand-primary hover:bg-brand-primary/10 transition-all"
                        >
                            <h3 className="font-bold text-brand-text">{pkg}</h3>
                            <p className="text-sm text-brand-text-secondary">{PACKAGE_DETAILS[pkg].description}</p>
                        </button>
                    ))}
                </div>
                 <button onClick={onClose} className="w-full bg-transparent text-brand-text-secondary py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors mt-4">Cancelar</button>
            </div>
        </div>
    );
};


const BakeryDetail: React.FC<BakeryDetailProps> = ({ bakeryId, user, onBack, onSubscribed }) => {
  const [bakery, setBakery] = useState<Bakery | null>(null);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<Basket>({});
  const [flowStep, setFlowStep] = useState<FlowStep>('products');
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const fetchBakery = async () => {
      try {
        const data = await getBakeryById(bakeryId);
        if (data) {
          setBakery(data);
        } else {
          // handle error, bakery not found
        }
      } catch (e) {
        console.error("Failed to fetch bakery details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBakery();
  }, [bakeryId]);

  const handleUpdateBasket = (product: Product, change: 1 | -1) => {
    setBasket(prev => {
        const existing = prev[product.id];
        const newQuantity = (existing?.quantity || 0) + change;
        if (newQuantity <= 0) {
            const { [product.id]: _, ...rest } = prev;
            return rest;
        }
        return {
            ...prev,
            [product.id]: { product, quantity: newQuantity }
        };
    });
  };

  const handleSelectPackage = (pkg: PackageType) => {
      setSelectedPackage(pkg);
      setFlowStep('payment');
  }

  const handlePaymentSuccess = async (data: Omit<ReceiptData, 'orderId' | 'date'>) => {
      if (!bakery || !selectedPackage) return;
      const items = Object.values(basket).flatMap(({product, quantity}) => Array(quantity).fill(product));
      
      // Create subscription in the backend
      await createSubscription(user.id, bakery.id, bakery.name, selectedPackage, items);

      // Finalize receipt data and move to receipt screen
      const finalReceiptData: ReceiptData = {
          ...data,
          orderId: `PDK-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
      };
      setReceiptData(finalReceiptData);
      setFlowStep('receipt');
  }

  const basketTotal = Object.values(basket).reduce((sum, {product, quantity}) => sum + (product.price * quantity), 0);
  const basketCount = Object.values(basket).reduce((sum, { quantity }) => sum + quantity, 0);

  if (loading) {
    return <div className="text-center p-8 text-brand-text-secondary">Carregando padaria...</div>;
  }

  if (!bakery) {
    return <div className="text-center p-8 text-red-500">Padaria não encontrada.</div>;
  }
  
  if (flowStep === 'payment' && selectedPackage) {
      return <StripePaymentWrapper 
                user={user}
                bakery={bakery}
                basket={basket}
                selectedPackage={selectedPackage}
                packageDetails={PACKAGE_DETAILS[selectedPackage]}
                onBack={() => setFlowStep('packages')}
                onPaymentSuccess={handlePaymentSuccess}
             />
  }

  if (flowStep === 'receipt' && receiptData) {
      return <ReceiptScreen receiptData={receiptData} onDone={onSubscribed} />;
  }
  
  if (flowStep === 'feed') {
      return <BakeryFeedScreen bakery={bakery} onBack={() => setFlowStep('products')} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
        <PackageSelectionModal 
            isOpen={flowStep === 'packages'} 
            onClose={() => setFlowStep('products')} 
            onSelectPackage={handleSelectPackage}
            availablePackages={bakery.availablePackages || Object.values(PackageType)}
        />
      <header className="relative">
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(https://i.imgur.com/L1iAdH7.png)` }}></div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 text-brand-secondary hover:bg-white transition-colors shadow">
          <IconChevronLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 bg-brand-background rounded-t-2xl -mt-6 p-4 pb-28">
        <div className="flex items-end mb-4">
            <img src={bakery.logoUrl} alt={`${bakery.name} logo`} className="w-20 h-20 rounded-2xl border-4 border-brand-background -mt-12 mr-4 shadow-lg"/>
            <div>
                 <h1 className="font-bold text-2xl text-brand-text">{bakery.name}</h1>
                 <div className="flex items-center text-sm text-brand-text-secondary">
                    <IconStar className="w-4 h-4 text-brand-primary mr-1" />
                    <span className="font-semibold text-brand-text">{bakery.rating}</span>
                    <span className="mx-2">•</span>
                    <span>{bakery.distance} km</span>
                    <span className="mx-2">•</span>
                    <span>{bakery.activeSubscriptions} assinantes</span>
                </div>
            </div>
        </div>
        
        <button 
            onClick={() => setFlowStep('feed')}
            className="w-full bg-white text-brand-secondary font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200/80 flex items-center justify-center gap-2 mb-4"
        >
            <IconUsers className="w-5 h-5"/> Ver o que estão falando ✨
        </button>
        
        <h2 className="font-bold text-lg text-brand-text mt-2 mb-3">Produtos para Assinatura</h2>
        <div className="space-y-3">
            {bakery.products.map(product => (
                <div key={product.id} className="bg-white p-3 rounded-xl flex items-center gap-4 shadow-sm">
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                        <p className="font-semibold text-brand-text">{product.name}</p>
                        <p className="text-sm text-brand-text-secondary">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {basket[product.id] && basket[product.id].quantity > 0 ? (
                            <>
                                <button onClick={() => handleUpdateBasket(product, -1)} className="w-8 h-8 rounded-full bg-brand-background text-brand-secondary flex items-center justify-center font-bold text-xl">-</button>
                                <span className="font-bold text-brand-text w-4 text-center">{basket[product.id]?.quantity || 0}</span>
                            </>
                        ) : null }
                        <button onClick={() => handleUpdateBasket(product, 1)} className="w-8 h-8 rounded-full bg-brand-primary text-brand-secondary flex items-center justify-center font-bold text-xl">+</button>
                    </div>
                </div>
            ))}
        </div>
      </main>

      {basketCount > 0 && (
         <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/80">
            <button onClick={() => setFlowStep('packages')} className="w-full bg-brand-primary text-brand-secondary font-bold py-3 px-4 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg flex justify-between items-center text-lg">
                <span>Escolher pacote de entrega</span>
                <span>R$ {basketTotal.toFixed(2)}</span>
            </button>
         </footer>
      )}
    </div>
  );
};

export default BakeryDetail;