import React, { Suspense, lazy } from 'react';
import { UserRole } from '../types';
import type { User } from '../types';

// Lazy loading dos componentes principais
const ClientApp = lazy(() => import('./Dashboard'));
const BakeryApp = lazy(() => import('./BakeryList'));
const DeliveryApp = lazy(() => import('./SubscriptionList'));
const AdminApp = lazy(() => import('./AdminApp'));

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-brand-primary border-opacity-20 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <span className="ml-3 text-brand-text-secondary">Carregando...</span>
  </div>
);

// Error boundary para lazy loading
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-brand-text mb-2">Erro ao carregar</h3>
          <p className="text-brand-text-secondary text-center mb-4">
            Houve um problema ao carregar esta seção. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-primary text-brand-secondary rounded-lg hover:opacity-90 transition-opacity"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface LazyAppRendererProps {
  user: User;
  onLogout: () => void;
}

// Componente que renderiza o app baseado no papel do usuário com lazy loading
export const LazyAppRenderer: React.FC<LazyAppRendererProps> = ({ user, onLogout }) => {
  const renderAppForRole = () => {
    switch (user.role) {
      case UserRole.CLIENT:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClientApp user={user} onLogout={onLogout} />
          </Suspense>
        );
      case UserRole.BAKERY:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BakeryApp user={user} onLogout={onLogout} />
          </Suspense>
        );
      case UserRole.DELIVERY:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DeliveryApp user={user} onLogout={onLogout} />
          </Suspense>
        );
      case UserRole.ADMIN:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminApp user={user} onLogout={onLogout} />
          </Suspense>
        );
      default:
        return (
          <div className="p-4">
            <p>Unknown user role.</p>
            <button onClick={onLogout} className="text-red-500">Logout</button>
          </div>
        );
    }
  };

  return (
    <LazyLoadErrorBoundary>
      {renderAppForRole()}
    </LazyLoadErrorBoundary>
  );
};