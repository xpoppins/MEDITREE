import {
  Globe,
  Heart,
  Info,
  KeyRound,
  LogOut,
  Sparkles,
  Type,
  UserCheck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/client';
import { FoodChecker } from '../components/FoodChecker';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { TopHeader } from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';
import { TextSize, usePreferences } from '../context/PreferencesContext';
import { Reading } from '../types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, family, isManager, logout, switchDemo } = useAuth();
  const { textSize, setTextSize, language, setLanguage } = usePreferences();

  // Weekly AI Summary state
  const [summaryLines, setSummaryLines] = useState<string[]>([]);
  const [summaryLinesHi, setSummaryLinesHi] = useState<string[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const loadAiSummary = async () => {
      setLoadingSummary(true);
      try {
        const readings = await api.getReadings({ days: 7 });
        const res = await api.getAiSummary(user?.name || 'Family Member', readings);
        setSummaryLines(res.lines);
        setSummaryLinesHi(res.linesHi);
      } finally {
        setLoadingSummary(false);
      }
    };
    loadAiSummary();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-32 transition-colors">
      <TopHeader />

      <main className="max-w-4xl lg:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-black text-[#0F5C5C]">
            {language === 'hi' ? 'सेटिंग्स व इनसाइट्स' : 'Insights & Settings'}
          </h2>
          <p className="text-base text-[#1F2933]/70 font-semibold mt-0.5">
            {language === 'hi' ? 'अक्षर का आकार, भाषा और स्वास्थ्य सारांश' : 'Text size, language, and weekly summary'}
          </p>
        </div>

        {/* 1. WEEKLY SUMMARY CARD (3 short plain-language lines) */}
        <div className="card-soft p-5 md:p-6 bg-white border-2 border-[#0F5C5C]/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F3F3] text-[#0F5C5C] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#FF7A59]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#1F2933]">
                {language === 'hi' ? 'साप्ताहिक स्वास्थ्य सारांश' : 'Weekly Summary'}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F5C5C]">
                {user?.name} • 7 Days
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {loadingSummary ? (
              <p className="text-base font-bold text-[#0F5C5C]">Loading summary...</p>
            ) : (
              (language === 'hi' ? summaryLinesHi : summaryLines).map((line, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFFDF9] border border-black/8">
                  <span className="w-7 h-7 rounded-xl bg-[#0F5C5C] text-white flex items-center justify-center text-sm font-black shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-base font-bold text-[#1F2933] leading-snug">
                    {line}
                  </p>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-[#1F2933]/60 mt-4 text-center italic">
            {language === 'hi'
              ? 'केवल रिकॉर्ड रखने के लिए। यह डॉक्टरी सलाह नहीं है।'
              : 'For tracking only. Not medical advice. Always consult your doctor.'}
          </p>
        </div>

        {/* 2. "CHECK A FOOD" SEARCH BOX (Traffic-Light Card) */}
        <FoodChecker />

        {/* 3. ACCESSIBILITY TOGGLES (A / A+ / A++ and Hindi / English) */}
        <div className="card-soft p-5 bg-white space-y-5">
          <h3 className="text-xl font-black text-[#1F2933]">
            {language === 'hi' ? 'दृश्य एवं भाषा सुविधाएं' : 'Accessibility & Language'}
          </h3>

          {/* Text Size Toggle: A / A+ / A++ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-5 h-5 text-[#0F5C5C]" />
              <label className="text-base font-black text-[#1F2933]">
                {language === 'hi' ? 'अक्षर का आकार (Text Size)' : 'Text Size (A / A+ / A++)'}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'A', label: 'A (Normal)' },
                  { id: 'A+', label: 'A+ (Large)' },
                  { id: 'A++', label: 'A++ (Huge)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTextSize(item.id as TextSize)}
                  className={`min-h-[58px] rounded-2xl font-black text-center transition-all cursor-pointer ${
                    textSize === item.id
                      ? 'bg-[#0F5C5C] text-white shadow-sm ring-4 ring-[#0F5C5C]/15'
                      : 'bg-[#F2F6F6] text-[#0F5C5C] hover:bg-[#E7F3F3]'
                  }`}
                >
                  <span className="text-xl">{item.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle: English / Hindi */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-[#0F5C5C]" />
              <label className="text-base font-black text-[#1F2933]">
                {language === 'hi' ? 'भाषा चुनें (Language)' : 'Language (English / Hindi)'}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`min-h-[56px] rounded-2xl font-black text-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#0F5C5C] text-white shadow-sm ring-4 ring-[#0F5C5C]/15'
                    : 'bg-[#F2F6F6] text-[#0F5C5C] hover:bg-[#E7F3F3]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`min-h-[56px] rounded-2xl font-black text-lg transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#0F5C5C] text-white shadow-sm ring-4 ring-[#0F5C5C]/15'
                    : 'bg-[#F2F6F6] text-[#0F5C5C] hover:bg-[#E7F3F3]'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>
        </div>

        {/* 4. PWA INSTALL BUTTON */}
        <div className="card-soft p-5 bg-white">
          <h3 className="text-lg font-black text-[#1F2933] mb-1">
            {language === 'hi' ? 'फ़ोन पर ऐप की तरह चलाएं' : 'Install on Phone (PWA)'}
          </h3>
          <p className="text-sm font-semibold text-[#1F2933]/70 mb-3">
            {language === 'hi'
              ? 'इंटरनेट धीमा होने पर भी तेज़ खुलता है और स्क्रीन पर ऐप आइकन आ जाता है।'
              : 'Add to home screen for instant elder-friendly 1-tap access.'}
          </p>
          <PWAInstallButton />
        </div>

        {/* 5. INVITE CODE (Manager View) */}
        {isManager && family?.inviteCode && (
          <div className="p-4 rounded-2xl bg-[#E7F3F3] border border-[#0F5C5C]/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#0F5C5C]">
                {language === 'hi' ? 'परिवार इनवाइट कोड' : 'Family Invite Code'}
              </p>
              <p className="text-2xl font-black text-[#0F5C5C] tracking-wider">
                {family.inviteCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/family')}
              className="px-4 py-2 rounded-xl bg-white border border-[#0F5C5C]/30 text-[#0F5C5C] font-bold text-sm cursor-pointer"
            >
              Share Code
            </button>
          </div>
        )}

        {/* 6. SWITCH DEMO ROLE */}
        <div className="p-4 rounded-2xl bg-white border border-[#0F5C5C]/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#1F2933]/60">Role Test</p>
            <p className="text-base font-bold text-[#1F2933]">
              Active as: <span className="text-[#0F5C5C] font-black">{user?.name} ({user?.role})</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchDemo(isManager ? 'member' : 'manager')}
            className="px-4 py-2 rounded-xl bg-[#0F5C5C] text-white font-bold text-sm cursor-pointer"
          >
            {isManager ? 'Switch to Papa' : 'Switch to Manager'}
          </button>
        </div>

        {/* 7. LOG OUT */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[60px] rounded-[22px] bg-[#FFF2F0] hover:bg-[#FEEEEE] border-2 border-[#D64545]/30 text-[#D64545] font-black text-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <LogOut className="w-5 h-5" />
            <span>{language === 'hi' ? 'लॉग आउट करें' : 'Log Out'}</span>
          </button>
        </div>
      </main>
    </div>
  );
};
