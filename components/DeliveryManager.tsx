
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Delivery, Product } from '../types';
import { DeliveryStatus } from '../types';
import { getDeliveryJobs, updateDeliveryStatus } from '../services/api';
import { IconMapPin, IconClock, IconPackage, IconCheck } from './StatIcons';

interface DeliveryManagerProps {
  user: User;
}

const DeliveryItemCard: React.FC<{
    delivery: Delivery;
    onUpdateStatus: (id: string, status: DeliveryStatus) => void;
}> = ({ delivery, onUpdateStatus }) => {
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 mb-3">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-brand-text">{delivery.customerName}</h3>
                    <div className="flex items-center text-xs text-brand-text-secondary mt-1">
                        <IconMapPin className="w-3.5 h-3.5 mr-1.5" />
                        <span>{delivery.address}</span>
                    </div>
                </div>
                <span className="text-xs font-semibold text-brand-secondary bg-brand-background px-2 py-1 rounded-md">{delivery.timeSlot}</span>
            </div>
            
            <div className="mb-3">
                 <h4 className="flex items-center text-sm font-semibold text-brand-text mb-2">
                    <IconPackage className="w-4 h-4 mr-2" />
                    Itens do Pedido
                </h4>
                <ul className="space-y-1 pl-1">
                    {delivery.items.map(item => (
                        <li key={item.id} className="text-sm text-brand-text-secondary">- {item.name}</li>
                    ))}
                </ul>
            </div>

            {delivery.status === DeliveryStatus.PENDING && (
                <button 
                    onClick={() => onUpdateStatus(delivery.id, DeliveryStatus.DELIVERED)}
                    className="w-full bg-brand-primary text-brand-secondary font-bold py-2.5 rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    <IconCheck className="w-5 h-5"/> Marcar como Entregue
                </button>
            )}
        </div>
    );
};


const DeliveryManager: React.FC<DeliveryManagerProps> = ({ user }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getDeliveryJobs(user.id);
            setDeliveries(data);
        } catch (e) {
            console.error("Failed to fetch deliveries", e);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);
    
    const handleUpdateStatus = async (id: string, status: DeliveryStatus) => {
        try {
            await updateDeliveryStatus(id, status);
            // Optimistically update the UI before re-fetching
            setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d));
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    const { pending, completed } = useMemo(() => {
        return deliveries.reduce((acc, delivery) => {
            if (delivery.status === DeliveryStatus.PENDING) {
                acc.pending.push(delivery);
            } else {
                acc.completed.push(delivery);
            }
            return acc;
        }, { pending: [] as Delivery[], completed: [] as Delivery[] });
    }, [deliveries]);

    if (loading) {
        return <div className="text-center p-8 text-brand-text-secondary">Carregando entregas...</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-brand-text mb-4">Gerenciar Entregas do Dia</h2>
            
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-200/50 text-center">
                    <p className="text-2xl font-bold text-brand-primary">{pending.length}</p>
                    <p className="text-sm font-medium text-brand-text-secondary">Pendentes</p>
                </div>
                 <div className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-200/50 text-center">
                    <p className="text-2xl font-bold text-green-600">{completed.length}</p>
                    <p className="text-sm font-medium text-brand-text-secondary">Concluídas</p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-lg text-brand-text mb-2">Pendentes</h3>
                {pending.length > 0 ? (
                    pending.map(d => <DeliveryItemCard key={d.id} delivery={d} onUpdateStatus={handleUpdateStatus} />)
                ) : (
                    <p className="text-center text-sm text-brand-text-secondary p-4 bg-white rounded-xl">Nenhuma entrega pendente. Bom trabalho! ✅</p>
                )}
            </div>
            
            <div>
                <h3 className="font-bold text-lg text-brand-text mb-2">Concluídas</h3>
                {completed.length > 0 ? (
                    completed.map(d => <DeliveryItemCard key={d.id} delivery={d} onUpdateStatus={handleUpdateStatus} />)
                ) : (
                     <p className="text-center text-sm text-brand-text-secondary p-4 bg-white rounded-xl">Nenhuma entrega foi concluída ainda.</p>
                )}
            </div>
        </div>
    );
};

export default DeliveryManager;