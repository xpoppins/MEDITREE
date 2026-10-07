import {
  Activity,
  Bell,
  Globe,
  Heart,
  Home,
  LogOut,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Type,
  User as UserIcon,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { getPaymentStatus } from '../services/payments';
import { FamilyAlert } from '../types';
import { EmergencyButton } from './EmergencyButton';

export const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isManager, switchDemo, logout } = useAuth();
  const { textSize, setTextSize, language, setLanguage } = usePreferences();
  const [alerts, setAlerts] = useState<FamilyAlert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('fht_theme') === 'dark'
      );
    }
    return false;
  });

  useEffect(() => {
    api.getAlerts().then(setAlerts);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
    getPaymentStatus().then((s) => setIsPremium(s.isPremium)).catch(() => {});
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const cycleTextSize = () => {
    if (textSize === 'A') setTextSize('A+');
    else if (textSize === 'A+') setTextSize('A++');
    else setTextSize('A');
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fht_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fht_theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFF9F0]/95 dark:bg-[#08101A]/95 backdrop-blur-md border-b border-black/8 dark:border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0"
        >
          <img
            src="/logo.svg"
            alt="MEDITREE"
            className="w-40 h-60 sm:w-25 sm:h-14 rounded-2xl shadow-xs"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black font-heading text-[#0E1B2C] dark:text-white leading-none tracking-tight">
                MEDITREE
              </span>
              {isPremium && (
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#FF6B4A] bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              )}
            </div>
            {user && (
              <p className="text-[10px] sm:text-[11px] font-bold text-[#7E90A5] truncate max-w-[110px] sm:max-w-[140px] mt-0.5">
                {user.name.split(' ')[0]} ({isManager ? 'Manager' : 'Member'})
              </p>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on md and larger screens) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 font-heading font-bold text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] font-black'
                  : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white'
              }`
            }
          >
            {language === 'hi' ? 'मुख्य' : 'Home'}
          </NavLink>
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] font-black'
                  : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white'
              }`
            }
          >
            {language === 'hi' ? 'ट्रैक' : 'Track & History'}
          </NavLink>
          <NavLink
            to={isManager ? '/family' : '/me'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] font-black'
                  : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white'
              }`
            }
          >
            {isManager
              ? language === 'hi'
                ? 'परिवार'
                : 'Family'
              : language === 'hi'
              ? 'मेरी सेहत'
              : 'My Health'}
          </NavLink>
          <NavLink
            to="/insights"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] font-black'
                  : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white'
              }`
            }
          >
            {language === 'hi' ? 'सलाह' : 'Insights'}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] font-black'
                  : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white'
              }`
            }
          >
            {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
          </NavLink>

          {/* Desktop Direct + Add Reading Button */}
          <button
            type="button"
            onClick={() => navigate('/add-reading')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white font-black text-xs shadow-xs hover:opacity-95 active:scale-95 cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            <span>{language === 'hi' ? '+ नया माप' : '+ Add Reading'}</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Emergency SOS Button */}
          <EmergencyButton />

          {/* Alerts Bell (for manager or when alerts exist) */}
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAlertModal(true)}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#E5484D] cursor-pointer shrink-0"
              title="View Family Health Alerts"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5484D] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {alerts.length}
              </span>
            </button>
          )}

          {/* Quick Demo Switcher */}
          {user && (
            <button
              type="button"
              onClick={() => switchDemo(isManager ? 'member' : 'manager')}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] border border-[#12B5A6]/30 text-[10px] sm:text-xs font-black flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition-transform"
              title={`Currently ${user.name} (${isManager ? 'Manager' : 'Member'}). Tap to switch role.`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{user.name.split(' ')[0]}</span>
            </button>
          )}

          {/* Text Size Cycle */}
          <button
            type="button"
            onClick={cycleTextSize}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-[#0E1B2C] dark:text-white flex items-center justify-center font-heading font-black text-[11px] sm:text-xs cursor-pointer shrink-0 active:scale-95"
            title={`Text size: ${textSize}. Tap to enlarge.`}
          >
            {textSize}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-[#0E1B2C] dark:text-white flex items-center justify-center font-heading font-black text-[11px] sm:text-xs cursor-pointer shrink-0 active:scale-95"
            title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
          >
            {language === 'en' ? 'हिं' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-[#0E1B2C] dark:text-white flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-[#FFB020]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#7E90A5]" />
            )}
          </button>

          {/* Sign Out / Exit Button */}
          {user && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/welcome');
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-[#7E90A5] hover:text-[#E5484D] dark:hover:text-[#FF8080] flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-colors"
              title="Sign Out / Change Family"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alerts Sheet */}
      {showAlertModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card-wellness p-6 bg-white dark:bg-[#111C2B] max-w-sm w-full border border-black/10 dark:border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mb-1">
              Family Health Alerts
            </h3>
            <p className="text-xs text-[#7E90A5] mb-4">
              Real-time alerts triggered by red or amber readings.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-2xl bg-[#FEECEE] dark:bg-[#E5484D]/15 border border-[#E5484D]/30 text-xs"
                >
                  <p className="font-black text-[#B0282C] dark:text-[#FF8080]">{al.message}</p>
                  <p className="text-[10px] text-[#7E90A5] mt-1">
                    {new Date(al.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAlertModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] font-bold text-sm cursor-pointer"
            >
              Close Alerts
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
