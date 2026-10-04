import {
  Calendar,
  ChevronRight,
  FileText,
  Flame,
  Pill,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddMedicineModal } from '../components/AddMedicineModal';
import { AddSheet } from '../components/AddSheet';
import { ExportPrescriptionModal } from '../components/ExportPrescriptionModal';
import { FamilyStrip } from '../components/FamilyStrip';
import { HomeVitalsGraph } from '../components/HomeVitalsGraph';
import { MedicineSearchDirectory } from '../components/MedicineSearchDirectory';
import { MedicinesSchedule } from '../components/MedicinesSchedule';
import { OnboardingModal } from '../components/OnboardingModal';
import { ScoreRing } from '../components/ScoreRing';
import { ShareDoctorReport } from '../components/ShareDoctorReport';
import { StreakCard } from '../components/StreakCard';
import { TodayChecklist } from '../components/TodayChecklist';
import { TopHeader } from '../components/TopHeader';
import { VitalCard } from '../components/VitalCard';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { HealthScoreDetails, HealthStatus, Member, Medicine, Reading } from '../types';
import { bmiInfo, calculateHealthScore } from '../utils/healthRules';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isManager, members, family } = useAuth();
  const { language } = usePreferences();

  // Active member for dashboard (defaults to logged-in user's member, or first member)
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return user?.memberId || members[0]?.id || 'm2';
  });

  const [readings, setReadings] = useState<Reading[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [showDoctorReport, setShowDoctorReport] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Medicine & Prescription Modals
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [medModalMemberId, setMedModalMemberId] = useState<string>(activeMemberId);
  const [showExportRxModal, setShowExportRxModal] = useState(false);
  const [rxModalMemberId, setRxModalMemberId] = useState<string>(activeMemberId);

  // Check if first onboarding should show
  useEffect(() => {
    if (user && !user.onboardingCompleted && !localStorage.getItem('hn_onboarding_shown')) {
      setShowOnboarding(true);
      localStorage.setItem('hn_onboarding_shown', 'true');
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReadings, allMeds] = await Promise.all([
        api.getReadings({ memberId: activeMemberId }),
        api.getMedicines(activeMemberId),
      ]);
      setReadings(allReadings);
      setMedicines(allMeds);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeMemberId]);

  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];

  // Latest readings by type
  const latestBp = readings.find((r) => r.type === 'bp');
  const latestSugar = readings.find((r) => r.type === 'sugar');
  const latestWeight = readings.find((r) => r.type === 'weight');
  const latestPulse = readings.find((r) => r.type === 'pulse' || r.pulse);

  // BMI calculated
  const bmiData = bmiInfo(latestWeight?.weightKg || 73.5, currentMember?.heightCm || 168);

  // Health Score (0-100)
  const scoreDetails: HealthScoreDetails = calculateHealthScore(readings, 5);

  // Map member status dots for FamilyStrip dynamically
  const memberStatuses: Record<string, HealthStatus> = {};
  members.forEach((m) => {
    const memberReading = readings.find((r) => r.memberId === m.id);
    memberStatuses[m.id] = memberReading ? memberReading.status : 'green';
  });

  // Friendly time ago
  const formatTimeAgo = (iso?: string) => {
    if (!iso) return 'No readings yet';
    const diffHours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const days = Math.floor(diffHours / 24);
    return `${days} days ago`;
  };

  // Sparklines
  const bpSparkline = readings
    .filter((r) => r.type === 'bp' && r.systolic)
    .slice(0, 7)
    .map((r) => r.systolic!)
    .reverse();

  const sugarSparkline = readings
    .filter((r) => r.type === 'sugar' && r.sugar)
    .slice(0, 7)
    .map((r) => r.sugar!)
    .reverse();

  const getGreeting = () => {
    const h = new Date().getHours();
    const name = currentMember?.name ? currentMember.name.split(' ')[0] : 'there';
    if (language === 'hi') {
      if (h < 12) return `सुप्रभात, ${name}`;
      if (h < 17) return `नमस्ते, ${name}`;
      return `शुभ संध्या, ${name}`;
    }
    if (h < 12) return `Good morning, ${name}`;
    if (h < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const handleReadingSaved = (newReading: Reading, memberName: string) => {
    setIsAddSheetOpen(false);
    loadData();
    navigate('/result', { state: { reading: newReading, memberName } });
  };

  const handleOpenAddMedForMember = (memberId?: string) => {
    setMedModalMemberId(memberId || activeMemberId);
    setShowAddMedModal(true);
  };

  const handleOpenExportRxForMember = (memberId?: string) => {
    setRxModalMemberId(memberId || activeMemberId);
    setShowExportRxModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-32 transition-colors">
      <TopHeader />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        {/* Date Strip & Greeting with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FF6B4A]">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0E1B2C] dark:text-white font-heading tracking-tight mt-0.5">
              {getGreeting()}
            </h2>
          </div>

          {/* Quick Action Toolbar: Add Med, Export Rx & Doctor Report */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenAddMedForMember(activeMemberId)}
              className="py-2 px-3 rounded-2xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] text-xs font-black flex items-center gap-1.5 shadow-2xs hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
              title={`Add medicine for ${currentMember?.name}`}
            >
              <Pill className="w-3.5 h-3.5 text-[#12B5A6]" />
              <span>+ Add Medicine</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenExportRxForMember(activeMemberId)}
              className="py-2 px-3 rounded-2xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 border border-[#12B5A6]/30 text-[#12B5A6] text-xs font-black flex items-center gap-1.5 hover:bg-[#D4F4F1] cursor-pointer shrink-0"
              title={`Export prescription for ${currentMember?.name}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Rx</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDoctorReport(true)}
              className="py-2 px-3 rounded-2xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-xs font-black text-[#0E1B2C] dark:text-white flex items-center gap-1.5 shadow-2xs hover:border-[#12B5A6] cursor-pointer shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Doctor Report</span>
            </button>
          </div>
        </div>

        {/* FAMILY STRIP (With Per-Member Add Med & Export Rx) */}
        {isManager && (
          <FamilyStrip
            members={members}
            memberStatuses={memberStatuses}
            selectedMemberId={activeMemberId}
            onSelectMember={(id) => setActiveMemberId(id)}
            onAddMember={() => navigate('/family?action=add')}
            onAddMedicine={handleOpenAddMedForMember}
            onExportPrescription={handleOpenExportRxForMember}
          />
        )}

        {/* 2-COLUMN RESPONSIVE GRID ON TABLET / DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (lg:col-span-7): Health Score Ring & Vital Cards & Add Button */}
          <div className="lg:col-span-7 space-y-5">
            {/* LARGE HEALTH SCORE RING (0-100) */}
            <ScoreRing scoreDetails={scoreDetails} />

            {/* VITAL CARDS IN 2-COLUMN GRID (BP, Sugar, Weight, BMI, Pulse) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h3 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading">
                  {language === 'hi' ? 'दैनिक स्वास्थ्य मापदंड' : 'Recent Vitals'}
                </h3>
                <span className="text-xs font-bold text-[#7E90A5]">
                  {currentMember?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Blood Pressure */}
                <VitalCard
                  type="bp"
                  title="Blood Pressure"
                  titleHi="रक्तचाप"
                  value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : '120/80'}
                  unit="mmHg"
                  status={latestBp?.status || 'green'}
                  timeAgo={formatTimeAgo(latestBp?.takenAt)}
                  sparklineData={bpSparkline.length ? bpSparkline : [120, 125, 122, 128, 124, 126, 120]}
                  onClick={() => navigate('/track?tab=bp')}
                />

                {/* Blood Sugar */}
                <VitalCard
                  type="sugar"
                  title="Blood Sugar"
                  titleHi="ब्लड शुगर"
                  value={latestSugar ? `${latestSugar.sugar}` : '108'}
                  unit="mg/dL"
                  status={latestSugar?.status || 'green'}
                  timeAgo={formatTimeAgo(latestSugar?.takenAt)}
                  sparklineData={sugarSparkline.length ? sugarSparkline : [110, 115, 108, 120, 114, 110, 108]}
                  onClick={() => navigate('/track?tab=sugar')}
                />

                {/* Weight */}
                <VitalCard
                  type="weight"
                  title="Weight"
                  titleHi="वजन"
                  value={latestWeight ? `${latestWeight.weightKg}` : '72.0'}
                  unit="kg"
                  status="green"
                  timeAgo={formatTimeAgo(latestWeight?.takenAt)}
                  sparklineData={[73.2, 73.0, 72.8, 72.5, 72.4, 72.2, 72.0]}
                  onClick={() => navigate('/track?tab=weight')}
                />

                {/* Asian BMI */}
                <VitalCard
                  type="weight"
                  title="Asian BMI"
                  titleHi="बीएमआई"
                  value={bmiData ? `${bmiData.bmi}` : '26.0'}
                  unit="kg/m²"
                  status={bmiData?.status || 'amber'}
                  timeAgo="Height: 168 cm"
                  sparklineData={[26.3, 26.2, 26.1, 26.1, 26.0, 26.0, 26.0]}
                  onClick={() => navigate('/me')}
                />
              </div>
            </div>

            {/* DEDICATED RECENT VITALS TREND GRAPH */}
            <HomeVitalsGraph readings={readings} memberName={currentMember?.name} />

            {/* PROMINENT ADD READING BUTTON (64px high, elder friendly) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsAddSheetOpen(true)}
                className="w-full min-h-[64px] py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF7A59] to-[#FF9028] text-white font-black text-lg md:text-xl flex items-center justify-center gap-3 shadow-lg shadow-[#FF6B4A]/25 active:scale-98 transition-transform cursor-pointer"
              >
                <Plus className="w-7 h-7" strokeWidth={3} />
                <span>
                  {language === 'hi'
                    ? `+ ${currentMember?.name?.split(' ')[0] || 'परिवार'} के लिए नया माप दर्ज करें`
                    : `+ Add reading for ${currentMember?.name?.split(' ')[0] || 'Member'}`}
                </span>
              </button>
            </div>
          </div>

          {/* Secondary Column (lg:col-span-5): Medicines Schedule, Checklist, Streak & Tips */}
          <div className="lg:col-span-5 space-y-5">
            {/* FEATURED MEDICINE SCHEDULE CARD */}
            <MedicinesSchedule
              medicines={medicines}
              onRefresh={loadData}
              memberId={activeMemberId}
              onOpenAddMedicine={handleOpenAddMedForMember}
              onExportPrescription={handleOpenExportRxForMember}
            />

            {/* TODAY'S CHECKLIST */}
            <TodayChecklist />

            {/* STREAK CARD ("5 days in a row") */}
            <StreakCard streakDays={5} />

            {/* DAILY WELLNESS TIP CARD */}
            <div className="card-wellness p-4.5 bg-gradient-to-r from-[#E6F8F6] to-[#F0FDF4] dark:from-[#0B2529] dark:to-[#0B221A] border border-[#12B5A6]/20 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#12B5A6] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#0E1B2C] dark:text-white font-heading">
                  {language === 'hi' ? 'दैनिक स्वास्थ्य टिप' : 'Daily Doctor-Approved Tip'}
                </h4>
                <p className="text-xs md:text-sm font-semibold text-[#4A5B70] dark:text-[#A0B0C4] mt-0.5 leading-relaxed">
                  {language === 'hi'
                    ? 'बीपी नापने से 5 मिनट पहले आराम से बैठें। दोनों पैर ज़मीन पर रखें और बात न करें।'
                    : 'Rest quietly for 5 minutes before checking blood pressure. Keep both feet flat on the floor.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UNIVERSAL MEDICINE DIRECTORY & CLINICAL SEARCH HUB */}
        <MedicineSearchDirectory
          onAddMedicineToMember={(med, memId) => handleOpenAddMedForMember(memId)}
        />
      </main>

      {/* Floating Add Reading Sheet */}
      <AddSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSuccess={handleReadingSaved}
        defaultMemberId={activeMemberId}
      />

      {/* Doctor Report Modal */}
      {showDoctorReport && (
        <ShareDoctorReport
          member={currentMember}
          readings={readings}
          medicines={medicines}
          onClose={() => setShowDoctorReport(false)}
        />
      )}

      {/* Featured Add Medicine Modal with AI & Clinical Search */}
      <AddMedicineModal
        isOpen={showAddMedModal}
        onClose={() => setShowAddMedModal(false)}
        onSuccess={loadData}
        initialMemberId={medModalMemberId}
      />

      {/* Featured Export Prescription Modal */}
      <ExportPrescriptionModal
        isOpen={showExportRxModal}
        onClose={() => setShowExportRxModal(false)}
        memberId={rxModalMemberId}
        onOpenAddMedicine={handleOpenAddMedForMember}
      />

      {/* 4-Step Onboarding Modal for First Time Users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};
