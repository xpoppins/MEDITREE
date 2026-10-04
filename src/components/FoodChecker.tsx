import { AlertOctagon, AlertTriangle, CheckCircle2, Search, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as api from '../api/client';
import { usePreferences } from '../context/PreferencesContext';
import { FoodItem, HealthStatus } from '../types';

export const FoodChecker: React.FC = () => {
  const { language } = usePreferences();
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const res = await api.searchFood(query);
        if (active) setFoods(res);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFoods();
    return () => {
      active = false;
    };
  }, [query]);

  const getTrafficIcon = (status: HealthStatus) => {
    const s = status === 'amber' ? 'yellow' : status;
    switch (s) {
      case 'green':
        return <CheckCircle2 className="w-6 h-6 text-[#1E8E4E] shrink-0" strokeWidth={2.5} />;
      case 'yellow':
        return <AlertTriangle className="w-6 h-6 text-[#C58500] shrink-0" strokeWidth={2.5} />;
      case 'red':
        return <AlertOctagon className="w-6 h-6 text-[#D64545] shrink-0" strokeWidth={2.5} />;
      default:
        return <CheckCircle2 className="w-6 h-6 text-[#1E8E4E] shrink-0" strokeWidth={2.5} />;
    }
  };

  const getTrafficBadge = (status: HealthStatus) => {
    const s = status === 'amber' ? 'yellow' : status;
    switch (s) {
      case 'green':
        return {
          bg: 'bg-[#E8F7EE] border-[#1E8E4E]',
          text: 'text-[#146636]',
          label: language === 'hi' ? 'अच्छा (Safe)' : 'Safe / Good',
        };
      case 'yellow':
        return {
          bg: 'bg-[#FEF8E7] border-[#E0A100]',
          text: 'text-[#8A5800]',
          label: language === 'hi' ? 'कम मात्रा (Moderate)' : 'Moderate portion',
        };
      case 'red':
        return {
          bg: 'bg-[#FEEEEE] border-[#D64545]',
          text: 'text-[#962525]',
          label: language === 'hi' ? 'परहेज करें (Limit / Avoid)' : 'Limit / Avoid',
        };
      default:
        return {
          bg: 'bg-[#E8F7EE] border-[#1E8E4E]',
          text: 'text-[#146636]',
          label: language === 'hi' ? 'अच्छा (Safe)' : 'Safe / Good',
        };
    }
  };

  return (
    <div className="card-soft p-5 md:p-6 bg-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E7F3F3] text-[#0F5C5C] flex items-center justify-center">
          <Utensils className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-black text-[#1F2933]">
            {language === 'hi' ? 'खाने की जांच (Traffic-Light Guide)' : 'Check a Food'}
          </h3>
          <p className="text-sm font-medium text-[#1F2933]/70">
            {language === 'hi'
              ? 'देखें क्या खाना BP और शुगर के लिए अनुकूल है'
              : 'Elder-friendly guidance for BP & Sugar'}
          </p>
        </div>
      </div>

      {/* Large accessible search input */}
      <div className="relative my-4">
        <label htmlFor="food-search" className="sr-only">
          Search food
        </label>
        <input
          id="food-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'खोजें: पराठा, खीर, करेला, चाय...'
              : 'Search: Paratha, Karela, Rice, Fruit, Chai...'
          }
          className="w-full min-h-[58px] rounded-[20px] bg-[#F7F9FA] border-2 border-[#0F5C5C]/20 pl-12 pr-4 text-lg font-bold text-[#1F2933] placeholder:text-[#1F2933]/50 focus:border-[#0F5C5C] focus:bg-white"
        />
        <Search className="w-6 h-6 text-[#0F5C5C] absolute left-4 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#0F5C5C] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3.5 mt-4">
        {loading ? (
          <div className="p-4 text-center text-sm font-bold text-[#0F5C5C]">
            Checking food info...
          </div>
        ) : foods.length === 0 ? (
          <div className="p-4 text-center text-base font-bold text-[#1F2933]/60 bg-[#F7F9FA] rounded-2xl">
            {language === 'hi'
              ? 'कोई भोजन नहीं मिला। कृपया दूसरा नाम लिखकर देखें।'
              : 'No matching foods found. Try searching simple words like Dal, Rice, Tea.'}
          </div>
        ) : (
          foods.map((food) => {
            const badge = getTrafficBadge(food.status);
            return (
              <div
                key={food.id}
                className="p-4 rounded-[20px] border border-black/10 bg-[#FFFDF9] hover:border-[#0F5C5C]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getTrafficIcon(food.status)}
                    <h4 className="text-xl font-black text-[#1F2933]">
                      {language === 'hi' && food.nameHi ? food.nameHi : food.name}
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="text-base font-extrabold text-[#0F5C5C] mt-2">
                  👉 {language === 'hi' ? food.portionAdviceHi : food.portionAdvice}
                </p>

                <p className="text-sm font-medium text-[#1F2933]/80 mt-1">
                  {language === 'hi' ? food.noteHi : food.note}
                </p>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-[#1F2933]/60 mt-4 text-center italic">
        {language === 'hi'
          ? 'केवल रिकॉर्ड और जानकारी के लिए। यह डॉक्टरी सलाह नहीं है।'
          : 'For tracking only. Not medical advice. Always check with your doctor.'}
      </p>
    </div>
  );
};
