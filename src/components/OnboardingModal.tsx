import { ArrowRight, Check, Sparkles, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user } = useAuth();
  const { language } = usePreferences();
  const [step, setStep] = useState(1);

  // Step 1: Name and avatar
  const [name, setName] = useState(user?.name || '');
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Step 2: DOB and gender
  const [dob, setDob] = useState('1958-04-12');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  // Step 3: Height and weight
  const [heightCm, setHeightCm] = useState('168');
  const [weightKg, setWeightKg] = useState('72');

  // Step 4: Health conditions & goals
  const [conditions, setConditions] = useState<string[]>(['Diabetes', 'High BP']);
  const [goals, setGoals] = useState<string[]>(['Control sugar', 'Keep BP stable']);

  if (!isOpen) return null;

  const avatars = ['👨‍🦳', '👵', '👨‍💼', '👩‍💼', '🏃‍♂️', '🧘‍♀️'];
  const allConditions = ['Diabetes', 'High BP', 'Heart', 'Thyroid', 'Kidney', 'None'];
  const allGoals = ['Control sugar', 'Reduce weight', 'Keep BP stable', 'Daily walks', 'Better sleep'];

  const toggleCondition = (c: string) => {
    if (c === 'None') {
      setConditions(['None']);
      return;
    }
    const filtered = conditions.filter((item) => item !== 'None');
    if (filtered.includes(c)) {
      setConditions(filtered.filter((item) => item !== c));
    } else {
      setConditions([...filtered, c]);
    }
  };

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) {
      setGoals(goals.filter((item) => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const handleFinish = async () => {
    try {
      await api.updateProfile({ onboardingCompleted: true, name });
    } catch {
      // ignore
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="card-wellness p-6 bg-white max-w-md w-full relative animate-in zoom-in-95 duration-200">
        {/* Skip button */}
        <button
          type="button"
          onClick={onComplete}
          className="absolute top-5 right-5 text-xs font-bold text-[#7E90A5] hover:text-[#0E1B2C] cursor-pointer"
        >
          {language === 'hi' ? 'छोड़ें (Skip)' : 'Skip for now'}
        </button>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#FF6B4A] mb-1.5">
            <span>
              {language === 'hi' ? `चरण ${step} / 4` : `Step ${step} of 4: Setup Profile`}
            </span>
            <span>{step * 25}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F4F6F9] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FFB020] transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Name and avatar */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-[#0E1B2C] font-heading">
                {language === 'hi' ? 'आपका नाम और अवतार' : 'Welcome to HealthNest!'}
              </h3>
              <p className="text-sm font-semibold text-[#7E90A5] mt-1">
                {language === 'hi' ? 'कृपया अपनी पहचान चुनें' : "Let's personalize your daily health dashboard"}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 my-3">
              {avatars.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarIndex(idx)}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                    avatarIndex === idx
                      ? 'bg-[#E6F8F6] ring-3 ring-[#12B5A6] scale-110 shadow-sm'
                      : 'bg-[#F4F6F9] hover:bg-black/5'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-13 rounded-2xl border-2 border-black/15 px-4 font-bold text-base"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DOB & Gender */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-[#0E1B2C] font-heading">
                {language === 'hi' ? 'आयु एवं लिंग' : 'Age & Gender'}
              </h3>
              <p className="text-sm font-semibold text-[#7E90A5] mt-1">
                Used to tailor accurate BP and Sugar health standards.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-13 rounded-2xl border-2 border-black/15 px-4 font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 rounded-xl font-bold text-sm capitalize transition-all cursor-pointer ${
                      gender === g
                        ? 'bg-[#0E1B2C] text-white shadow-xs'
                        : 'bg-[#F4F6F9] text-[#0E1B2C]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Height & Weight */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-[#0E1B2C] font-heading">
                {language === 'hi' ? 'कद और वज़न' : 'Height & Weight'}
              </h3>
              <p className="text-sm font-semibold text-[#7E90A5] mt-1">
                Computes BMI according to Asian cut-offs automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full h-13 rounded-2xl border-2 border-black/15 px-4 font-bold text-lg text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full h-13 rounded-2xl border-2 border-black/15 px-4 font-bold text-lg text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Conditions & Goals */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-[#0E1B2C] font-heading">
                {language === 'hi' ? 'स्वास्थ्य स्थितियां व लक्ष्य' : 'Conditions & Goals'}
              </h3>
              <p className="text-sm font-semibold text-[#7E90A5] mt-1">
                Tap all that apply to highlight relevant health alerts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] mb-2">
                Health Conditions (Tap chips)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allConditions.map((c) => {
                  const active = conditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCondition(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        active
                          ? 'bg-[#FF6B4A] text-white shadow-xs'
                          : 'bg-[#F4F6F9] text-[#0E1B2C] hover:bg-black/5'
                      }`}
                    >
                      {active && '✓ '}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] mb-2">
                Optional Goals
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allGoals.map((g) => {
                  const active = goals.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        active
                          ? 'bg-[#12B5A6] text-white shadow-xs'
                          : 'bg-[#F4F6F9] text-[#0E1B2C] hover:bg-black/5'
                      }`}
                    >
                      {active && '✓ '}
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-black/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="py-3 px-4 rounded-xl border border-black/20 text-sm font-bold cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn-action-gradient py-3 px-6 text-sm font-bold w-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-action-gradient py-3 px-6 text-sm font-bold w-auto"
            >
              <Check className="w-4 h-4" />
              <span>Finish Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
