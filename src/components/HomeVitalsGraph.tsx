import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Heart,
  Info,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { Reading } from '../types';

interface HomeVitalsGraphProps {
  readings: Reading[];
  memberName?: string;
}

export const HomeVitalsGraph: React.FC<HomeVitalsGraphProps> = ({
  readings,
  memberName = 'Member',
}) => {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const [activeTab, setActiveTab] = useState<'bp' | 'sugar' | 'weight'>('bp');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter & sort readings for active tab (chronological: oldest to newest, up to last 10)
  const tabReadings = readings
    .filter((r) => r.type === activeTab)
    .slice(0, 10)
    .reverse();

  // Baseline fallback sample points if user has no readings yet
  const samplePoints: Record<string, { label: string; fullDate: string; v1: number; v2?: number; statusText: string }[]> = {
    bp: [
      { label: '6d ago', fullDate: '6 days ago', v1: 124, v2: 82, statusText: 'Normal Blood Pressure' },
      { label: '5d ago', fullDate: '5 days ago', v1: 122, v2: 80, statusText: 'Optimal Blood Pressure' },
      { label: '4d ago', fullDate: '4 days ago', v1: 128, v2: 84, statusText: 'Normal Blood Pressure' },
      { label: '3d ago', fullDate: '3 days ago', v1: 120, v2: 78, statusText: 'Optimal Blood Pressure' },
      { label: '2d ago', fullDate: '2 days ago', v1: 126, v2: 82, statusText: 'Normal Blood Pressure' },
      { label: 'Yesterday', fullDate: 'Yesterday', v1: 122, v2: 80, statusText: 'Optimal Blood Pressure' },
      { label: 'Today', fullDate: 'Today morning', v1: 120, v2: 80, statusText: 'Optimal Blood Pressure' },
    ],
    sugar: [
      { label: '6d ago', fullDate: '6 days ago', v1: 114, statusText: 'Fasting Sugar Normal' },
      { label: '5d ago', fullDate: '5 days ago', v1: 108, statusText: 'Fasting Sugar Normal' },
      { label: '4d ago', fullDate: '4 days ago', v1: 122, statusText: 'Normal Sugar' },
      { label: '3d ago', fullDate: '3 days ago', v1: 110, statusText: 'Fasting Sugar Normal' },
      { label: '2d ago', fullDate: '2 days ago', v1: 116, statusText: 'Fasting Sugar Normal' },
      { label: 'Yesterday', fullDate: 'Yesterday', v1: 106, statusText: 'Optimal Glucose' },
      { label: 'Today', fullDate: 'Today morning', v1: 108, statusText: 'Optimal Glucose' },
    ],
    weight: [
      { label: '6d ago', fullDate: '6 days ago', v1: 73.2, statusText: 'Stable Weight' },
      { label: '5d ago', fullDate: '5 days ago', v1: 73.0, statusText: 'Stable Weight' },
      { label: '4d ago', fullDate: '4 days ago', v1: 72.8, statusText: 'Healthy Trend' },
      { label: '3d ago', fullDate: '3 days ago', v1: 72.5, statusText: 'Healthy Trend' },
      { label: '2d ago', fullDate: '2 days ago', v1: 72.4, statusText: 'Healthy Trend' },
      { label: 'Yesterday', fullDate: 'Yesterday', v1: 72.2, statusText: 'Healthy Trend' },
      { label: 'Today', fullDate: 'Today morning', v1: 72.0, statusText: 'Target Range' },
    ],
  };

  const hasRealData = tabReadings.length >= 1;

  const chartData = hasRealData
    ? tabReadings.map((r) => {
        const d = new Date(r.takenAt);
        const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          label: dayStr,
          fullDate: `${dayStr}, ${timeStr}`,
          v1:
            activeTab === 'bp'
              ? (r.systolic || 120)
              : activeTab === 'sugar'
              ? (r.sugar || 110)
              : (r.weightKg || 70),
          v2: activeTab === 'bp' ? (r.diastolic || 80) : undefined,
          statusText: r.statusText || 'Normal',
        };
      })
    : samplePoints[activeTab];

  // SVG dimensions
  const width = 600;
  const height = 180;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 40;

  const allV1 = chartData.map((d) => d.v1);
  const allV2 = chartData.map((d) => d.v2 || 0).filter((v) => v > 0);
  const allVals = [...allV1, ...allV2];

  let rawMin = allVals.length > 0 ? Math.min(...allVals) : 70;
  let rawMax = allVals.length > 0 ? Math.max(...allVals) : 130;

  if (activeTab === 'bp') {
    rawMin = Math.min(rawMin, 60);
    rawMax = Math.max(rawMax, 150);
  } else if (activeTab === 'sugar') {
    rawMin = Math.min(rawMin, 70);
    rawMax = Math.max(rawMax, 160);
  } else {
    rawMin = rawMin - 1.5;
    rawMax = rawMax + 1.5;
  }

  const minVal = Math.floor(rawMin);
  const maxVal = Math.ceil(rawMax);
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => {
    if (chartData.length <= 1) return width / 2;
    return paddingX + (idx / (chartData.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return (
      height -
      paddingBottom -
      ((clamped - minVal) / range) * (height - paddingTop - paddingBottom)
    );
  };

  const pointsV1 = chartData.map((d, idx) => ({
    x: getX(idx),
    y: getY(d.v1),
    val: d.v1,
    label: d.label,
    fullDate: d.fullDate,
    statusText: d.statusText,
  }));

  const pointsV2 =
    activeTab === 'bp'
      ? chartData.map((d, idx) => ({
          x: getX(idx),
          y: getY(d.v2 || 80),
          val: d.v2 || 80,
        }))
      : [];

  const lineStrV1 = pointsV1.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lineStrV2 = pointsV2.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const areaStrV1 =
    pointsV1.length > 0
      ? `${pointsV1[0].x},${height - paddingBottom} ${lineStrV1} ${pointsV1[pointsV1.length - 1].x},${height - paddingBottom}`
      : '';

  const latest = chartData[chartData.length - 1] || { v1: 120, v2: 80, label: 'Today', statusText: 'Normal' };
  const hoveredPoint = hoveredIndex !== null && pointsV1[hoveredIndex] ? pointsV1[hoveredIndex] : null;
  const hoveredPointV2 = hoveredIndex !== null && pointsV2[hoveredIndex] ? pointsV2[hoveredIndex] : null;

  // Safe zone bounds in Y coordinates
  const safeTopY =
    activeTab === 'bp' ? getY(120) : activeTab === 'sugar' ? getY(140) : getY(74);
  const safeBottomY =
    activeTab === 'bp' ? getY(90) : activeTab === 'sugar' ? getY(70) : getY(65);

  return (
    <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/8 dark:border-white/10">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#0E1B2C] dark:text-white font-heading flex items-center gap-2">
            <span>{language === 'hi' ? 'स्वास्थ्य मापदंड रुझान चार्ट' : 'Recent Vitals Trend Charts'}</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] border border-[#12B5A6]/30">
              {memberName}
            </span>
          </h3>
          <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
            {language === 'hi'
              ? 'दैनिक उतार-चढ़ाव और सामान्य सीमा देखें (टैप करके विवरण देखें)'
              : 'Interactive health trend curves with clinical safe zones'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F4F6F9] dark:bg-[#17263A] self-start sm:self-auto border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('bp');
              setHoveredIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'bp'
                ? 'bg-[#FF6B4A] text-white shadow-xs font-black'
                : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:text-[#A0B2C6] dark:hover:text-white'
            }`}
          >
            BP Trend
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sugar');
              setHoveredIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'sugar'
                ? 'bg-[#12B5A6] text-white shadow-xs font-black'
                : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:text-[#A0B2C6] dark:hover:text-white'
            }`}
          >
            Sugar Trend
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('weight');
              setHoveredIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'weight'
                ? 'bg-[#3B82F6] text-white shadow-xs font-black'
                : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:text-[#A0B2C6] dark:hover:text-white'
            }`}
          >
            Weight
          </button>
        </div>
      </div>

      {/* Summary Readout Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black text-[#0E1B2C] dark:text-white font-heading">
            Latest:{' '}
            {activeTab === 'bp'
              ? `${latest.v1} / ${latest.v2} mmHg`
              : activeTab === 'sugar'
              ? `${latest.v1} mg/dL`
              : `${latest.v1} kg`}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E8F8F1] dark:bg-[#10B981]/25 text-[#147A50] dark:text-[#34D399] font-bold text-[11px] border border-[#10B981]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal Range</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/track?tab=${activeTab}`)}
          className="text-xs font-black text-[#12B5A6] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Full History Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG GRAPH CANVAS CONTAINER */}
      <div className="relative w-full h-52 sm:h-56 bg-[#F9FBFC] dark:bg-[#132032] rounded-2xl p-3 border border-black/5 dark:border-white/10 select-none">
        {/* Normal Safe Zone Background Indicator */}
        <div
          className="absolute left-10 right-10 bg-[#10B981]/8 dark:bg-[#10B981]/15 border-y border-[#10B981]/30 pointer-events-none rounded-sm transition-all"
          style={{
            top: `${(safeTopY / height) * 100}%`,
            bottom: `${100 - (safeBottomY / height) * 100}%`,
          }}
        >
          <span className="absolute right-2 top-1 text-[9px] font-black uppercase text-[#10B981] opacity-75">
            Safe Normal Zone
          </span>
        </div>

        {/* ACTIVE HOVER TOOLTIP */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-[#0E1B2C] dark:bg-[#1C2C40] text-white shadow-xl border border-white/20 text-xs font-bold whitespace-nowrap"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(Math.min(hoveredPoint.y, hoveredPointV2?.y || hoveredPoint.y) / height) * 100 - 8}%`,
            }}
          >
            <p className="text-[10px] text-[#A0B2C6]">{hoveredPoint.fullDate}</p>
            <p className="font-extrabold text-sm text-[#FFB020]">
              {activeTab === 'bp'
                ? `${hoveredPoint.val} / ${hoveredPointV2?.val || 80} mmHg`
                : activeTab === 'sugar'
                ? `${hoveredPoint.val} mg/dL`
                : `${hoveredPoint.val} kg`}
            </p>
            <p className="text-[9px] text-[#34D399] font-medium">{hoveredPoint.statusText}</p>
          </div>
        )}

        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="vitals-primary-grad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={activeTab === 'bp' ? '#FF6B4A' : activeTab === 'sugar' ? '#12B5A6' : '#3B82F6'}
                stopOpacity="0.30"
              />
              <stop
                offset="100%"
                stopColor={activeTab === 'bp' ? '#FF6B4A' : activeTab === 'sugar' ? '#12B5A6' : '#3B82F6'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Reference Grid lines */}
          <line
            x1={paddingX}
            y1={getY(minVal + range * 0.25)}
            x2={width - paddingX}
            y2={getY(minVal + range * 0.25)}
            stroke="currentColor"
            className="text-black/8 dark:text-white/10"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={getY(minVal + range * 0.75)}
            x2={width - paddingX}
            y2={getY(minVal + range * 0.75)}
            stroke="currentColor"
            className="text-black/8 dark:text-white/10"
            strokeDasharray="4 4"
          />

          {/* Area fill for Primary Metric */}
          {areaStrV1 && <polygon fill="url(#vitals-primary-grad)" points={areaStrV1} />}

          {/* Secondary Metric line (Diastolic BP) */}
          {activeTab === 'bp' && lineStrV2 && (
            <polyline
              fill="none"
              stroke="#12B5A6"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={lineStrV2}
            />
          )}

          {/* Primary Metric line */}
          {lineStrV1 && (
            <polyline
              fill="none"
              stroke={activeTab === 'bp' ? '#FF6B4A' : activeTab === 'sugar' ? '#12B5A6' : '#3B82F6'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={lineStrV1}
            />
          )}

          {/* Data Points with Values & Day Labels */}
          {pointsV1.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(idx)}
              >
                {/* Vertical hover crosshair guide */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={height - paddingBottom}
                    stroke="#FFB020"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Primary Circle node */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 5}
                  fill={activeTab === 'bp' ? '#FF6B4A' : activeTab === 'sugar' ? '#12B5A6' : '#3B82F6'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />

                {/* Primary Value Label */}
                <rect
                  x={p.x - 14}
                  y={p.y - 20}
                  width="28"
                  height="14"
                  rx="4"
                  fill="#0E1B2C"
                  fillOpacity="0.85"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {p.val}
                </text>

                {/* Day Label at bottom axis */}
                <text
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  fill="#7E90A5"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Diastolic Points for BP */}
          {activeTab === 'bp' &&
            pointsV2.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g
                  key={`d-${idx}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(idx)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4.5}
                    fill="#12B5A6"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <rect
                    x={p.x - 12}
                    y={p.y + 7}
                    width="24"
                    height="13"
                    rx="3"
                    fill="#0E1B2C"
                    fillOpacity="0.8"
                  />
                  <text
                    x={p.x}
                    y={p.y + 16.5}
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {p.val}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Legend & Safety Band Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
        <div className="flex items-center gap-4">
          {activeTab === 'bp' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
                <span className="text-[#0E1B2C] dark:text-white font-black">Systolic (Upper BP)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#12B5A6]" />
                <span className="text-[#0E1B2C] dark:text-white font-black">Diastolic (Lower BP)</span>
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  activeTab === 'sugar' ? 'bg-[#12B5A6]' : 'bg-[#3B82F6]'
                }`}
              />
              <span className="text-[#0E1B2C] dark:text-white font-black">
                {activeTab === 'sugar' ? 'Blood Glucose (mg/dL)' : 'Body Weight (kg)'}
              </span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-[#147A50] dark:text-[#34D399] bg-[#E8F8F1] dark:bg-[#10B981]/20 px-2.5 py-1 rounded-md font-bold border border-[#10B981]/30">
          ✓ Shaded region indicates healthy clinical range
        </span>
      </div>
    </div>
  );
};
