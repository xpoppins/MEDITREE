import { Activity, Download, Heart, Printer, Scale, Share2, Shield, X, Calendar } from 'lucide-react';
import React, { useState } from 'react';
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
  const [daysRange, setDaysRange] = useState<string>('30');

  // Filter readings by days range
  const filteredReadings = readings.filter((r) => {
    if (daysRange === 'all') return true;
    const daysNum = Number(daysRange);
    const diffTime = Date.now() - new Date(r.takenAt).getTime();
    return diffTime <= daysNum * 86400000;
  });

  const bpReadings = filteredReadings.filter((r) => r.type === 'bp');
  const sugarReadings = filteredReadings.filter((r) => r.type === 'sugar');
  const weightReadings = filteredReadings.filter((r) => r.type === 'weight');

  const avgSys = bpReadings.length
    ? Math.round(bpReadings.reduce((s, r) => s + (r.systolic || 0), 0) / bpReadings.length)
    : null;
  const avgDia = bpReadings.length
    ? Math.round(bpReadings.reduce((s, r) => s + (r.diastolic || 0), 0) / bpReadings.length)
    : null;

  const fastingSugars = sugarReadings.filter((r) => r.sugarContext === 'fasting' || !r.sugarContext);
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
    const text = `Health Summary for ${member.name} (${member.relation}) [Past ${daysRange === 'all' ? 'All Time' : daysRange + ' Days'}]:
Average BP: ${avgSys ? `${avgSys}/${avgDia} mmHg` : 'N/A'}
Fasting Sugar Avg: ${avgFasting ? `${avgFasting} mg/dL` : 'N/A'}
Post-Meal Sugar Avg: ${avgPostMeal ? `${avgPostMeal} mg/dL` : 'N/A'}
Weight: ${latestWeight ? `${latestWeight} kg` : 'N/A'}
Total Readings Logged: ${filteredReadings.length}
Conditions: ${member.conditions.join(', ') || 'None'}
Generated via MEDITREE.`;

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
      <div className="w-full max-w-2xl bg-white dark:bg-[#0E1B2C] rounded-[28px] border-2 border-[#0E1B2C]/20 dark:border-white/10 shadow-2xl p-5 md:p-7 relative my-auto max-h-[90vh] overflow-y-auto">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-black/10 dark:border-white/10 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'hi' ? 'प्रिंट / पीडीएफ' : 'Print / PDF Report'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-4 rounded-xl bg-[#12B5A6] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'शेयर करें' : 'Share Summary'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4F6F9] dark:bg-[#17263A] flex items-center justify-center text-[#0E1B2C] dark:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TIME RANGE SELECTOR */}
        <div className="mb-5 p-3 rounded-2xl bg-[#F4F6F9] dark:bg-[#17263A] border border-black/8 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap no-print">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B4A]" />
            <span className="text-xs font-black text-[#0E1B2C] dark:text-white">
              {language === 'hi' ? 'समय अवधि चुनें:' : 'Select Time Range:'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: '7', label: '7 Days' },
              { id: '15', label: '15 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setDaysRange(range.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  daysRange === range.id
                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0E1B2C] text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white border border-black/10 dark:border-white/10'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* CLINICAL DOCTOR REPORT BODY */}
        <div className="space-y-5 text-left" id="doctor-printable-area">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B4A] bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 px-2 py-0.5 rounded-md">
                MEDITREE Clinical Summary
              </span>
              <h2 className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {member.name}
              </h2>
              <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
                {member.relation} • {member.gender} • Born {member.dob || '1958'} • Height: {member.heightCm || '168'} cm
              </p>
            </div>
            <div className="text-right text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p className="text-[#FF6B4A] font-black">Window: {daysRange === 'all' ? 'All Time' : `${daysRange} Days`}</p>
            </div>
          </div>

          {/* Vitals Averages Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* BP Average */}
            <div className="p-3.5 rounded-2xl bg-[#FFF5F2] dark:bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 dark:border-[#FF6B4A]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B4A]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>BP Average</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgSys ? `${avgSys}/${avgDia}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mmHg</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                {bpReadings.length} readings
              </p>
            </div>

            {/* Fasting Sugar Average */}
            <div className="p-3.5 rounded-2xl bg-[#E6F8F6] dark:bg-[#12B5A6]/10 border border-[#12B5A6]/20 dark:border-[#12B5A6]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#12B5A6]">
                <Activity className="w-3.5 h-3.5" />
                <span>Fasting Sugar</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgFasting ? `${avgFasting}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mg/dL</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Target: &lt;100
              </p>
            </div>

            {/* Post Meal Sugar */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#1FA971]/10 border border-[#1FA971]/20 dark:border-[#1FA971]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1FA971]">
                <Activity className="w-3.5 h-3.5" />
                <span>Post-Meal Avg</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgPostMeal ? `${avgPostMeal}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mg/dL</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Target: &lt;140
              </p>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] dark:bg-[#3B82F6]/10 border border-[#3B82F6]/20 dark:border-[#3B82F6]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#3B82F6]">
                <Scale className="w-3.5 h-3.5" />
                <span>Latest Weight</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {latestWeight ? `${latestWeight}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">kg</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Total Logs: {filteredReadings.length}
              </p>
            </div>
          </div>

          {/* CHRONOLOGICAL READINGS EXPORT TABLE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0E1B2C] dark:text-white font-heading">
                {language === 'hi' ? 'सभी रिकॉर्डेड रीडिंग्स (लॉग टेबल)' : 'Complete Chronological Readings Log'}
              </h4>
              <span className="text-[11px] font-bold text-[#FF6B4A]">
                {filteredReadings.length} {language === 'hi' ? 'विज़िट्स/माप' : 'total logs'}
              </span>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden text-xs max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F9] dark:bg-[#17263A] text-[#7E90A5] dark:text-[#A0B2C6] font-black text-[11px]">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Reading Values</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/8 dark:divide-white/8 font-medium">
                  {filteredReadings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-[#7E90A5]">
                        No readings recorded in this time range.
                      </td>
                    </tr>
                  ) : (
                    filteredReadings.map((r) => (
                      <tr key={r.id} className="hover:bg-black/2 dark:hover:bg-white/5">
                        <td className="p-2.5 text-[#0E1B2C] dark:text-white font-bold whitespace-nowrap">
                          {new Date(r.takenAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5 uppercase font-black text-[#FF6B4A]">
                          {r.type}
                        </td>
                        <td className="p-2.5 font-bold text-[#0E1B2C] dark:text-white">
                          {r.type === 'bp' && `${r.systolic}/${r.diastolic} mmHg (${r.pulse || '--'} bpm)`}
                          {r.type === 'sugar' && `${r.sugar} mg/dL (${r.sugarContext || 'general'})`}
                          {r.type === 'weight' && `${r.weightKg} kg`}
                          {r.type === 'pulse' && `${r.pulse} bpm`}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              r.status === 'green'
                                ? 'bg-[#E6F8F6] text-[#12B5A6]'
                                : r.status === 'amber'
                                ? 'bg-[#FFF0E8] text-[#FFB020]'
                                : 'bg-[#FEECEE] text-[#E5484D]'
                            }`}
                          >
                            {r.statusText || r.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-[#7E90A5] dark:text-[#A0B2C6] italic">
                          {r.note || '---'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chronic Conditions */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              Documented Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {member.conditions.length ? (
                member.conditions.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-[#F4F6F9] dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-xs font-black text-[#0E1B2C] dark:text-white"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#7E90A5] dark:text-[#A0B2C6]">None recorded</span>
              )}
            </div>
          </div>

          {/* Current Prescriptions & Medications */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              Current Medications
            </h4>
            <div className="space-y-1.5">
              {medicines.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/8 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-black text-[#0E1B2C] dark:text-white">{m.name}</span>{' '}
                    <span className="font-bold text-[#FF6B4A]">({m.dose})</span>
                    <p className="text-[10px] text-[#7E90A5] dark:text-[#A0B2C6]">{m.instructions}</p>
                  </div>
                  <span className="font-bold text-[#0E1B2C] dark:text-white">{m.times.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Signature / Note Area */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#7E90A5] dark:text-[#A0B2C6]">
            <p>For patient self-tracking. Confirm treatment targets with doctor.</p>
            <p className="font-bold text-[#0E1B2C] dark:text-white">Doctor's Sign: __________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};
