
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Delivery, Product } from '../types';
import { DeliveryStatus } from '../types';
import { getDeliveryJobs, updateDeliveryStatus } from '../services/api';
import supabase from '../lib/supabase';
import { IconMapPin, IconClock, IconPackage, IconCheck, IconSparkles, IconMap } from './StatIcons';

interface DeliveryManagerProps {
  user: User;
}

interface OptimizedRoute {
    route: any[];
    metrics: {
        totalDistance: number;
        totalValue: number;
        totalTime: number;
        profitPerKm: number;
        efficiency: number;
        deliveryCount: number;
    };
    justifications: string[];
}

interface RouteOpportunity {
    id: string;
    delivery: any;
    metrics: {
        distance: number;
        additionalValue: number;
        estimatedTime: number;
        valuePerKm: number;
        priority: number;
    };
    justification: string;
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

const OptimizedRouteCard: React.FC<{
    delivery: any;
    index: number;
    onAccept: () => void;
    onReject: () => void;
}> = ({ delivery, index, onAccept, onReject }) => {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 mb-3">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{delivery.customer_name}</h4>
                        <div className="flex items-center text-xs text-gray-600 mt-0.5">
                            <IconMapPin className="w-3 h-3 mr-1" />
                            <span>{delivery.address}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-purple-700">
                        R$ {(delivery.delivery_value || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">{delivery.estimated_duration || 15} min</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                    onClick={onAccept}
                    className="bg-green-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                >
                    <IconCheck className="w-4 h-4" />
                    Aceitar
                </button>
                <button
                    onClick={onReject}
                    className="bg-gray-400 text-white text-sm font-bold py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Recusar
                </button>
            </div>
        </div>
    );
};


const DeliveryManager: React.FC<DeliveryManagerProps> = ({ user }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [showOptimization, setShowOptimization] = useState(false);
    const [nearbyOpportunities, setNearbyOpportunities] = useState<RouteOpportunity[]>([]);

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
            setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d));
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    const handleOptimizeRoute = async () => {
        setOptimizing(true);
        try {
            // Buscar entregas disponíveis do Supabase
            const { data: availableDeliveries, error } = await supabase
                .from('deliveries')
                .select('*')
                .eq('status', 'Pendente')
                .is('delivery_person_id', null);

            if (error) throw error;

            // Obter localização atual (mock para demo)
            const currentLocation = {
                latitude: -23.5505,
                longitude: -46.6333
            };

            // Chamar edge function de otimização
            const { data, error: optimizeError } = await supabase.functions.invoke(
                'optimize-delivery-route',
                {
                    body: {
                        deliveryPersonId: user.id,
                        currentDelivery: pending[0] || null,
                        availableDeliveries: availableDeliveries || [],
                        origin: currentLocation
                    }
                }
            );

            if (optimizeError) throw optimizeError;

            setOptimizedRoute(data.data);
            setShowOptimization(true);
        } catch (error) {
            console.error('Erro ao otimizar rota:', error);
            alert('Erro ao calcular rota otimizada');
        } finally {
            setOptimizing(false);
        }
    };

    const handleFindNearby = async () => {
        try {
            const currentLocation = {
                latitude: -23.5505,
                longitude: -46.6333
            };

            const { data, error } = await supabase.functions.invoke(
                'find-nearby-deliveries',
                {
                    body: {
                        deliveryPersonId: user.id,
                        currentLocation,
                        maxRadius: 5
                    }
                }
            );

            if (error) throw error;

            setNearbyOpportunities(data.data.opportunities || []);
        } catch (error) {
            console.error('Erro ao buscar entregas próximas:', error);
        }
    };

    const handleAcceptDelivery = async (deliveryId: string) => {
        try {
            // Atribuir entrega ao entregador
            const { error } = await supabase
                .from('deliveries')
                .update({ delivery_person_id: user.id })
                .eq('id', deliveryId);

            if (error) throw error;

            alert('Entrega aceita com sucesso!');
            fetchDeliveries();
            setOptimizedRoute(null);
            setShowOptimization(false);
        } catch (error) {
            console.error('Erro ao aceitar entrega:', error);
            alert('Erro ao aceitar entrega');
        }
    };

