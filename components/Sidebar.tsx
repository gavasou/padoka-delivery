
import React, { useState, useRef, useEffect } from 'react';
import { login, register } from '../services/supabaseApi';
import type { User } from '../types';
import { UserRole } from '../types';
import { IconBread, IconBuildingStore, IconMotorbike } from './StatIcons'; // Repurposed StatIcons

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Secret admin login logic
  const logoClickCount = useRef(0);
  // Fix: Use `number` for setTimeout return type in browser environments instead of `NodeJS.Timeout`.
  const logoClickTimer = useRef<number | null>(null);

  const handleLogoClick = () => {
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }
    logoClickCount.current += 1;
    if (logoClickCount.current === 5) {
      setShowAdminLogin(true);
      logoClickCount.current = 0;
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 1500); // Reset after 1.5 seconds
  };
  
  useEffect(() => {
    return () => {
      if (logoClickTimer.current) {
        clearTimeout(logoClickTimer.current);
      }
    };
  }, []);

  const handleDemoLogin = (roleToLogin: UserRole) => {
    let demoEmail = '';
    if (roleToLogin === UserRole.CLIENT) demoEmail = 'cliente@padoka.com';
    if (roleToLogin === UserRole.BAKERY) demoEmail = 'padaria@padoka.com';
    if (roleToLogin === UserRole.DELIVERY) demoEmail = 'entregador@padoka.com';
    if (roleToLogin === UserRole.ADMIN) demoEmail = 'admin@padoka.com';
    setEmail(demoEmail);
    setPassword('Padoka2025!');
  }

  const handleSubmit = async (e: React.FormEvent, isAdminLogin = false) => {
    e.preventDefault();
    setError('');
    try {
      let user;
      if (isRegister && !isAdminLogin) {
        user = await register(name, email, password, role, {
          phone: '',
          address: '',
          vehicle: role === UserRole.DELIVERY ? 'moto' : undefined
        });
        if (user && user.status === 'pending') {
          setError('Cadastro realizado! Aguardando aprovação do administrador.');
          return;
        }
      } else {
        user = await login(email, password);
      }

      if (user) {
        if (isAdminLogin && user.role !== UserRole.ADMIN) {
           setError('Acesso negado. Apenas para administradores.');
           return;
        }
        onLogin(user);
      } else {
        setError('Credenciais inválidas ou usuário não encontrado.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    }
  };
  
  const AdminLoginModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm relative">
             <button onClick={() => setShowAdminLogin(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-2xl">&times;</button>
             <h2 className="text-2xl font-bold text-center text-brand-text mb-6">Acesso Restrito</h2>
             <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email de Administrador"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                 {error && <div className="alert text-center"><p>{error}</p></div>}
                <button type="submit" className="w-full bg-brand-secondary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity text-lg shadow-md">
                    Entrar
                </button>
             </form>
        </div>
    </div>
  );


  const RoleSelector = () => (
    <div className="my-6">
      <h3 className="mb-4 font-semibold text-center text-brand-text">Qual é o seu perfil?</h3>
      <div className="grid grid-cols-3 gap-3">
        <button type="button" onClick={() => setRole(UserRole.CLIENT)} className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${role === UserRole.CLIENT ? 'border-brand-secondary bg-brand-secondary text-white' : 'border-gray-200 bg-white'}`}>
          <IconBread className={`w-8 h-8 mb-2 ${role === UserRole.CLIENT ? 'stroke-white' : 'stroke-brand-secondary'}`} />
          <span className="text-sm font-semibold">Cliente 🍞</span>
        </button>
        <button type="button" onClick={() => setRole(UserRole.BAKERY)} className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${role === UserRole.BAKERY ? 'border-brand-primary bg-brand-primary text-brand-secondary' : 'border-gray-200 bg-white'}`}>
          <IconBuildingStore className={`w-8 h-8 mb-2 ${role === UserRole.BAKERY ? 'stroke-brand-secondary' : 'stroke-brand-secondary'}`} />
          <span className="text-sm font-semibold">Padaria 🏪</span>
        </button>
        <button type="button" onClick={() => setRole(UserRole.DELIVERY)} className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${role === UserRole.DELIVERY ? 'border-brand-primary bg-white text-brand-primary' : 'border-gray-200 bg-white'}`}>
          <IconMotorbike className={`w-8 h-8 mb-2 ${role === UserRole.DELIVERY ? 'stroke-brand-primary' : 'stroke-brand-secondary'}`} />
          <span className="text-sm font-semibold">Entregador 🚴‍♂️</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-background p-4">
      {showAdminLogin && <AdminLoginModal />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://lh3.googleusercontent.com/d/1air1DA28HUeAbnHvOr5BxuKt1xGMuFFV" 
            alt="Padoka Logo" 
            className="w-48 mx-auto mb-4 cursor-pointer"
            onClick={handleLogoClick}
          />
          <h1 className="text-3xl font-bold text-brand-text">Bem-vindo à Padoka ☕</h1>
          <p className="text-brand-text-secondary mt-2">Seu pão fresquinho entregue toda manhã.</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-brand-text mb-6">{isRegister ? 'Crie sua Conta' : 'Acesse sua Conta'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
               <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isRegister && <RoleSelector />}
            
            {error && <div className="alert text-center"><p>{error}</p></div>}

            <button type="submit" className="w-full bg-brand-primary text-brand-secondary py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors text-lg shadow-md">
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-brand-text-secondary">
            {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="font-semibold text-brand-secondary hover:underline ml-1">
              {isRegister ? 'Faça login' : 'Cadastre-se'}
            </button>
          </p>
           <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-center text-xs text-brand-text-secondary mb-2">Para demonstração, use:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                  <button onClick={() => handleDemoLogin(UserRole.CLIENT)} className="text-brand-secondary font-semibold hover:underline">Cliente</button>
                  <button onClick={() => handleDemoLogin(UserRole.BAKERY)} className="text-brand-secondary font-semibold hover:underline">Padaria</button>
                  <button onClick={() => handleDemoLogin(UserRole.DELIVERY)} className="text-brand-secondary font-semibold hover:underline">Entregador</button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;