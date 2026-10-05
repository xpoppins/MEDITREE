import {
  Check,
  Clipboard,
  Clock,
  Download,
  FileText,
  Heart,
  MessageCircle,
  Pill,
  Plus,
  Printer,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { Member, Medicine } from '../types';

interface ExportPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  onOpenAddMedicine?: (memberId: string) => void;
}

export const ExportPrescriptionModal: React.FC<ExportPrescriptionModalProps> = ({
  isOpen,
  onClose,
  memberId,
  onOpenAddMedicine,
}) => {
  const { members, family } = useAuth();
  const { language } = usePreferences();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    memberId || members[0]?.id || ''
  );
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberId) {
      setSelectedMemberId(memberId);
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [memberId, members]);

  useEffect(() => {
    if (selectedMemberId) {
      setLoading(true);
      api.getMedicines(selectedMemberId)
        .then(setMedicines)
        .finally(() => setLoading(false));
    }
  }, [selectedMemberId]);

  if (!isOpen) return null;

  const currentMember: Member | undefined = members.find((m) => m.id === selectedMemberId) || members[0];
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const rxId = `RX-${selectedMemberId?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-4) || '9921'}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

  const generatePrescriptionText = () => {
    if (!currentMember) return '';
    let text = `========================================\n`;
    text += `HEALTHNEST MEDICAL PRESCRIPTION RECORD\n`;
    text += `Family Vault: ${family?.name || 'Family Vault'}\n`;
    text += `Prescription ID: ${rxId}\n`;
    text += `Date: ${currentDate}\n`;
    text += `========================================\n\n`;
    text += `PATIENT DETAILS:\n`;
    text += `Name: ${currentMember.name}\n`;
    text += `Relation: ${currentMember.relation}\n`;
    text += `Conditions: ${currentMember.conditions.join(', ') || 'Hypertension, Preventive Care'}\n\n`;
    text += `CURRENT ACTIVE MEDICATIONS (${medicines.length}):\n`;
    text += `----------------------------------------\n`;

    medicines.forEach((med, idx) => {
      text += `${idx + 1}. ${med.name} (${med.dose})\n`;
      text += `   Timing: ${med.times.join(', ')} • ${med.instructions || 'With water'}\n`;
      if (med.condition) text += `   For Condition: ${med.condition}\n`;
      if (med.prescribedBy) text += `   Doctor: ${med.prescribedBy}\n`;
      text += `\n`;
    });

    text += `----------------------------------------\n`;
    text += `Special Instructions: Take all medications at consistent times. Review with physician every 3-6 months.\n`;
    text += `Generated digitally via MEDITREE Family Health Vault\n`;
    return text;
  };

  const handleCopy = () => {
    const text = generatePrescriptionText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generatePrescriptionText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="card-wellness p-4 sm:p-6 bg-white dark:bg-[#0E1B2C] max-w-2xl w-full max-h-[94vh] overflow-y-auto relative border border-black/10 dark:border-white/10 shadow-2xl flex flex-col justify-between">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-black/9 text-[#0E1B2C] dark:text-white flex items-center justify-center hover:opacity-80 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Member Selector Strip (Hidden in Print) */}
        <div className="print:hidden mb-4 pr-10">
          <label className="block text-xs font-black uppercase text-[#7E90A5] mb-2">
            Select Family Member Prescription:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  selectedMemberId === m.id
                    ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] shadow-xs'
                    : 'bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#12B5A6]'
                }`}
              >
                {m.name} ({m.relation})
              </button>
            ))}
          </div>
        </div>

        {/* PRINTABLE PRESCRIPTION CANVAS */}
        <div id="prescription-printable-area" className="bg-[#FAFBFD] dark:bg-[#111C2B] p-5 sm:p-6 rounded-3xl border-2 border-black/8 dark:border-white/10 text-left print:bg-white print:text-black print:border-none print:p-0">
          {/* Prescription Clinic / Vault Header */}
          <div className="flex items-start justify-between border-b-2 border-black/10 dark:border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0E1B2C] text-white flex items-center justify-center font-heading font-black text-xl shadow-xs shrink-0">
                <span className="text-[#FF6B4A]">Rx</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0E1B2C] dark:text-white font-heading tracking-tight">
                  MEDITREE Family Care
                </h2>
                <p className="text-xs font-bold text-[#12B5A6]">
                  Digital Health Vault • Verified Medication Record
                </p>
                <p className="text-[11px] text-[#7E90A5]">
                  Family Group: <span className="font-extrabold text-[#0E1B2C] dark:text-white">{family?.name || 'Family Vault'}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-[#E6F8F6] text-[#12B5A6] text-xs font-black font-mono">
                {rxId}
              </span>
              <p className="text-[11px] font-bold text-[#7E90A5] mt-1">
                Issued: {currentDate}
              </p>
            </div>
          </div>

          {/* Patient Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#17263A] border border-black/8 dark:border-white/10 mb-4 text-xs">
            <div>
              <p className="text-[10px] font-black uppercase text-[#7E90A5]">Patient Name</p>
              <p className="font-extrabold text-[#0E1B2C] dark:text-white truncate">{currentMember?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#7E90A5]">Relation / Role</p>
              <p className="font-bold text-[#0E1B2C] dark:text-white">{currentMember?.relation}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#7E90A5]">Known Conditions</p>
              <p className="font-bold text-[#0E1B2C] dark:text-white truncate">
                {currentMember?.conditions.length ? currentMember.conditions.join(', ') : 'Routine Wellness'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#7E90A5]">Emergency Contact</p>
              <p className="font-bold text-[#0E1B2C] dark:text-white">
                {currentMember?.emergencyContact?.phone || 'Family Physician'}
              </p>
            </div>
          </div>

          {/* Active Medicines Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-[#12B5A6]" />
                <span>Prescribed Medications ({medicines.length})</span>
              </h4>
              {onOpenAddMedicine && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddMedicine(selectedMemberId);
                  }}
                  className="print:hidden text-xs font-black text-[#FF6B4A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add another medicine</span>
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-xs font-bold text-[#7E90A5] py-6">
                Loading prescription...
              </p>
            ) : medicines.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#17263A] border border-dashed border-black/15 text-xs text-[#7E90A5]">
                <p className="font-bold text-[#0E1B2C] dark:text-white mb-1">
                  No active medicines recorded for {currentMember?.name}.
                </p>
                <p>Tap below to add their daily medications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#17263A]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F6F9] dark:bg-[#132032] text-[#7E90A5] font-black text-[10px] uppercase border-b border-black/8 dark:border-white/8">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine & Strength</th>
                      <th className="py-2.5 px-3">Daily Timing</th>
                      <th className="py-2.5 px-3">For Condition</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold">
                    {medicines.map((med, idx) => (
                      <tr key={med.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                        <td className="py-3 px-3 font-mono font-bold text-[#7E90A5]">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-black text-[#0E1B2C] dark:text-white text-xs">{med.name}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-[#12B5A6] font-bold">{med.dose}</span>
                            {med.genericName && (
                              <span className="text-[10px] text-[#7E90A5] font-semibold">
                                • {med.genericName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-bold text-[#0E1B2C] dark:text-white">
                            <Clock className="w-3 h-3 text-[#FF6B4A]" />
                            <span>{med.times.join(', ')}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#E6F8F6] text-[#12B5A6] font-bold text-[10px]">
                            {med.condition || 'General Care'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#4A5B70] dark:text-[#A0B0C4] text-[11px]">
                          {med.instructions || 'Take with water'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Verification Sign-Off Footer */}
          <div className="mt-5 pt-4 border-t-2 border-dashed border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#7E90A5]">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#1FA971]" />
              <span>Certified Family Health Log • Accurate as of {currentDate}</span>
            </div>
            <div className="text-right">
              <p className="font-black text-[#0E1B2C] dark:text-white">Authorized Caregiver / Doctor</p>
              <div className="w-28 h-6 border-b border-black/30 dark:border-white/30 ml-auto mt-1" />
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar (Hidden on Print) */}
        <div className="print:hidden mt-4 pt-3 border-t border-black/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] font-black text-xs flex items-center gap-2 shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-4 rounded-xl bg-[#25D366] text-white font-black text-xs flex items-center gap-1.5 shadow-xs hover:bg-[#20BE5A] active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp to Pharmacy</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#17263A] border border-black/15 dark:border-white/15 text-[#0E1B2C] dark:text-white font-bold text-xs flex items-center gap-1.5 hover:border-[#12B5A6] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#1FA971]" />
                  <span className="text-[#1FA971]">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {onOpenAddMedicine && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddMedicine(selectedMemberId);
                }}
                className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white font-black text-xs flex items-center gap-1 shadow-xs hover:opacity-95 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Med</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
