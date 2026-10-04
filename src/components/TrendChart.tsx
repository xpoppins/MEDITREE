import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePreferences } from '../context/PreferencesContext';
import { Reading, ReadingType } from '../types';

interface TrendChartProps {
  readings: Reading[];
  type: ReadingType;
  days: 7 | 30 | 90;
}

export const TrendChart: React.FC<TrendChartProps> = ({ readings, type, days }) => {
  const { language } = usePreferences();

  // Filter & reverse so earliest is on left and newest on right
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = readings
    .filter((r) => r.type === type && new Date(r.takenAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());

  if (filtered.length === 0) {
    return (
      <div className="w-full h-56 rounded-[22px] bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center text-[#7E90A5] dark:text-[#A0B2C6]">
        <p className="text-lg font-bold text-[#0E1B2C] dark:text-white">
          {language === 'hi'
            ? 'इस समयावधि में कोई डेटा उपलब्ध नहीं है'
            : 'No readings found for this time period'}
        </p>
        <p className="text-sm mt-1">
          {language === 'hi'
            ? 'नया माप दर्ज करने पर यहाँ सुंदर चार्ट दिखाई देगा'
            : 'Add readings to see health trend chart here'}
        </p>
      </div>
    );
  }

  // Format data for chart
  const data = filtered.map((r) => {
    const d = new Date(r.takenAt);
    const dateLabel = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
    return {
      date: dateLabel,
      fullDate: d.toLocaleString(),
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
      sugar: r.sugar,
      weight: r.weightKg,
      status: r.status,
      statusText: r.statusText,
    };
  });

  // Custom Elder-Friendly Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#17263A] border-2 border-[#12B5A6] p-3 rounded-2xl shadow-xl text-left border border-black/10 dark:border-white/10">
          <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">{p.fullDate}</p>
          {type === 'bp' && (
            <div className="mt-1">
              <p className="text-lg font-extrabold text-[#FF6B4A]">
                BP: {p.systolic} / {p.diastolic} <span className="text-xs font-normal">mmHg</span>
              </p>
              {p.pulse && (
                <p className="text-sm font-semibold text-[#12B5A6]">
                  Pulse: {p.pulse} bpm
                </p>
              )}
            </div>
          )}
          {type === 'sugar' && (
            <p className="text-xl font-extrabold text-[#12B5A6] mt-1">
              Sugar: {p.sugar} <span className="text-xs font-normal">mg/dL</span>
            </p>
          )}
          {type === 'weight' && (
            <p className="text-xl font-extrabold text-[#3B82F6] mt-1">
              Weight: {p.weight} <span className="text-xs font-normal">kg</span>
            </p>
          )}
          <p className="text-xs font-medium text-[#4A5B70] dark:text-[#A0B2C6] mt-1 max-w-[200px]">
            {p.statusText}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-[#0E1B2C] rounded-[24px] p-4 md:p-5 border border-black/10 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-base font-bold text-[#0E1B2C] dark:text-white">
          {type === 'bp'
            ? (language === 'hi' ? 'रक्तचाप का रुझान (BP Trend)' : 'Blood Pressure Trend')
            : type === 'sugar'
            ? (language === 'hi' ? 'शुगर का रुझान (Sugar Trend)' : 'Blood Sugar Trend')
            : (language === 'hi' ? 'वज़न का रुझान (Weight Trend)' : 'Weight Trend')}
        </h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#147A50] dark:text-[#34D399] bg-[#E8F8F1] dark:bg-[#10B981]/20 px-2.5 py-1 rounded-full border border-[#10B981]/30">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>{language === 'hi' ? 'हरा क्षेत्र: सामान्य सीमा' : 'Green area: Normal range'}</span>
        </div>
      </div>

      <div className="w-full h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-black/5 dark:text-white/10" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#7E90A5"
              tick={{ fontSize: 12, fontWeight: 700, fill: '#7E90A5' }}
              tickLine={false}
            />
            <YAxis
              stroke="#7E90A5"
              tick={{ fontSize: 12, fontWeight: 700, fill: '#7E90A5' }}
              domain={
                type === 'bp'
                  ? [50, 190]
                  : type === 'sugar'
                  ? [60, 240]
                  : ['auto', 'auto']
              }
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Healthy Normal Range Shading */}
            {type === 'bp' && (
              <>
                {/* Normal Upper Systolic (90 to 120) */}
                <ReferenceArea
                  y1={90}
                  y2={120}
                  fill="#10B981"
                  fillOpacity={0.12}
                  stroke="#10B981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />
                {/* Normal Lower Diastolic (60 to 80) */}
                <ReferenceArea
                  y1={60}
                  y2={80}
                  fill="#10B981"
                  fillOpacity={0.08}
                  stroke="#10B981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.3}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => (
                    <span className="text-xs font-bold text-[#0E1B2C] dark:text-white mx-1">
                      {val === 'systolic' ? 'Upper (Systolic)' : 'Lower (Diastolic)'}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="systolic"
                  stroke="#FF6B4A"
                  strokeWidth={3.5}
                  dot={{ r: 4.5, fill: '#FF6B4A' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="diastolic"
                  stroke="#12B5A6"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: '#12B5A6' }}
                  activeDot={{ r: 6 }}
                />
              </>
            )}

            {type === 'sugar' && (
              <>
                {/* Normal Sugar band 70-140 */}
                <ReferenceArea
                  y1={70}
                  y2={140}
                  fill="#10B981"
                  fillOpacity={0.15}
                  stroke="#10B981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />
                <Line
                  type="monotone"
                  dataKey="sugar"
                  name="sugar"
                  stroke="#12B5A6"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#12B5A6' }}
                  activeDot={{ r: 7 }}
                />
              </>
            )}

            {type === 'weight' && (
              <Line
                type="monotone"
                dataKey="weight"
                name="weight"
                stroke="#3B82F6"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#3B82F6' }}
                activeDot={{ r: 7 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
