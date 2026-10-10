import {
  Activity,
  Home,
  Plus,
  Sparkles,
  User as UserIcon,
  Users,
} from 'lucide-react';
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

interface BottomTabsProps {
  onOpenAddSheet?: () => void;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ onOpenAddSheet }) => {
  const { isManager } = useAuth();
  const { language } = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomeActive = location.pathname === '/';
  const isTrackActive = location.pathname === '/track' || location.pathname === '/history';
  const isFamilyOrMeActive = isManager
    ? location.pathname === '/family'
    : location.pathname === '/me';
  const isInsightsActive = location.pathname === '/insights' || location.pathname === '/settings';

  const handleAddClick = () => {
    if (onOpenAddSheet) {
      onOpenAddSheet();
    } else {
      navigate('/add-reading');
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1B2C]/95 backdrop-blur-md border-t border-black/8 dark:border-white/10 shadow-[0_-6px_24px_rgba(14,27,44,0.08)] pb-safe"
      aria-label="Primary mobile navigation"
    >
      <div className="w-full max-w-lg mx-auto h-[74px] sm:h-[76px] grid grid-cols-5 items-center px-2 py-1 bg-white dark:bg-[#0E1B2C]">
        {/* Tab 1: Home */}
        <NavLink
          to="/"
          end
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer select-none ${
            isHomeActive
              ? 'text-[#FF6B4A] font-black'
              : 'text-[#7E90A5] dark:text-[#A0B2C6] hover:text-[#0E1B2C] dark:hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isHomeActive ? 'bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 text-[#FF6B4A]' : ''
            }`}
          >
            <Home className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] sm:text-xs font-heading font-bold mt-0.5 tracking-tight leading-none">
            {language === 'hi' ? 'मुख्य' : 'Home'}
          </span>
          {isHomeActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] mt-1" />}
        </NavLink>

        {/* Tab 2: Track */}
        <NavLink
          to="/track"
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer select-none ${
            isTrackActive
              ? 'text-[#FF6B4A] font-black'
              : 'text-[#7E90A5] dark:text-[#A0B2C6] hover:text-[#0E1B2C] dark:hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isTrackActive ? 'bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 text-[#FF6B4A]' : ''
            }`}
          >
            <Activity className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] sm:text-xs font-heading font-bold mt-0.5 tracking-tight leading-none">
            {language === 'hi' ? 'ट्रैक' : 'Track'}
          </span>
          {isTrackActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] mt-1" />}
        </NavLink>

        {/* BOLD CENTRE "+" ADD BUTTON */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] via-[#FF9028] to-[#FFB020] text-white flex items-center justify-center shadow-lg shadow-[#FF6B4A]/35 border-2 border-white dark:border-[#0E1B2C] active:scale-90 transition-transform cursor-pointer"
            aria-label="Add health reading"
          >
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
          </button>
          <span className="text-[10px] sm:text-xs font-heading font-black text-[#FF6B4A] mt-0.5 leading-none">
            + Add
          </span>
        </div>

        {/* Tab 4: Family (for manager) or My Health (for member) */}
        <NavLink
          to={isManager ? '/family' : '/me'}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer select-none ${
            isFamilyOrMeActive
              ? 'text-[#FF6B4A] font-black'
              : 'text-[#7E90A5] dark:text-[#A0B2C6] hover:text-[#0E1B2C] dark:hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isFamilyOrMeActive ? 'bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 text-[#FF6B4A]' : ''
            }`}
          >
            {isManager ? (
              <Users className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            ) : (
              <UserIcon className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-heading font-bold mt-0.5 tracking-tight leading-none whitespace-nowrap">
            {isManager
              ? language === 'hi'
                ? 'परिवार'
                : 'Family'
              : language === 'hi'
              ? 'मेरी सेहत'
              : 'My Health'}
          </span>
          {isFamilyOrMeActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] mt-1" />}
        </NavLink>

        {/* Tab 5: Insights */}
        <NavLink
          to="/insights"
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer select-none ${
            isInsightsActive
              ? 'text-[#FF6B4A] font-black'
              : 'text-[#7E90A5] dark:text-[#A0B2C6] hover:text-[#0E1B2C] dark:hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isInsightsActive ? 'bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 text-[#FF6B4A]' : ''
            }`}
          >
            <Sparkles className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] sm:text-xs font-heading font-bold mt-0.5 tracking-tight leading-none">
            {language === 'hi' ? 'सलाह' : 'Insights'}
          </span>
          {isInsightsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] mt-1" />}
        </NavLink>
      </div>
    </nav>
  );
};
