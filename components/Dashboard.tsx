
import React, { useState, useEffect } from 'react';
import type { User, Bakery, Subscription } from '../types';
import { getNearbyBakeries, getClientSubscriptions } from '../services/api';
import BottomNav from './UserList'; // Repurposed UserList.tsx as BottomNav
import { CLIENT_NAV_ITEMS } from '../constants';
import { IconLogout, IconSearch, IconStar, IconReceipt } from './StatIcons';
import BakeryDetail from './BakeryDetail'; // Import the new detail component
import ProfileScreen from './ProfileScreen'; // Import the new profile component

interface ClientAppProps {
  user: User;
  onLogout: () => void;
}

const BakeryCard: React.FC<{ bakery: Bakery; onClick: () => void }> = ({ bakery, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-sm mb-4 cursor-pointer active:scale-[0.98] transition-transform duration-150">
        <div className="h-32 bg-cover bg-center" style={{backgroundImage: `url(https://i.imgur.com/L1iAdH7.png)`}}></div>
        <div className="p-4">
            <div className="flex items-start">
                <img src={bakery.logoUrl} alt={`${bakery.name} logo`} className="w-16 h-16 rounded-xl border-4 border-white -mt-12 mr-4 shadow-md"/>
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-brand-text">{bakery.name}</h3>
                    <div className="flex items-center text-sm text-brand-text-secondary">
                        <IconStar className="w-4 h-4 text-brand-primary mr-1" />
                        <span className="font-semibold text-brand-text">{bakery.rating}</span>
                        <span className="mx-2">•</span>
                        <span>{bakery.distance} km</span>
                    </div>
                </div>
            </div>
            <button className="mt-4 w-full bg-brand-primary text-brand-secondary font-bold py-3 px-4 rounded-xl hover:bg-brand-primary/90 transition-colors shadow">
                Ver cardápio e assinar
            </button>
        </div>
    </div>
);

const SubscriptionCard: React.FC<{ subscription: Subscription }> = ({ subscription }) => {
    const total = subscription.items.reduce((sum, item) => sum + item.price, 0);
    const statusStyles = {
        'Active': 'bg-green-100 text-green-800',
        'Paused': 'bg-yellow-100 text-yellow-800',
        'Cancelled': 'bg-red-100 text-red-800'
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-200/50 shadow-sm mb-4">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-brand-text">{subscription.bakeryName}</h3>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[subscription.status]}`}>{subscription.status}</span>
            </div>
            <p className="text-sm font-semibold text-brand-secondary mb-2">{subscription.plan}</p>
            <ul className="text-sm text-brand-text-secondary space-y-1 mb-3">
                {subscription.items.map(item => (
                    <li key={item.id} className="flex justify-between">
                        <span>- {item.name}</span>
                        <span>R$ {item.price.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-brand-text">
                <span>Total Diário</span>
                <span>R$ {total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-2">Próxima entrega: <span className="font-semibold">{subscription.nextDelivery}</span></p>
        </div>
    );
};


const ClientApp: React.FC<ClientAppProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('home');
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBakeryId, setSelectedBakeryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBakeries = async () => {
        try {
            setLoading(true);
            const data = await getNearbyBakeries();
            setBakeries(data);
        } catch(e) {
            console.error("Failed to fetch bakeries", e);
        } finally {
            setLoading(false);
        }
    }
    fetchBakeries();
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
        if (activePage === 'subscriptions') {
            try {
                setLoading(true);
                const data = await getClientSubscriptions(user.id);
                setSubscriptions(data);
            } catch (e) {
                console.error("Failed to fetch subscriptions", e);
            } finally {
                setLoading(false);
            }
        }
    };
    fetchSubscriptions();
  }, [activePage, user.id]);

  const handleSubscribed = () => {
      setSelectedBakeryId(null);
      setActivePage('subscriptions');
  }

  if (selectedBakeryId) {
      return <BakeryDetail bakeryId={selectedBakeryId} user={user} onBack={() => setSelectedBakeryId(null)} onSubscribed={handleSubscribed} />;
  }

  const Header = () => (
    <header className="p-4 border-b border-gray-200/80 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-brand-text-secondary">Entregar em</p>
                <h2 className="font-bold text-md text-brand-text">{user.address} ▼</h2>
            </div>
            <button onClick={onLogout} className="text-brand-text-secondary hover:text-brand-secondary">
                <IconLogout className="w-6 h-6" />
            </button>
        </div>
        <div className="mt-4 relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input type="text" placeholder="Buscar por padaria ou produto" className="w-full bg-brand-background border-transparent rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/80" />
        </div>
    </header>
  );
  
  const renderMainContent = () => {
      if(loading) return <div className="text-center p-8 text-brand-text-secondary">Carregando...</div>
    
      switch (activePage) {
          case 'home':
              return (
                  <div className="p-4">
                      <h2 className="text-xl font-bold mb-4 text-brand-text">Padarias Próximas</h2>
                      {bakeries.map(bakery => <BakeryCard key={bakery.id} bakery={bakery} onClick={() => setSelectedBakeryId(bakery.id)} />)}
                  </div>
              );
          case 'subscriptions':
              return (
                  <div className="p-4">
                      <h2 className="text-xl font-bold mb-4 text-brand-text">Minhas Assinaturas</h2>
                      {subscriptions.length > 0 ? (
                          subscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)
                      ) : (
                          <div className="text-center text-brand-text-secondary mt-12">
                              <IconReceipt className="w-16 h-16 mx-auto stroke-brand-text-secondary/50" />
                              <p className="mt-4">Você ainda não tem assinaturas.</p>
                              <p className="text-sm">Explore as padarias na aba 'Início'!</p>
                          </div>
                      )}
                  </div>
              );
          default:
              return null;
      }
  }

  return (
    <div className="flex flex-col h-full bg-brand-background">
        {activePage !== 'profile' && <Header />}
        <main className="flex-1 overflow-y-auto pb-20">
            {activePage === 'profile' ? <ProfileScreen user={user} /> : renderMainContent()}
        </main>
        <BottomNav items={CLIENT_NAV_ITEMS} activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default ClientApp;