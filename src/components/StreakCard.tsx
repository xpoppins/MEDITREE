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
    <div className="card-wellness p-5 bg-gradient-to-br from-[#FFF8EE] to-[#FFF0E2] border border-[#FFB020]/25">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FFB020] text-white flex items-center justify-center shadow-md shadow-[#FF6B4A]/25 shrink-0">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <div>
            <h4 className="text-xl font-black text-[#0E1B2C] font-heading">
              {streakDays} {language === 'hi' ? 'दिनों का स्वास्थ्य सिलसिला' : 'Days in a Row!'}
            </h4>
            <p className="text-xs font-bold text-[#8A5800]">
              {language === 'hi'
                ? 'लगातार 5 दिनों से सेहत का ख्याल रख रहे हैं'
                : 'Consistent daily tracking helps you & your doctor'}
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-white text-[#FF6B4A] border border-[#FF6B4A]/20 text-xs font-black shrink-0 flex items-center gap-1 shadow-2xs">
          <Award className="w-4 h-4" />
          <span>Active</span>
        </div>
      </div>

      {/* Week day circles */}
      <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-[#FFB020]/20">
        {days.map((d, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                d.active
                  ? 'bg-[#FF6B4A] text-white shadow-xs'
                  : 'bg-white/80 border border-black/10 text-[#7E90A5]'
              }`}
            >
              {d.active ? '✓' : d.label}
            </div>
            <span className="text-[10px] font-bold text-[#7E90A5]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
