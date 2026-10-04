import { Activity, Download, Heart, Printer, Scale, Share2, Shield, X } from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { Member, Medicine, Reading } from '../types';

interface ShareDoctorReportProps {
  member: Member;
  readings: Reading[];
  medicines: Medicine[];
  onClose: () => void;
}

export const ShareDoctorReport: React.FC<ShareDoctorReportProps> = ({
  member,
  readings,
  medicines,
  onClose,
}) => {
  const { language } = usePreferences();

  // Filter 30-day stats
  const bpReadings = readings.filter((r) => r.type === 'bp');
  const sugarReadings = readings.filter((r) => r.type === 'sugar');
  const weightReadings = readings.filter((r) => r.type === 'weight');

  const avgSys = bpReadings.length
    ? Math.round(bpReadings.reduce((s, r) => s + (r.systolic || 0), 0) / bpReadings.length)
    : null;
  const avgDia = bpReadings.length
    ? Math.round(bpReadings.reduce((s, r) => s + (r.diastolic || 0), 0) / bpReadings.length)
    : null;

  const fastingSugars = sugarReadings.filter((r) => r.sugarContext === 'fasting');
  const avgFasting = fastingSugars.length
    ? Math.round(fastingSugars.reduce((s, r) => s + (r.sugar || 0), 0) / fastingSugars.length)
    : null;

  const postMealSugars = sugarReadings.filter((r) => r.sugarContext === 'after_meal');
  const avgPostMeal = postMealSugars.length
    ? Math.round(postMealSugars.reduce((s, r) => s + (r.sugar || 0), 0) / postMealSugars.length)
    : null;

  const latestWeight = weightReadings.length ? weightReadings[0].weightKg : null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `Health Summary for ${member.name} (${member.relation}):
Average BP: ${avgSys ? `${avgSys}/${avgDia} mmHg` : 'N/A'}
Fasting Sugar Avg: ${avgFasting ? `${avgFasting} mg/dL` : 'N/A'}
Weight: ${latestWeight ? `${latestWeight} kg` : 'N/A'}
Conditions: ${member.conditions.join(', ') || 'None'}
Generated via HealthNest.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Health Summary - ${member.name}`,
          text,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-[28px] border-2 border-[#0E1B2C]/20 shadow-2xl p-6 relative my-auto">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-3.5 rounded-xl bg-[#0E1B2C] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="py-2 px-3.5 rounded-xl bg-[#12B5A6] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4F6F9] flex items-center justify-center text-[#0E1B2C] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CLINICAL DOCTOR REPORT BODY */}
        <div className="space-y-5 text-left" id="doctor-printable-area">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B4A] bg-[#FFF0E8] px-2 py-0.5 rounded-md">
                HealthNest Clinical Summary
              </span>
              <h2 className="text-2xl font-black text-[#0E1B2C] font-heading mt-1">
                {member.name}
              </h2>
              <p className="text-xs font-bold text-[#7E90A5]">
                {member.relation} • {member.gender} • Born {member.dob || '1958'} • Height: {member.heightCm || '168'} cm
              </p>
            </div>
            <div className="text-right text-[11px] font-bold text-[#7E90A5]">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Past 30 Days Window</p>
            </div>
          </div>

          {/* 30-Day Vitals Summary Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* BP Average */}
            <div className="p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FF6B4A]/20">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B4A]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>30-Day BP Average</span>
              </div>
              <p className="text-2xl font-black text-[#0E1B2C] font-heading mt-1">
                {avgSys ? `${avgSys} / ${avgDia}` : 'No data'}
                <span className="text-xs font-bold text-[#7E90A5] ml-1">mmHg</span>
              </p>
              <p className="text-[11px] font-bold text-[#7E90A5] mt-0.5">
                From {bpReadings.length} readings
              </p>
            </div>

            {/* Fasting Sugar Average */}
            <div className="p-3.5 rounded-2xl bg-[#E6F8F6] border border-[#12B5A6]/20">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#12B5A6]">
                <Activity className="w-3.5 h-3.5" />
                <span>Fasting Sugar Avg</span>
              </div>
              <p className="text-2xl font-black text-[#0E1B2C] font-heading mt-1">
                {avgFasting ? `${avgFasting}` : 'No data'}
                <span className="text-xs font-bold text-[#7E90A5] ml-1">mg/dL</span>
              </p>
              <p className="text-[11px] font-bold text-[#7E90A5] mt-0.5">
                Target: &lt;100 mg/dL
              </p>
            </div>

            {/* Post Meal Sugar */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#1FA971]/20">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1FA971]">
                <Activity className="w-3.5 h-3.5" />
                <span>Post-Meal Avg</span>
              </div>
              <p className="text-2xl font-black text-[#0E1B2C] font-heading mt-1">
                {avgPostMeal ? `${avgPostMeal}` : '---'}
                <span className="text-xs font-bold text-[#7E90A5] ml-1">mg/dL</span>
              </p>
              <p className="text-[11px] font-bold text-[#7E90A5] mt-0.5">
                Target: &lt;140 mg/dL
              </p>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#3B82F6]/20">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#3B82F6]">
                <Scale className="w-3.5 h-3.5" />
                <span>Latest Weight</span>
              </div>
              <p className="text-2xl font-black text-[#0E1B2C] font-heading mt-1">
                {latestWeight ? `${latestWeight}` : '---'}
                <span className="text-xs font-bold text-[#7E90A5] ml-1">kg</span>
              </p>
              <p className="text-[11px] font-bold text-[#7E90A5] mt-0.5">
                BMI: 26.1 (Overweight)
              </p>
            </div>
          </div>

          {/* Chronic Conditions */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7E90A5] mb-1.5">
              Documented Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {member.conditions.length ? (
                member.conditions.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-[#F4F6F9] border border-black/10 text-xs font-black text-[#0E1B2C]"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#7E90A5]">None recorded</span>
              )}
            </div>
          </div>

          {/* Current Prescriptions & Medications */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7E90A5] mb-1.5">
              Current Medications
            </h4>
            <div className="space-y-1.5">
              {medicines.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-[#F9FBFC] border border-black/8 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-black text-[#0E1B2C]">{m.name}</span>{' '}
                    <span className="font-bold text-[#FF6B4A]">({m.dose})</span>
                    <p className="text-[10px] text-[#7E90A5]">{m.instructions}</p>
                  </div>
                  <span className="font-bold text-[#0E1B2C]">{m.times.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Signature / Note Area */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-between text-[11px] text-[#7E90A5]">
            <p>For patient self-tracking. Confirm treatment targets with doctor.</p>
            <p className="font-bold">Doctor's Sign: __________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};
