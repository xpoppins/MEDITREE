import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { HealthStatus } from '../types';

interface StatusCardProps {
  status: HealthStatus;
  headlineValue: string;
  subValue?: string;
  unit?: string;
  explanation: string;
  title?: string;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  headlineValue,
  subValue,
  unit,
  explanation,
  title,
  className = '',
}) => {
  const { language } = usePreferences();

  const normalizedStatus = status === 'amber' ? 'yellow' : (status || 'green');

  const configs = {
    green: {
      bg: 'bg-[#E8F7EE]',
      border: 'border-[#1E8E4E]',
      textDark: 'text-[#146636]',
      badgeBg: 'bg-[#1E8E4E]',
      badgeText: 'text-white',
      word: language === 'hi' ? 'अच्छा' : 'Good',
      icon: <CheckCircle2 className="w-9 h-9 text-[#1E8E4E] shrink-0" strokeWidth={2.5} />,
    },
    yellow: {
      bg: 'bg-[#FEF8E7]',
      border: 'border-[#E0A100]',
      textDark: 'text-[#8A5800]',
      badgeBg: 'bg-[#C58500]',
      badgeText: 'text-white',
      word: language === 'hi' ? 'ध्यान दें' : 'Watch',
      icon: <AlertTriangle className="w-9 h-9 text-[#C58500] shrink-0" strokeWidth={2.5} />,
    },
    amber: {
      bg: 'bg-[#FEF8E7]',
      border: 'border-[#E0A100]',
      textDark: 'text-[#8A5800]',
      badgeBg: 'bg-[#C58500]',
      badgeText: 'text-white',
      word: language === 'hi' ? 'ध्यान दें' : 'Watch',
      icon: <AlertTriangle className="w-9 h-9 text-[#C58500] shrink-0" strokeWidth={2.5} />,
    },
    red: {
      bg: 'bg-[#FEEEEE]',
      border: 'border-[#D64545]',
      textDark: 'text-[#962525]',
      badgeBg: 'bg-[#D64545]',
      badgeText: 'text-white',
      word: language === 'hi' ? 'डॉक्टर से मिलें' : 'See doctor',
      icon: <AlertOctagon className="w-9 h-9 text-[#D64545] shrink-0" strokeWidth={2.5} />,
    },
  };

  const config = configs[normalizedStatus] || configs.green;

  return (
    <div
      className={`rounded-[24px] p-6 border-2 ${config.bg} ${config.border} shadow-sm ${className}`}
      role="region"
      aria-label={`Status: ${config.word}`}
    >
      {title && (
        <p className="text-sm font-bold uppercase tracking-wider text-[#1F2933]/70 mb-2">
          {title}
        </p>
      )}

      {/* Top Status Header: Icon + Word */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {config.icon}
          <span className="text-2xl md:text-3xl font-extrabold text-[#1F2933]">
            {config.word}
          </span>
        </div>
        <span
          className={`px-3.5 py-1 rounded-full text-sm font-bold tracking-wide uppercase ${config.badgeBg} ${config.badgeText}`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {/* Large readable value */}
      <div className="my-3">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl md:text-6xl font-black tracking-tight text-[#1F2933]">
            {headlineValue}
          </span>
          {unit && (
            <span className="text-xl md:text-2xl font-bold text-[#1F2933]/80">
              {unit}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-lg font-medium text-[#1F2933]/80 mt-1">
            {subValue}
          </p>
        )}
      </div>

      {/* Clear plain-language explanation */}
      <div className="pt-3 border-t border-black/10 mt-3">
        <p className={`text-lg md:text-xl font-bold leading-snug ${config.textDark}`}>
          {explanation}
        </p>
      </div>

      {/* Subtle safety disclaimer */}
      <p className="text-xs text-[#1F2933]/60 mt-3 italic">
        {language === 'hi'
          ? '* केवल रिकॉर्ड रखने के लिए। यह डॉक्टरी सलाह नहीं है।'
          : '* For tracking only. Not medical advice. Always confirm with your doctor.'}
      </p>
    </div>
  );
};

// Compact inline status badge component for cards & list items
export const StatusChip: React.FC<{
  status: HealthStatus;
  label?: string;
  showIcon?: boolean;
}> = ({ status, label, showIcon = true }) => {
  const { language } = usePreferences();

  const normalizedStatus = status === 'amber' ? 'yellow' : (status || 'green');

  const configs = {
    green: {
      bg: 'bg-[#E8F7EE]',
      text: 'text-[#146636]',
      border: 'border-[#1E8E4E]',
      defaultWord: language === 'hi' ? 'अच्छा' : 'Good',
      icon: <CheckCircle2 className="w-4 h-4 text-[#1E8E4E] shrink-0" strokeWidth={2.5} />,
    },
    yellow: {
      bg: 'bg-[#FEF8E7]',
      text: 'text-[#8A5800]',
      border: 'border-[#E0A100]',
      defaultWord: language === 'hi' ? 'ध्यान दें' : 'Watch',
      icon: <AlertTriangle className="w-4 h-4 text-[#C58500] shrink-0" strokeWidth={2.5} />,
    },
    amber: {
      bg: 'bg-[#FEF8E7]',
      text: 'text-[#8A5800]',
      border: 'border-[#E0A100]',
      defaultWord: language === 'hi' ? 'ध्यान दें' : 'Watch',
      icon: <AlertTriangle className="w-4 h-4 text-[#C58500] shrink-0" strokeWidth={2.5} />,
    },
    red: {
      bg: 'bg-[#FEEEEE]',
      text: 'text-[#962525]',
      border: 'border-[#D64545]',
      defaultWord: language === 'hi' ? 'डॉक्टर से मिलें' : 'See doctor',
      icon: <AlertOctagon className="w-4 h-4 text-[#D64545] shrink-0" strokeWidth={2.5} />,
    },
  };

  const config = configs[normalizedStatus] || configs.green;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${config.bg} ${config.text} ${config.border}`}
    >
      {showIcon && config.icon}
      <span>{label || config.defaultWord}</span>
    </span>
  );
};
