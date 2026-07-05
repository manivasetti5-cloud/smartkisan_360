import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import FarmerPortal from './components/FarmerPortal';
import CustomerPortal from './components/CustomerPortal';
import DealerPortal from './components/DealerPortal';
import VoiceAssistant from './components/VoiceAssistant';
import { User, UserRole } from './types';
import { SupportedLanguage } from './translations';
import { Sprout } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'auth' | 'farmer' | 'customer' | 'dealer'>('landing');
  const [selectedAuthRole, setSelectedAuthRole] = useState<UserRole | null>(null);
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('smartkisan_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    () => (localStorage.getItem('smartkisan_language') as SupportedLanguage) || 'en'
  );

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('smartkisan_language', lang);
  };

  // Restore user session on mount (Persistent fallback pagination and refreshes)
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    const savedToken = localStorage.getItem('smartkisan_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      });

      if (response.ok) {
        const userProfile = await response.json();
        setToken(savedToken);
        setUser(userProfile);
        
        // Route straight to their active portal
        if (userProfile.role === 'farmer') {
          setActiveView('farmer');
        } else if (userProfile.role === 'customer') {
          setActiveView('customer');
        } else if (userProfile.role === 'dealer') {
          setActiveView('dealer');
        }
      } else {
        // Clear broken/expired session
        localStorage.removeItem('smartkisan_token');
        setToken(null);
        setUser(null);
        setActiveView('landing');
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      // Retain visual page if network transient error, but mark loaded
    } finally {
      setLoading(false);
    }
  };

  const handleStartAuth = (role: UserRole | null) => {
    setSelectedAuthRole(role);
    setActiveView('auth');
  };

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('smartkisan_token', newToken);
    setToken(newToken);
    setUser(newUser);

    if (newUser.role === 'farmer') {
      setActiveView('farmer');
    } else if (newUser.role === 'customer') {
      setActiveView('customer');
    } else if (newUser.role === 'dealer') {
      setActiveView('dealer');
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('smartkisan_token');
    setToken(null);
    setUser(null);
    setActiveView('landing');
  };

  // Render fullpage preloader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg animate-bounce">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-slate-800">SmartKisan 360</h3>
            <p className="text-xs text-slate-400 font-mono animate-pulse">Establishing secure 2FA CIA session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Active View routing engine
  switch (activeView) {
    case 'auth':
      return (
        <AuthPage
          initialRole={selectedAuthRole}
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setActiveView('landing')}
        />
      );
    case 'farmer':
      return user && token ? (
        <>
          <FarmerPortal
            user={user}
            token={token}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
          <VoiceAssistant currentLanguage={currentLanguage} token={token} />
        </>
      ) : (
        <LandingPage onStartAuth={handleStartAuth} />
      );
    case 'customer':
      return user && token ? (
        <>
          <CustomerPortal
            user={user}
            token={token}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
          <VoiceAssistant currentLanguage={currentLanguage} token={token} />
        </>
      ) : (
        <LandingPage onStartAuth={handleStartAuth} />
      );
    case 'dealer':
      return user && token ? (
        <>
          <DealerPortal
            user={user}
            token={token}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
          <VoiceAssistant currentLanguage={currentLanguage} token={token} />
        </>
      ) : (
        <LandingPage onStartAuth={handleStartAuth} />
      );
    case 'landing':
    default:
      return <LandingPage onStartAuth={handleStartAuth} />;
  }
}
