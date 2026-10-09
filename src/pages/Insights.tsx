import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  Download,
  FileText,
  Heart,
  Pill,
  Printer,
  Search,
  Share2,
  Sparkles,
  Utensils,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FoodChecker } from '../components/FoodChecker';
import { MedicinesSchedule } from '../components/MedicinesSchedule';
import { ShareDoctorReport } from '../components/ShareDoctorReport';
import { TopHeader } from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { Member, Medicine, Reading } from '../types';

export const Insights: React.FC = () => {
  const { user, members } = useAuth();
  const { language } = usePreferences();

  const currentMember = members.find((m) => m.id === user?.memberId) || members[0];
  const [readings, setReadings] = useState<Reading[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [summaryLines, setSummaryLines] = useState<string[]>([]);
  const [summaryLinesHi, setSummaryLinesHi] = useState<string[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showDoctorReport, setShowDoctorReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSummary(true);
      try {
        const [r, m] = await Promise.all([
          api.getReadings({ memberId: currentMember?.id, days: 7 }),
          api.getMedicines(currentMember?.id),
        ]);
        setReadings(r);
        setMedicines(m);

        const ai = await api.getWeeklySummary(currentMember?.name || 'Member', r);
        setSummaryLines(ai.lines);
        setSummaryLinesHi(ai.linesHi);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchData();
  }, [currentMember]);

  const refreshMedicines = async () => {
    const m = await api.getMedicines(currentMember?.id);
    setMedicines(m);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-32 transition-colors">
      <TopHeader />

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        <div>
          <h2 className="text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
            {language === 'hi' ? 'स्वास्थ्य इनसाइट्स' : 'Wellness Insights'}
          </h2>
          <p className="text-xs font-bold text-[#7E90A5] mt-0.5">
            AI Weekly Summary • Indian Food Guide • Clinical Share
          </p>
        </div>

        {/* 1. WEEKLY SUMMARY CARD (3 simple sentences, with no diagnosis & doctor disclaimer) */}
        <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-[#FF6B4A]/20 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FFB020] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0E1B2C] dark:text-white font-heading">
                  {language === 'hi' ? 'साप्ताहिक स्वास्थ्य विश्लेषण' : 'Weekly AI Health Summary'}
                </h3>
                <p className="text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
                  7-Day Trend Analysis • {currentMember?.name}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] text-[10px] font-black uppercase">
              7 Days
            </span>
          </div>

          <div className="space-y-2.5 mt-3">
            {loadingSummary ? (
              <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6] py-2">
                Analyzing readings and generating gentle guidance...
              </p>
            ) : (
              (language === 'hi' ? summaryLinesHi : summaryLines).map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/6 dark:border-white/10 text-xs md:text-sm font-bold text-[#0E1B2C] dark:text-white"
                >
                  <span className="w-5 h-5 rounded-lg bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-snug">{line}</p>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-[#7E90A5] dark:text-[#A0B2C6] mt-3 italic text-center">
            * For tracking and awareness only. Not medical advice. Always consult your doctor.
          </p>
        </div>

        {/* 2. SHARE WITH DOCTOR ONE-PAGE REPORT BANNER */}
        <div className="card-hero p-5 flex items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#12B5A6]">
              Clinical PDF & Share
            </span>
            <h4 className="text-xl font-black text-white font-heading mt-0.5">
              Doctor Visit Report
            </h4>
            <p className="text-xs text-white/80 mt-1 max-w-xs">
              Generate a clean, printable 1-page report with 30-day vitals, BMI, and prescriptions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDoctorReport(true)}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white text-xs font-black shrink-0 shadow-md active:scale-95 cursor-pointer"
          >
            Open Report
          </button>
        </div>

        {/* 3. CHECK A FOOD SEARCH (Indian Staples Traffic Light) */}
        <FoodChecker />

        {/* 4. MEDICINE SCHEDULE */}
        <MedicinesSchedule
          medicines={medicines}
          onRefresh={refreshMedicines}
          memberId={currentMember?.id}
        />
      </main>

      {/* Doctor Report Modal */}
      {showDoctorReport && (
        <ShareDoctorReport
          member={currentMember}
          readings={readings}
          medicines={medicines}
          onClose={() => setShowDoctorReport(false)}
        />
      )}
    </div>
  );
};
