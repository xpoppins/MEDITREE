import { History as HistoryIcon, Home as HomeIcon, Settings, User as UserIcon, Users } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const BottomNav: React.FC = () => {
  const { isManager } = useAuth();
  const { language, t } = usePreferences();

  const navItems = [
    {
      to: '/',
      label: t('home'),
      icon: <HomeIcon className="w-7 h-7" strokeWidth={2.5} />,
    },
    {
      to: '/history',
      label: t('history'),
      icon: <HistoryIcon className="w-7 h-7" strokeWidth={2.5} />,
    },
    isManager
      ? {
          to: '/family',
          label: t('family'),
          icon: <Users className="w-7 h-7" strokeWidth={2.5} />,
        }
      : {
          to: '/me',
          label: language === 'hi' ? 'मेरा प्रोफ़ाइल' : 'My Health',
          icon: <UserIcon className="w-7 h-7" strokeWidth={2.5} />,
        },
    {
      to: '/settings',
      label: t('settings'),
      icon: <Settings className="w-7 h-7" strokeWidth={2.5} />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t-2 border-[#0F5C5C]/15 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Bottom primary navigation"
    >
      <div className="max-w-md md:max-w-lg mx-auto h-[74px] grid grid-cols-4 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full transition-colors active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-[#0F5C5C] font-black'
                  : 'text-[#1F2933]/60 hover:text-[#1F2933] font-bold'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#E7F3F3] text-[#0F5C5C]' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-xs md:text-sm mt-0.5 tracking-tight truncate max-w-[80px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F5C5C] mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
