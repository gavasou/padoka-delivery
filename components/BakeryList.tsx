
import React, { useState, useEffect } from 'react';
import type { User, Delivery, WeeklyRevenue } from '../types';
import { getBakeryDashboardData, getDeliveryJobs, getBakeryWeeklyRevenue } from '../services/api';
import BottomNav from './UserList'; // Repurposed UserList.tsx as BottomNav
import { BAKERY_NAV_ITEMS } from '../constants';
import { IconLogout, IconBell, IconRepeat, IconTruck } from './StatIcons';
import ProductManager from './ProductManager';
import DeliveryManager from './DeliveryManager';
import BakeryProfileScreen from './BakeryProfileScreen';


interface BakeryAppProps {
  user: User;
  onLogout: () => void;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, variant = 'neutral' }) => {
    const baseClasses = "p-4 rounded-xl flex-1 flex flex-col justify-between shadow-sm";
    const variants = {
        primary: "bg-brand-primary text-brand-secondary", // Yellow
        secondary: "bg-brand-secondary text-white", // Brown
        neutral: "bg-white border border-brand-primary/30 text-brand-text" // White
    }
    const iconColor = {
        primary: "text-brand-secondary",
        secondary: "text-white",
        neutral: "text-brand-primary"
    }

    return (
        <div className={`${baseClasses} ${variants[variant]}`}>
            <div className={`w-7 h-7 ${iconColor[variant]}`}>{icon}</div>
            <div>
                <p className={`text-sm font-medium ${variant === 'secondary' ? 'text-white/80' : 'text-brand-text-secondary'}`}>{title}</p>
                <p className={`text-2xl font-bold`}>{value}</p>
            </div>
        </div>
    );
};


const BakeryDashboard: React.FC<BakeryAppProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState({ activeSubscriptions: 0, pendingDeliveries: 0, totalRevenueMonth: 0 });
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [statsData, revenueData] = await Promise.all([
                getBakeryDashboardData('bakery-1'),
                getBakeryWeeklyRevenue('bakery-1'),
            ]);
            setStats(statsData as any);
            setWeeklyRevenue(revenueData);
        } catch(e) {
            console.error("Failed to fetch bakery data", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const Header = () => (
    <header className="p-4 border-b border-gray-200/80 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-brand-text-secondary">Bom dia! ☀️</p>
                <h2 className="font-bold text-lg text-brand-text">{user.name}</h2>
            </div>
            <button onClick={onLogout} className="text-brand-text-secondary hover:text-brand-secondary">
                <IconLogout className="w-6 h-6" />
            </button>
        </div>
    </header>
  );
  
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const renderDashboard = () => (
    <div className="p-4">
        <h3 className="font-bold text-lg mb-3 text-brand-text">Visão Geral</h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <StatCard title="Assinaturas Ativas" value={stats.activeSubscriptions} icon={<IconRepeat/>} variant="primary" />
            <StatCard title="Entregas do Dia" value={stats.pendingDeliveries} icon={<IconTruck/>} variant="neutral" />
        </div>
        
        <div className="bg-brand-secondary text-white p-4 rounded-xl shadow-lg mb-6">
            <h3 className="font-bold text-lg mb-3">Financeiro do Mês</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-white/80">Receita Total</span>
                    <span className="text-2xl font-bold">{formatCurrency(stats.totalRevenueMonth)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Comissão Padoka (10%)</span>
                    <span className="font-semibold text-white/80">-{formatCurrency(stats.totalRevenueMonth * 0.1)}</span>
                </div>
                <div className="pt-2 border-t border-white/20 flex justify-between items-center">
                    <span className="font-semibold text-white">Repasse Líquido</span>
                    <span className="text-xl font-bold text-green-400">{formatCurrency(stats.totalRevenueMonth * 0.9)}</span>
                </div>
            </div>
        </div>
        
        <h3 className="font-bold text-lg mb-3 text-brand-text">Receita Semanal</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50 mb-6 h-[232px] flex items-center justify-center">
             <p className="text-brand-text-secondary text-center text-sm">
                O gráfico de receita está temporariamente indisponível para garantir a estabilidade do aplicativo.
            </p>
        </div>

        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg mb-6" role="alert">
          <div className="flex">
            <IconBell className="w-6 h-6 mr-3 text-amber-600"/>
            <div>
              <p className="font-bold">Alerta das 20h</p>
              <p className="text-sm">Prepare {stats.pendingDeliveries} entregas para amanhã! 🍞</p>
            </div>
          </div>
        </div>
    </div>
  );

  const renderContent = () => {
    if (loading && activePage === 'dashboard') return <div className="text-center p-8 text-brand-text-secondary">Carregando painel...</div>;
    
    switch (activePage) {
        case 'dashboard':
            return renderDashboard();
        case 'products':
            return <ProductManager user={user} />;
        case 'deliveries':
            return <DeliveryManager user={user} />;
        case 'profile':
            return <BakeryProfileScreen user={user} />;
        default:
            return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-brand-background">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20">
            {renderContent()}
        </main>
        <BottomNav items={BAKERY_NAV_ITEMS} activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default BakeryDashboard;