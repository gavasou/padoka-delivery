
import React, { useState, useEffect } from 'react';
import type { User } from './types';
import { UserRole } from './types';
import { supabase } from './services/supabase';
import { getCurrentUser, logout as supabaseLogout } from './services/supabaseApi';

// PWA Components
import PWANotifications from './components/PWANotifications';
import { OfflineStatus, OfflineQueue } from './components/OfflineManager';
import { LazyAppRenderer } from './components/LazyAppRenderer';
import { PerformanceMonitor } from './components/PerformanceOptimizer';

// NOTE: Component files have been repurposed to build the new application
// as per the user's request, while adhering to the existing file structure.
import LoginScreen from './components/Sidebar'; // Originally Sidebar.tsx
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

  return (
    <div className="w-full min-h-screen font-sans bg-brand-background text-brand-text">
      {/* PWA Notifications and Status */}
      <PWANotifications />
      
      <div className="max-w-md mx-auto h-screen flex flex-col shadow-lg bg-white">
        {/* Offline Status Components */}
        <OfflineStatus />
        <OfflineQueue />
        
        <LazyAppRenderer user={currentUser} onLogout={handleLogout} />
      </div>
      
      {/* Performance Monitor (apenas em desenvolvimento) */}
      <PerformanceMonitor />
    </div>
  );
};

export default App;