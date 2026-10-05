import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Heart,
  Pill,
  Plus,
  ShieldAlert,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { HealthStatus, Member, Medicine } from '../types';

interface FamilyStripProps {
  members: Member[];
  memberStatuses: Record<string, HealthStatus>;
  selectedMemberId?: string;
  onSelectMember: (id: string) => void;
  onAddMember?: () => void;
  onAddMedicine?: (memberId: string) => void;
  onExportPrescription?: (memberId: string) => void;
}

export const FamilyStrip: React.FC<FamilyStripProps> = ({
  members,
  memberStatuses,
  selectedMemberId,
  onSelectMember,
  onAddMember,
  onAddMedicine,
  onExportPrescription,
}) => {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    api.getMedicines()
      .then((meds) => setAllMedicines(meds))
      .catch(() => {});
  }, []);

  const getStatusBadge = (st?: HealthStatus) => {
    switch (st) {
      case 'red':
        return {
          dot: 'bg-[#E5484D] ring-2 ring-[#E5484D]/40 animate-pulse',
          badge: 'bg-[#FEECEE] dark:bg-[#E5484D]/20 text-[#E5484D] dark:text-[#FF8A8A] border-[#E5484D]/30',
          label: language === 'hi' ? 'ध्यान दें (High)' : 'Needs Attention',
          icon: ShieldAlert,
        };
      case 'amber':
      case 'yellow':
        return {
          dot: 'bg-[#E8A317] ring-2 ring-[#E8A317]/30',
          badge: 'bg-[#FEF7E6] dark:bg-[#E8A317]/20 text-[#B87A00] dark:text-[#F3C465] border-[#E8A317]/30',
          label: language === 'hi' ? 'मॉडरेट' : 'Moderate',
          icon: AlertCircle,
        };
      case 'green':
      default:
        return {
          dot: 'bg-[#1FA971] ring-2 ring-[#1FA971]/30',
          badge: 'bg-[#E8F8F1] dark:bg-[#1FA971]/20 text-[#147A50] dark:text-[#52D49C] border-[#1FA971]/30',
          label: language === 'hi' ? 'स्थिर' : 'Optimal',
          icon: CheckCircle2,
        };
    }
  };

  const getMemberMedCount = (memberId: string) => {
    return allMedicines.filter((m) => m.memberId === memberId).length;
  };

  return (
    <div className="card-wellness p-4 sm:p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm transition-all">
      {/* Header with Title and "View All Family" link */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0E1B2C] dark:text-black font-heading">
              {language === 'hi' ? 'परिवार स्वास्थ्य व दवा प्रबंधन' : 'Family Health & Medicine Hub'}
            </h3>
            <p className="text-[11px] font-bold text-[#7E90A5]">
              {language === 'hi'
                ? 'प्रत्येक सदस्य के लिए दवा जोड़ें या प्रिस्क्रिप्शन एक्सपोर्ट करें'
                : 'Featured actions for each family member: add medicine & export prescription'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/family')}
          className="text-xs font-black text-[#12B5A6] hover:underline flex items-center gap-1 cursor-pointer bg-[#E6F8F6] dark:bg-[#12B5A6]/20 px-2.5 py-1.5 rounded-xl transition-all"
        >
          <span>{language === 'hi' ? 'पूरा परिवार' : 'Manage All'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HORIZONTAL CARDS: A featured comprehensive card for EACH member */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {members.map((member) => {
          const st = memberStatuses[member.id] || 'green';
          const isSelected = selectedMemberId === member.id;
          const statusInfo = getStatusBadge(st);
          const medCount = getMemberMedCount(member.id);

          return (
            <div
              key={member.id}
              className={`rounded-2xl p-3.5 transition-all flex flex-col justify-between border relative ${
                isSelected
                  ? 'bg-[#F2FAF9] dark:bg-[#102336] border-[#12B5A6] ring-2 ring-[#12B5A6]/20 shadow-md'
                  : 'bg-white dark:bg-[#142234] border-black/8 dark:border-white/8 hover:border-[#12B5A6]/50 shadow-xs'
              }`}
            >
              {/* Member Basic Info Row (Clicking switches active member) */}
              <div
                onClick={() => onSelectMember(member.id)}
                className="cursor-pointer group"
                title={`Click to view ${member.name}'s readings on dashboard`}
              >
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-3">
                    {/* Avatar with Status Dot */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] flex items-center justify-center text-lg font-black shadow-xs group-hover:scale-105 transition-transform">
                        {member.name.charAt(0)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#142234] ${statusInfo.dot}`}
                        title={`Vitals: ${statusInfo.label}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white truncate group-hover:text-[#12B5A6] transition-colors">
                          {member.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#12B5A6] text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#7E90A5]">
                        {member.relation}
                      </p>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${statusInfo.badge}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Health Condition Tags & Med count */}
                <div className="flex items-center justify-between gap-1 text-[11px] pt-1 pb-2.5 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1 text-[#7E90A5] truncate">
                    <Heart className="w-3 h-3 text-[#FF6B4A] shrink-0" />
                    <span className="truncate font-semibold">
                      {member.conditions && member.conditions.length > 0
                        ? member.conditions.slice(0, 2).join(', ')
                        : 'Routine Monitoring'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] shrink-0">
                    💊 {medCount} {medCount === 1 ? 'med' : 'meds'}
                  </span>
                </div>
              </div>

              {/* FEATURED ACTION BUTTONS FOR THIS EXACT FAMILY MEMBER */}
              <div className="pt-2.5 border-t border-black/8 dark:border-white/10 grid grid-cols-2 gap-2 mt-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddMedicine) onAddMedicine(member.id);
                  }}
                  className="w-full py-2 px-2 rounded-xl bg-[#12B5A6] hover:bg-[#0EA092] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title={`Add medicine for ${member.name}`}
                  aria-label={`Add medicine for ${member.name}`}
                >
                  <Pill className="w-3.5 h-3.5 text-white" />
                  <span className="truncate">+ Add Med</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onExportPrescription) onExportPrescription(member.id);
                  }}
                  className="w-full py-2 px-2 rounded-xl bg-[#E6F8F6] hover:bg-[#D4F4F1] dark:bg-[#1A2E44] dark:hover:bg-[#223B56] border border-[#12B5A6]/40 text-[#0F5C5C] dark:text-[#5EEAD4] font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  title={`Export doctor prescription record for ${member.name}`}
                  aria-label={`Export doctor prescription record for ${member.name}`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#12B5A6] dark:text-[#5EEAD4]" />
                  <span className="truncate">Export Rx</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Family Member Card */}
        {onAddMember && (
          <button
            type="button"
            onClick={onAddMember}
            className="rounded-2xl p-4 border-2 border-dashed border-[#12B5A6]/40 hover:border-[#12B5A6] hover:bg-[#E6F8F6]/40 dark:hover:bg-[#12B5A6]/10 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-[#12B5A6] block">
                + {language === 'hi' ? 'नया सदस्य जोड़ें' : 'Add Family Member'}
              </span>
              <span className="text-[10px] font-bold text-[#7E90A5]">
                {language === 'hi' ? 'माता-पिता या बच्चे' : 'Add parents or dependents'}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
