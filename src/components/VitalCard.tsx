import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { HealthStatus, ReadingType } from '../types';

interface VitalCardProps {
  type: ReadingType | 'bmi';
  title: string;
  titleHi: string;
  value: string;
  unit: string;
  status: HealthStatus;
  statusText?: string;
  timeAgo: string;
  sparklineData?: number[];
  onClick?: () => void;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  title,
  titleHi,
  value,
  unit,
  status,
  timeAgo,
  sparklineData = [120, 122, 119, 124, 121, 125, 122],
  onClick,
}) => {
  const { language } = usePreferences();

  // Status Chip config with high dark-mode contrast
  const normalizedStatus = status === 'yellow' ? 'amber' : (status || 'green');

  const configs = {
    green: {
      bg: 'bg-[#E8F8F1] dark:bg-[#10B981]/20',
      text: 'text-[#147A50] dark:text-[#34D399]',
      border: 'border-[#1FA971]/30 dark:border-[#10B981]/40',
      label: language === 'hi' ? 'अच्छा' : 'Good',
      stroke: '#10B981',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2.5} />,
    },
    amber: {
      bg: 'bg-[#FEF7E6] dark:bg-[#F59E0B]/20',
      text: 'text-[#9A6707] dark:text-[#FBBF24]',
      border: 'border-[#E8A317]/30 dark:border-[#F59E0B]/40',
      label: language === 'hi' ? 'ध्यान दें' : 'Watch',
      stroke: '#F59E0B',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" strokeWidth={2.5} />,
    },
    yellow: {
      bg: 'bg-[#FEF7E6] dark:bg-[#F59E0B]/20',
      text: 'text-[#9A6707] dark:text-[#FBBF24]',
      border: 'border-[#E8A317]/30 dark:border-[#F59E0B]/40',
      label: language === 'hi' ? 'ध्यान दें' : 'Watch',
      stroke: '#F59E0B',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" strokeWidth={2.5} />,
    },
    red: {
      bg: 'bg-[#FEECEE] dark:bg-[#EF4444]/20',
      text: 'text-[#B0282C] dark:text-[#F87171]',
      border: 'border-[#E5484D]/30 dark:border-[#EF4444]/40',
      label: language === 'hi' ? 'डॉक्टर से मिलें' : 'See doctor',
      stroke: '#EF4444',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" strokeWidth={2.5} />,
    },
  };

  const statusConfig = configs[normalizedStatus] || configs.green;

  // Vital icon
  const getIcon = () => {
    switch (type) {
      case 'bp':
        return <Heart className="w-5 h-5 text-[#FF6B4A]" />;
      case 'sugar':
        return <Activity className="w-5 h-5 text-[#12B5A6]" />;
      case 'weight':
      case 'bmi':
        return <Scale className="w-5 h-5 text-[#3B82F6]" />;
      case 'pulse':
        return <Heart className="w-5 h-5 text-[#E8A317]" />;
    }
  };

  // Dedicated Full-Width High-Contrast Sparkline Graph
  const renderFullSparkline = () => {
    const data = sparklineData && sparklineData.length >= 2
      ? sparklineData
      : [120, 122, 119, 124, 121, 125, 122];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 180;
    const height = 44;
    const padding = 6;

    const coords = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y, val };
    });

    const pointsStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaPoints = `${coords[0].x},${height} ${pointsStr} ${coords[coords.length - 1].x},${height}`;
    const lastPoint = coords[coords.length - 1];

    const isTrendingUp = data[data.length - 1] > data[0];
    const gradId = `spark-grad-${type}-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className="w-full mt-2.5 mb-1 pt-1.5 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#7E90A5] mb-1">
          <span className="flex items-center gap-1">
            {isTrendingUp ? (
              <TrendingUp className="w-3 h-3 text-[#FF6B4A]" />
            ) : (
              <TrendingDown className="w-3 h-3 text-[#10B981]" />
            )}
            <span>Recent Trend</span>
          </span>
          <span className="font-mono">
            {min}–{max} {unit}
          </span>
        </div>

        <div className="relative w-full h-11">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={statusConfig.stroke} stopOpacity="0.35" />
                <stop offset="100%" stopColor={statusConfig.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient filled area below line */}
            <polygon fill={`url(#${gradId})`} points={areaPoints} />

            {/* The main bright curve */}
            <polyline
              fill="none"
              stroke={statusConfig.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsStr}
            />

            {/* Glowing dot on newest value */}
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4.5"
              fill={statusConfig.stroke}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>
    );
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
      className={`card-wellness p-4 md:p-5 flex flex-col justify-between transition-all duration-150 text-left relative bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm ${
        onClick ? 'cursor-pointer hover:border-[#12B5A6]/50 active:scale-[0.98]' : ''
      }`}
    >
      <div>
        {/* Header: Title + Type Icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F4F6F9] dark:bg-[#17263A] flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <span className="text-sm font-black font-heading text-[#0E1B2C] dark:text-white truncate">
              {language === 'hi' ? titleHi : title}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Big Number Display */}
        <div className="my-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0E1B2C] dark:text-white font-heading tracking-tight">
              {value}
            </span>
            <span className="text-xs font-bold text-[#4A5B70] dark:text-[#A0B2C6]">
              {unit}
            </span>
          </div>
        </div>

        {/* Dedicated Full-Width Visual Sparkline Graph */}
        {renderFullSparkline()}
      </div>

      {/* Footer: Time Ago + Click to view */}
      <div className="pt-2 border-t border-black/6 dark:border-white/10 flex items-center justify-between gap-2 mt-1 text-[11px] font-bold text-[#7E90A5]">
        <span className="truncate">{timeAgo}</span>
        {onClick && (
          <span className="flex items-center gap-0.5 text-[#12B5A6] hover:underline shrink-0">
            <span>Chart</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
};
