import { Check, Plus } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { StatusCard } from '../components/StatusCard';
import { TopHeader } from '../components/TopHeader';
import { usePreferences } from '../context/PreferencesContext';
import { Reading } from '../types';

export const ReadingResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = usePreferences();

  const reading: Reading | undefined = location.state?.reading;
  const memberName: string = location.state?.memberName || 'Family Member';

  if (!reading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] p-6 flex flex-col items-center justify-center max-w-md mx-auto">
        <p className="text-xl font-bold text-[#1F2933]">No reading found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-[#0F5C5C] text-white rounded-2xl font-bold cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Format values
  let headline = '';
  let subValue = '';
  let unit = '';

  if (reading.type === 'bp') {
    headline = `${reading.systolic} / ${reading.diastolic}`;
    unit = 'mmHg';
    if (reading.pulse) {
      subValue = language === 'hi' ? `धड़कन (Pulse): ${reading.pulse} bpm` : `Pulse: ${reading.pulse} bpm`;
    }
  } else if (reading.type === 'sugar') {
    headline = `${reading.sugar}`;
    unit = 'mg/dL';
    const ctx = reading.sugarContext === 'fasting'
      ? (language === 'hi' ? 'खाली पेट (Fasting)' : 'Before food (Fasting)')
      : reading.sugarContext === 'after_meal'
      ? (language === 'hi' ? 'खाने के बाद' : 'After meal')
      : (language === 'hi' ? 'दिन में कभी भी' : 'Anytime');
    subValue = ctx;
  } else if (reading.type === 'weight') {
    headline = `${reading.weightKg}`;
    unit = 'kg';
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24">
      <TopHeader />

      <main className="max-w-md md:max-w-lg mx-auto p-4 md:p-6 space-y-6">
        <div className="text-center my-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F5C5C] bg-[#E7F3F3] px-3.5 py-1 rounded-full">
            {memberName}
          </span>
          <h2 className="text-3xl font-black text-[#0F5C5C] mt-2">
            {language === 'hi' ? 'माप सुरक्षित हो गया' : 'Reading Saved!'}
          </h2>
          <p className="text-sm font-semibold text-[#1F2933]/70 mt-1">
            {new Date(reading.takenAt).toLocaleString()}
          </p>
        </div>

        {/* FULL-WIDTH CARD IN THE STATUS COLOUR WITH BIG ICON AND SIMPLE SENTENCE */}
        <StatusCard
          status={reading.status}
          headlineValue={headline}
          unit={unit}
          subValue={subValue}
          explanation={reading.statusText}
          title={
            reading.type === 'bp'
              ? (language === 'hi' ? 'रक्तचाप परिणाम' : 'Blood Pressure Result')
              : reading.type === 'sugar'
              ? (language === 'hi' ? 'शुगर परिणाम' : 'Blood Sugar Result')
              : (language === 'hi' ? 'वज़न परिणाम' : 'Weight Result')
          }
        />

        {/* ACTIONS: DONE BUTTON & ADD ANOTHER LINK */}
        <div className="space-y-4 pt-4">
          <BigButton
            variant="primary"
            onClick={() => navigate('/')}
            icon={<Check className="w-8 h-8" strokeWidth={3} />}
          >
            {language === 'hi' ? 'हो गया (Done)' : 'Done'}
          </BigButton>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate(`/add-reading?memberId=${reading.memberId}`)}
              className="inline-flex items-center gap-2 text-lg font-bold text-[#FF7A59] hover:underline py-2 px-4 cursor-pointer"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              <span>{language === 'hi' ? 'एक और माप दर्ज करें' : 'Add another reading'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