    const handleRejectDelivery = (deliveryId: string) => {
        setOptimizedRoute(prev => {
            if (!prev) return null;
            return {
                ...prev,
                route: prev.route.filter(d => d.id !== deliveryId)
            };
        });
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
                    <p className="text-sm font-medium text-brand-text-secondary">Concluidas</p>
                </div>
            </div>

            {/* Secao de Otimizacao */}
            <div className="mb-6 bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-3 mb-4">
                    <IconSparkles className="w-8 h-8" />
                    <div>
                        <h3 className="text-lg font-bold">Otimizar Rota</h3>
                        <p className="text-sm text-purple-100">Maximize seus ganhos com entregas inteligentes</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={handleOptimizeRoute}
                        disabled={optimizing}
                        className="flex-1 bg-white text-purple-700 font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <IconMap className="w-5 h-5" />
                        {optimizing ? 'Calculando...' : 'Calcular Rota Otimizada'}
                    </button>
                    <button
                        onClick={handleFindNearby}
                        className="flex-1 bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <IconMapPin className="w-5 h-5" />
                        Buscar Proximas
                    </button>
                </div>
            </div>

            {/* Rota Otimizada */}
            {showOptimization && optimizedRoute && optimizedRoute.route.length > 0 && (
                <div className="mb-6 bg-white p-6 rounded-2xl shadow-lg border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <IconSparkles className="w-5 h-5 text-purple-600" />
                        Rota Otimizada Sugerida
                    </h3>
                    
                    {/* Metricas */}
                    <div className="grid grid-cols-3 gap-3 mb-4 bg-purple-50 p-4 rounded-xl">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-700">
                                {optimizedRoute.metrics.totalDistance.toFixed(1)} km
                            </p>
                            <p className="text-xs text-gray-600">Distancia Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                R$ {optimizedRoute.metrics.totalValue.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-600">Valor Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {optimizedRoute.metrics.totalTime} min
                            </p>
                            <p className="text-xs text-gray-600">Tempo Estimado</p>
                        </div>
                    </div>

                    {/* Justificativas */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Por que essa rota?</p>
                        {optimizedRoute.justifications.map((just, idx) => (
                            <p key={idx} className="text-xs text-blue-700">- {just}</p>
                        ))}
                    </div>

                    {/* Lista de Entregas */}
                    <div className="space-y-3">
                        {optimizedRoute.route.map((delivery, idx) => (
                            <OptimizedRouteCard
                                key={delivery.id}
                                delivery={delivery}
                                index={idx}
                                onAccept={() => handleAcceptDelivery(delivery.id)}
                                onReject={() => handleRejectDelivery(delivery.id)}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setShowOptimization(false)}
                        className="w-full mt-4 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Fechar Sugestoes
                    </button>
                </div>
            )}

            {/* Oportunidades Proximas */}
            {nearbyOpportunities.length > 0 && (
                <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="text-md font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <IconBell className="w-5 h-5" />
                        Entregas Proximas a Voce ({nearbyOpportunities.length})
                    </h3>
                    <div className="space-y-2">
                        {nearbyOpportunities.slice(0, 3).map((opp) => (
                            <div key={opp.delivery.id} className="bg-white p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-gray-900">{opp.delivery.customer_name}</p>
                                    <p className="text-sm font-bold text-green-600">+R$ {opp.metrics.additionalValue.toFixed(2)}</p>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    {opp.metrics.distance.toFixed(1)} km - {opp.justification}
                                </p>
                                <button
                                    onClick={() => handleAcceptDelivery(opp.delivery.id)}
                                    className="w-full bg-amber-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    Aceitar Esta Entrega
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h3 className="font-bold text-lg text-brand-text mb-2">Pendentes</h3>
                {pending.length > 0 ? (
                    pending.map(d => <DeliveryItemCard key={d.id} delivery={d} onUpdateStatus={handleUpdateStatus} />)
                ) : (
                    <p className="text-center text-sm text-brand-text-secondary p-4 bg-white rounded-xl">Nenhuma entrega pendente. Bom trabalho!</p>
                )}
            </div>
            
            <div>
                <h3 className="font-bold text-lg text-brand-text mb-2">Concluidas</h3>
                {completed.length > 0 ? (
                    completed.map(d => <DeliveryItemCard key={d.id} delivery={d} onUpdateStatus={handleUpdateStatus} />)
                ) : (
                     <p className="text-center text-sm text-brand-text-secondary p-4 bg-white rounded-xl">Nenhuma entrega foi concluida ainda.</p>
                )}
            </div>
        </div>
    );
};

export default DeliveryManager;
