
import React from 'react';
import type { ReceiptData } from '../types';
import { IconPrinter } from './StatIcons';

interface ReceiptScreenProps {
  receiptData: ReceiptData;
  onDone: () => void;
}

const ReceiptScreen: React.FC<ReceiptScreenProps> = ({ receiptData, onDone }) => {
  const {
    orderId,
    date,
    bakery,
    basket,
    package: pkg,
    costs,
    paymentMethod,
  } = receiptData;

  return (
    <div className="flex flex-col h-full bg-brand-background">
      <header className="p-4 bg-white sticky top-0 z-10 text-center border-b border-gray-200/80">
        <h1 className="font-bold text-lg text-brand-text">Recibo do Pedido</h1>
        <button className="absolute top-1/2 -translate-y-1/2 right-4 text-brand-secondary">
          <IconPrinter className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/50">
          <div className="text-center mb-6 pb-4 border-b-2 border-dashed">
            <img src={bakery.logoUrl} alt={bakery.name} className="w-16 h-16 rounded-xl mx-auto mb-3" />
            <h2 className="text-xl font-bold text-brand-text">{bakery.name}</h2>
            <p className="text-sm text-brand-text-secondary">Obrigado pela sua compra!</p>
          </div>

          <div className="text-sm space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Nº do Pedido:</span>
              <span className="font-mono font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Data:</span>
              <span className="font-semibold">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Pagamento:</span>
              <span className="font-semibold">{paymentMethod}</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-bold text-brand-text mb-3">Itens do Pacote ({pkg.type})</h3>
            <div className="space-y-2 text-sm">
              {Object.values(basket).map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-brand-text">{product.name}</p>
                    <p className="text-brand-text-secondary">
                      {quantity} x R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-semibold text-brand-text">
                    R$ {(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
           <div className="border-t-2 border-dashed pt-4 text-sm">
             <div className="space-y-2 text-brand-text-secondary">
                <div className="flex justify-between"><span>Subtotal dos Itens ({pkg.days} dias):</span> <span>R$ {costs.totalItemCost.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxa de Entrega ({pkg.days} dias):</span> <span>R$ {costs.totalDeliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxa de Serviço:</span> <span>R$ {costs.serviceFee.toFixed(2)}</span></div>
                {costs.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Desconto Aplicado:</span>
                        <span>- R$ {costs.discount.toFixed(2)}</span>
                    </div>
                )}
            </div>
             <div className="mt-4 pt-3 border-t flex justify-between font-bold text-lg text-brand-text">
                <span>Total Pago</span>
                <span>R$ {costs.finalTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </main>

      <footer className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/80">
        <button onClick={onDone} className="w-full primary font-bold py-3 px-4 rounded-xl text-lg">
          Ver Minhas Assinaturas
        </button>
      </footer>
    </div>
  );
};

export default ReceiptScreen;