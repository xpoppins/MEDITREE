import { ChevronRight, Plus, User as UserIcon } from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { Member, Reading } from '../types';
import { StatusChip } from './StatusCard';

interface MemberCardProps {
  member: Member;
  latestReading?: Reading;
  onClick?: () => void;
  selected?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  latestReading,
  onClick,
  selected = false,
}) => {
  const { language } = usePreferences();

  // Consistent pleasant avatar background colors
  const avatarColors = [
    'bg-[#0F5C5C] text-white',
    'bg-[#FF7A59] text-white',
    'bg-[#3B82F6] text-white',
    'bg-[#8B5CF6] text-white',
  ];
  const colorIndex = (member.name.charCodeAt(0) || 0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  // Friendly time ago representation
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return language === 'hi' ? 'कोई माप नहीं' : 'No readings yet';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return language === 'hi' ? 'अभी-अभी' : 'Just now';
    if (diffHours < 24) {
      return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours} hours ago`;
    }
    if (diffDays === 1) return language === 'hi' ? 'कल' : 'Yesterday';
    return language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays} days ago`;
  };

  const getReadingSummary = (r?: Reading) => {
    if (!r) return null;
    if (r.type === 'bp') {
      return `BP: ${r.systolic}/${r.diastolic} mmHg`;
    }
    if (r.type === 'sugar') {
      const ctx = r.sugarContext === 'fasting' ? 'Fasting' : r.sugarContext === 'after_meal' ? 'Post meal' : '';
      return `Sugar: ${r.sugar} mg/dL ${ctx ? `(${ctx})` : ''}`;
    }
    if (r.type === 'weight') {
      return `Weight: ${r.weightKg} kg`;
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full card-soft p-5 md:p-6 transition-all duration-150 text-left ${
        onClick ? 'cursor-pointer hover:border-[#0F5C5C]/30 active:scale-[0.99]' : ''
      } ${selected ? 'border-2 border-[#0F5C5C] ring-4 ring-[#0F5C5C]/15 bg-[#F9FCFC]' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`w-16 h-16 rounded-[20px] ${avatarColor} flex items-center justify-center text-2xl font-black shrink-0 shadow-sm`}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-[#1F2933] truncate">
                {member.name}
              </h3>
              {member.hasLogin && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F5C5C] bg-[#E7F3F3] px-2 py-0.5 rounded-md shrink-0">
                  {language === 'hi' ? 'लॉगिन है' : 'Has login'}
                </span>
              )}
            </div>

            <p className="text-base font-medium text-[#1F2933]/70">
              {member.relation || (language === 'hi' ? 'परिवार सदस्य' : 'Family member')}
            </p>
          </div>
        </div>

        {onClick && (
          <div className="shrink-0 text-[#0F5C5C]/70">
            <ChevronRight className="w-7 h-7" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Latest reading & Status line */}
      <div className="mt-4 pt-3.5 border-t border-black/8 flex flex-wrap items-center justify-between gap-2.5">
        {latestReading ? (
          <>
            <div className="flex items-center gap-2">
              <StatusChip status={latestReading.status} />
              <span className="text-base font-bold text-[#1F2933]">
                {getReadingSummary(latestReading)}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#1F2933]/60">
              {formatTimeAgo(latestReading.takenAt)}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[#1F2933]/60 text-sm font-medium">
            <UserIcon className="w-4 h-4" />
            <span>{language === 'hi' ? 'अभी कोई माप दर्ज नहीं है' : 'No measurements added yet'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// "Add member" card for manager
export const AddMemberCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { language } = usePreferences();
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[96px] rounded-[24px] border-2 border-dashed border-[#0F5C5C]/35 bg-white/70 hover:bg-[#E7F3F3]/50 p-5 flex items-center justify-center gap-3.5 text-[#0F5C5C] font-bold text-xl transition-all duration-150 active:scale-[0.99] cursor-pointer"
    >
      <div className="w-12 h-12 rounded-[16px] bg-[#E7F3F3] text-[#0F5C5C] flex items-center justify-center">
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </div>
      <span>{language === 'hi' ? '+ नया सदस्य जोड़ें' : '+ Add family member'}</span>
    </button>
  );
};
