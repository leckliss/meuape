import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LayoutDashboard, Wallet, PiggyBank, Building2, Settings } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Caixinha } from './pages/Caixinha';
import { Extrato } from './pages/Extrato';
import { Obra } from './pages/Obra';
import { Config } from './pages/Config';

function BottomNavigation() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Nós', icon: LayoutDashboard },
    { path: '/extrato', label: 'Extrato', icon: Wallet },
    { path: '/caixinha', label: 'Caixinha', icon: PiggyBank },
    { path: '/obra', label: 'A Obra', icon: Building2 },
    { path: '/config', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe z-50">
      <ul className="flex justify-around py-2 h-16 items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex flex-1 justify-center h-full">
              <Link
                to={item.path}
                className={`flex flex-col items-center gap-1 text-[10px] transition-colors w-full h-full justify-center ${isActive ? 'text-primary font-bold' : 'text-gray-400 font-medium'
                  }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary' : 'text-gray-400'} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary transition-opacity duration-500">
      <div className="text-7xl animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">✨</div>
      <h1 className="mt-8 text-2xl font-black text-white tracking-widest animate-pulse">
        O APÊ A DOIS
      </h1>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '1023758362635-c0880h639it422rftt4d0u6m3m83p401.apps.googleusercontent.com'}>
      <BrowserRouter>
        {showSplash && <SplashScreen />}
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20 font-sans">
        <main className="flex-1 w-full max-w-md mx-auto relative shadow-sm bg-gray-50 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/extrato" element={<Extrato />} />
            <Route path="/caixinha" element={<Caixinha />} />
            <Route path="/obra" element={<Obra />} />
            <Route path="/config" element={<Config />} />
          </Routes>
        </main>
        <div className="w-full max-w-md mx-auto relative">
          <BottomNavigation />
        </div>
      </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
