import { Award, Flame, Sparkles } from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';

interface StreakCardProps {
  streakDays?: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streakDays = 5 }) => {
  const { language } = usePreferences();

  const days = [
    { label: 'M', active: true },
    { label: 'T', active: true },
    { label: 'W', active: true },
    { label: 'T', active: true },
    { label: 'F', active: true },
    { label: 'S', active: false },
    { label: 'S', active: false },
  ];

  return (
    <div className="card-wellness p-5 bg-gradient-to-br from-[#FFF8EE] to-[#FFF0E2] dark:from-[#241A0E] dark:to-[#1C140A] border border-[#FFB020]/25 dark:border-[#FFB020]/35 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FFB020] text-white flex items-center justify-center shadow-md shadow-[#FF6B4A]/25 shrink-0">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <div>
            <h4 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading">
              {streakDays} {language === 'hi' ? 'दिनों का स्वास्थ्य सिलसिला' : 'Days in a Row!'}
            </h4>
            <p className="text-xs font-bold text-[#8A5800] dark:text-[#FFB020]">
              {language === 'hi'
                ? 'लगातार 5 दिनों से सेहत का ख्याल रख रहे हैं'
                : 'Consistent daily tracking helps you & your doctor'}
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2A1D0E] text-[#FF6B4A] dark:text-[#FF8A6A] border border-[#FF6B4A]/20 dark:border-[#FF6B4A]/35 text-xs font-black shrink-0 flex items-center gap-1 shadow-2xs">
          <Award className="w-4 h-4" />
          <span>Active</span>
        </div>
      </div>

      {/* Week day circles */}
      <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-[#FFB020]/20 dark:border-[#FFB020]/30">
        {days.map((d, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                d.active
                  ? 'bg-[#FF6B4A] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[#7E90A5] dark:text-[#A0B2C6]'
              }`}
            >
              {d.active ? '✓' : d.label}
            </div>
            <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
