import { Check, Droplets, Flame, Footprints, Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';

export const TodayChecklist: React.FC = () => {
  const { language } = usePreferences();
  const [items, setItems] = useState<api.ChecklistItem[]>([]);

  useEffect(() => {
    setItems(api.getTodayChecklist());
  }, []);

  const handleToggle = (id: string) => {
    const updated = api.toggleChecklistItem(id);
    setItems(updated);
  };

  const completedCount = items.filter((i) => i.completed).length;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'sugar':
        return <Flame className="w-4 h-4 text-[#12B5A6]" />;
      case 'bp':
        return <Heart className="w-4 h-4 text-[#FF6B4A]" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-[#3B82F6]" />;
      case 'walk':
      default:
        return <Footprints className="w-4 h-4 text-[#10B981]" />;
    }
  };

  return (
    <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-[#0E1B2C] dark:text-black font-heading">
            {language === 'hi' ? 'दैनिक स्वास्थ्य चेकलिस्ट' : "Daily Wellness Routine"}
          </h3>
          <p className="text-xs font-bold text-[#7E90A5]">
            {completedCount} of {items.length} {language === 'hi' ? 'कार्य पूरे हुए' : 'completed'}
          </p>
        </div>

        {/* Progress pill */}
        <div className="px-3 py-1 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] text-xs font-black">
          {Math.round((completedCount / (items.length || 1)) * 100)}%
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
              item.completed
                ? 'bg-[#F4FDF9] dark:bg-[#0E2820] border-[#1FA971]/30 text-[#147A50] dark:text-[#34D399]'
                : 'bg-[#F9FBFC] dark:bg-[#142234] border-black/8 dark:border-white/10 hover:border-[#12B5A6]/40 text-[#0E1B2C] dark:text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-xl bg-white dark:bg-[#1A2E44] border border-black/5 dark:border-white/10 shrink-0 shadow-2xs">
                {getCategoryIcon(item.category)}
              </div>
              <span
                className={`text-sm font-bold leading-tight truncate ${
                  item.completed ? 'line-through opacity-70 text-[#147A50] dark:text-[#34D399]' : ''
                }`}
              >
                {language === 'hi' ? item.textHi || item.titleHi : item.text || item.title}
              </span>
            </div>

            <div
              className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                item.completed
                  ? 'bg-[#1FA971] text-white shadow-xs'
                  : 'border-2 border-black/20 dark:border-white/30 bg-white dark:bg-[#1A2E44]'
              }`}
            >
              {item.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
