import React from 'react';
import { 
  Bot, 
  Search, 
  LogOut,
  Languages
} from 'lucide-react';
import type { Incident, UserProfile, UserRole } from '../types';
// import { MOCK_USERS } from '../data/mockUsers';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  incidents: Incident[];
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser,
  onSearchChange,
  onTabChange,
  onLogout
}) => {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'EMPLOYEE': return 'User';
      case 'TECHNICIAN': return 'Support Agent';
      case 'IT_MANAGER': return 'Manager';
      case 'ADMINISTRATOR': return 'Admin';
    }
  };

  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('incidents')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-glow-cyan">
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#080b11] rounded-full" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
              {t('appTitle')}
            </h1>
            <span className="text-[10px] text-slate-400 font-medium block -mt-1">Quick & Easy Support Desk</span>
          </div>
        </div>

        {/* Right: Quick Search, Language Switcher, Auth & User Info */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search */}
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder={t('searchPlaceholder')}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full glass-input text-xs pl-9 pr-3 py-1.5 rounded-lg border-slate-700/80 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Language Toggle Button (English ↔ Arabic) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shrink-0 font-mono shadow-glow-purple"
            title={language === 'en' ? 'Switch to Arabic (العربية)' : 'Switch to English'}
          >
            <Languages className="w-4 h-4 text-purple-400" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Log Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shrink-0 font-mono"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
              {currentUser.avatar}
            </div>

            <div className="flex flex-col text-left">
              <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
              <span className="text-[10px] text-slate-400 font-mono">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
