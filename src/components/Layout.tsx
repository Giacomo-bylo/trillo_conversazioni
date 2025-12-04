import React from 'react';
import { LayoutDashboard, Phone, PhoneMissed, PhoneForwarded, History, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: React.ElementType, label: string, path: string, active: boolean }) => (
  <Link
    to={path}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active 
        ? "bg-gray-100 text-gray-900" 
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
    )}
  >
    <Icon size={18} className={active ? "text-primary" : "text-gray-400"} />
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              T
            </div>
            Trillo
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Analytics
          </div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} />
          <SidebarItem icon={Phone} label="Chiamate" path="/calls" active={location.pathname === '/calls'} />
          <SidebarItem icon={PhoneMissed} label="Mancate" path="/missed-calls" active={location.pathname === '/missed-calls'} />
          <SidebarItem icon={PhoneForwarded} label="Callback" path="/callbacks" active={location.pathname === '/callbacks'} />
          
          <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Storico
          </div>
          <SidebarItem icon={History} label="Versioni Prompt" path="/history" active={location.pathname === '/history'} />
        </div>

        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="px-3 py-2 mb-2">
              <div className="text-xs text-gray-400">Connesso come</div>
              <div className="text-sm font-medium text-gray-700 truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut size={18} />
            Esci
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  );
};