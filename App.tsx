
import React, { useState, useEffect } from 'react';
import type { User } from './types';
import { UserRole } from './types';
import { supabase } from './services/supabase';
import { getCurrentUser, logout as supabaseLogout } from './services/supabaseApi';

// NOTE: Component files have been repurposed to build the new application
// as per the user's request, while adhering to the existing file structure.
import LoginScreen from './components/Sidebar'; // Originally Sidebar.tsx
import ClientApp from './components/Dashboard'; // Originally Dashboard.tsx
import BakeryApp from './components/BakeryList'; // Originally BakeryList.tsx
import DeliveryApp from './components/SubscriptionList'; // Originally SubscriptionList.tsx
import AdminApp from './components/AdminApp'; // New Admin Dashboard
import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check for authenticated user from Supabase
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to get current user", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Keep splash for at least 3 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    checkUser();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          getCurrentUser().then(setCurrentUser);
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      clearTimeout(splashTimer);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabaseLogout();
    setCurrentUser(null);
  };

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderAppForRole = () => {
    switch (currentUser.role) {
      case UserRole.CLIENT:
        return <ClientApp user={currentUser} onLogout={handleLogout} />;
      case UserRole.BAKERY:
        return <BakeryApp user={currentUser} onLogout={handleLogout} />;
      case UserRole.DELIVERY:
        return <DeliveryApp user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminApp user={currentUser} onLogout={handleLogout} />;
      default:
        return (
          <div className="p-4">
            <p>Unknown user role.</p>
            <button onClick={handleLogout} className="text-red-500">Logout</button>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-brand-background text-brand-text">
      <div className="max-w-md mx-auto h-screen flex flex-col shadow-lg bg-white">
        {renderAppForRole()}
      </div>
    </div>
  );
};

export default App;