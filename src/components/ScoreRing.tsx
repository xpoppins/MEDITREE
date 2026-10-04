import { Sparkles, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { HealthScoreDetails } from '../types';

interface ScoreRingProps {
  scoreDetails: HealthScoreDetails;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ scoreDetails }) => {
  const { language } = usePreferences();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = scoreDetails.score;
    const duration = 800;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [scoreDetails.score]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  const getCategoryColor = () => {
    if (scoreDetails.score >= 90) return 'text-[#1FA971]';
    if (scoreDetails.score >= 75) return 'text-[#FF9028]';
    if (scoreDetails.score >= 60) return 'text-[#E8A317]';
    return 'text-[#E5484D]';
  };

  return (
    <div className="card-hero p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FF6B4A]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#12B5A6]/15 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        {/* Animated Circular Ring */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#FFB020" />
              </linearGradient>
            </defs>
            {/* Background ring track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="12"
              fill="none"
            />
            {/* Animated Gradient Fill */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#scoreRingGrad)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>

          {/* Centered Big Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black tracking-tight text-white font-heading">
              {animatedScore}
            </span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FFB020] mt-0.5">
              Score / 100
            </span>
          </div>
        </div>

        {/* Text and Status Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-[#FFB020] mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'स्वास्थ्य स्कोर' : 'Health Vitality Score'}</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white font-heading">
            {language === 'hi'
              ? `${scoreDetails.category === 'Excellent' ? 'शानदार' : 'संतुलित'} स्थिति`
              : `${scoreDetails.category} Control`}
          </h3>

          <p className="text-sm font-medium text-white/80 mt-1 leading-snug">
            {scoreDetails.explanation}
          </p>

          {/* 7-day stats breakdown pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-[#1FA971]/20 text-[#34D399] border border-[#1FA971]/30">
              ✓ {scoreDetails.greenCount} {language === 'hi' ? 'सामान्य' : 'Normal'}
            </span>
            {scoreDetails.amberCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-[#E8A317]/20 text-[#FBBF24] border border-[#E8A317]/30">
                ⚠ {scoreDetails.amberCount} {language === 'hi' ? 'हल्का बढ़ा' : 'Watch'}
              </span>
            )}
            {scoreDetails.redCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-[#E5484D]/20 text-[#F87171] border border-[#E5484D]/30">
                ✕ {scoreDetails.redCount} {language === 'hi' ? 'अधिक' : 'High'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
