
import React, { useState, useEffect } from 'react';
import type { User, Delivery } from '../types';
import { DeliveryStatus } from '../types';
import { getDeliveryJobs, getDeliveryHistory } from '../services/api';
import BottomNav from './UserList'; // Repurposed UserList.tsx as BottomNav
import { DELIVERY_NAV_ITEMS } from '../constants';
import { IconLogout, IconMapPin, IconClock, IconStar, IconMessageCircle, IconReceipt } from './StatIcons';
import DeliveryProfileScreen from './DeliveryProfileScreen'; // Import the new profile component

interface DeliveryAppProps {
  user: User;
  onLogout: () => void;
}

const DeliveryCard: React.FC<{ delivery: Delivery }> = ({ delivery }) => {
    
    const [status, setStatus] = useState(delivery.status);

    const handleMarkAsDelivered = () => {
        // Here you would call an API, but for now, we just update the state
        setStatus(DeliveryStatus.DELIVERED);
    }

    const handleViewRoute = () => {
        // Open the delivery address in Google Maps
        const encodedAddress = encodeURIComponent(delivery.address);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        
        // Try to open in native maps app first, fall back to web browser
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // For mobile devices, try to open in native Google Maps app
            window.open(`googlemaps://maps?q=${encodedAddress}`, '_blank');
        }
        
        // Always open in web browser as fallback or for desktop
        window.open(googleMapsUrl, '_blank');
    }
    
    const statusStyles = {
        [DeliveryStatus.PENDING]: "text-orange-800 bg-orange-100",
        [DeliveryStatus.DELIVERED]: "text-green-800 bg-green-100",
        [DeliveryStatus.RESCHEDULED]: "text-gray-800 bg-gray-100",
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-sm mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-brand-text">{delivery.customerName}</h3>
                    <div className="flex items-center text-sm text-brand-text-secondary mt-1">
                        <IconMapPin className="w-4 h-4 mr-2" />
                        <span>{delivery.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-brand-text-secondary mt-1">
                        <IconClock className="w-4 h-4 mr-2" />
                        <span>{delivery.timeSlot}</span>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyles[status]}`}>{status}</span>
            </div>
            {status === DeliveryStatus.PENDING && (
                <div className="mt-4 flex gap-3">
                    <button 
                        onClick={handleViewRoute}
                        className="flex-1 bg-amber-100 text-amber-800 font-bold py-2.5 px-4 rounded-xl hover:bg-amber-200 transition-colors">
                        Ver Rota
                    </button>
                    <button 
                        onClick={handleMarkAsDelivered}
                        className="flex-1 bg-brand-primary text-brand-secondary font-bold py-2.5 px-4 rounded-xl hover:bg-brand-primary/90 transition-colors shadow">
                        Marcar como Entregue
                    </button>
                </div>
            )}
        </div>
    );
}


const DeliveryHistoryCard: React.FC<{ delivery: Delivery }> = ({ delivery }) => {
    const StarRating = ({ rating = 0 }: { rating?: number }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <IconStar
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(rating) ? 'text-brand-primary' : 'text-gray-300'}`}
                />
            ))}
            {rating > 0 && <span className="ml-2 text-sm font-bold text-brand-text">{rating.toFixed(1)}</span>}
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-sm mb-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-semibold text-brand-text">{delivery.customerName}</h3>
                    <p className="text-xs text-brand-text-secondary">{delivery.date}</p>
                </div>
                <StarRating rating={delivery.rating} />
            </div>
            {delivery.customerFeedback && (
                <div className="mt-3 pt-3 border-t border-gray-200/80">
                    <div className="flex items-start text-sm text-brand-text-secondary">
                        <IconMessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="italic">"{delivery.customerFeedback}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const DeliveryApp: React.FC<DeliveryAppProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('deliveries');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [history, setHistory] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activePage === 'deliveries') {
                const data = await getDeliveryJobs(user.id);
                setDeliveries(data);
            } else if (activePage === 'history') {
                const data = await getDeliveryHistory(user.id);
                setHistory(data);
            }
        } catch(e) {
            console.error("Failed to fetch data for delivery app", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [user.id, activePage]);


  const Header = () => (
    <header className="p-4 border-b border-gray-200/80 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-brand-text-secondary">Entregador</p>
                <h2 className="font-bold text-lg text-brand-text">{user.name}</h2>
            </div>
            <button onClick={onLogout} className="text-brand-text-secondary hover:text-brand-secondary">
                <IconLogout className="w-6 h-6" />
            </button>
        </div>
    </header>
  );

  const renderDeliveries = () => (
    <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-brand-text">Suas entregas de hoje 🍞 ({deliveries.filter(d=>d.status === DeliveryStatus.PENDING).length})</h2>
        {deliveries.map(d => <DeliveryCard key={d.id} delivery={d} />)}
    </div>
  );

  const renderHistory = () => (
    <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-brand-text">Histórico de Entregas</h2>
        {history.length > 0 ? (
            history.map(d => <DeliveryHistoryCard key={d.id} delivery={d} />)
        ) : (
             <div className="text-center text-brand-text-secondary mt-12">
                <IconReceipt className="w-16 h-16 mx-auto stroke-brand-text-secondary/50" />
                <p className="mt-4">Seu histórico de entregas aparecerá aqui.</p>
                <p className="text-sm">Conclua entregas para ver suas avaliações.</p>
            </div>
        )}
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="text-center p-8 text-brand-text-secondary">Carregando...</div>;
    
    switch (activePage) {
        case 'deliveries':
            return renderDeliveries();
        case 'history':
            return renderHistory();
        case 'profile':
            return <DeliveryProfileScreen user={user} onLogout={onLogout} />;
        default:
            return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-brand-background">
        {activePage !== 'profile' && <Header />}
        <main className="flex-1 overflow-y-auto pb-20">
            {renderContent()}
        </main>
        <BottomNav items={DELIVERY_NAV_ITEMS} activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default DeliveryApp;