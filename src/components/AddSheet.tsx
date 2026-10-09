import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Heart,
  Mic,
  Scale,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { Reading, ReadingType, SugarContext } from '../types';
import { validateInputRange } from '../utils/healthRules';
import { ParsedSpeechData, parseHealthSpeech } from '../utils/speechParser';
import {
  formatLiveIST,
  formatStoredToIST,
  getISTDateTimeLocal,
  istDateTimeLocalToISO,
} from '../utils/timeUtils';
import { VoiceInput } from './VoiceInput';

interface AddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedReading: Reading, memberName: string) => void;
  defaultMemberId?: string;
}

export const AddSheet: React.FC<AddSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMemberId,
}) => {
  const { user, isManager, members } = useAuth();
  const { language } = usePreferences();

  // Selected member: for members locked to own id; for manager defaults to prop or first member
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    if (!isManager && user?.memberId) return user.memberId;
    return defaultMemberId || (members[0]?.id || '');
  });

  const [readingType, setReadingType] = useState<ReadingType>('bp');

  // Input states
  const [activeBpField, setActiveBpField] = useState<'systolic' | 'diastolic' | 'pulse'>('systolic');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');

  const [sugar, setSugar] = useState('');
  const [sugarContext, setSugarContext] = useState<SugarContext>('fasting');

  const [weightKg, setWeightKg] = useState('');
  const [pulseOnly, setPulseOnly] = useState('');

  // Date / Time: Defaults to live Indian Standard Time (IST) ticker
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [liveTime, setLiveTime] = useState<Date>(() => new Date());
  const [takenAt, setTakenAt] = useState(() => getISTDateTimeLocal());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isCustomTime || !isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      setLiveTime(now);
      setTakenAt(getISTDateTimeLocal(now));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCustomTime, isOpen]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [warningAccepted, setWarningAccepted] = useState(false);

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.id === selectedMemberId);

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    setFormError('');
    if (readingType === 'bp') {
      if (activeBpField === 'systolic') {
        if (systolic.length < 3) {
          const next = systolic + digit;
          setSystolic(next);
          if (next.length === 3 || parseInt(next, 10) >= 140) {
            setActiveBpField('diastolic');
          }
        }
      } else if (activeBpField === 'diastolic') {
        if (diastolic.length < 3) {
          setDiastolic(diastolic + digit);
        }
      } else if (activeBpField === 'pulse') {
        if (pulse.length < 3) {
          setPulse(pulse + digit);
        }
      }
    } else if (readingType === 'sugar') {
      if (sugar.length < 3) setSugar(sugar + digit);
    } else if (readingType === 'weight') {
      if (digit === '.' && weightKg.includes('.')) return;
      if (weightKg.length < 5) setWeightKg(weightKg + digit);
    } else if (readingType === 'pulse') {
      if (pulseOnly.length < 3) setPulseOnly(pulseOnly + digit);
    }
  };

  const handleBackspace = () => {
    if (readingType === 'bp') {
      if (activeBpField === 'systolic') setSystolic(systolic.slice(0, -1));
      else if (activeBpField === 'diastolic') {
        if (!diastolic) setActiveBpField('systolic');
        else setDiastolic(diastolic.slice(0, -1));
      } else if (activeBpField === 'pulse') setPulse(pulse.slice(0, -1));
    } else if (readingType === 'sugar') {
      setSugar(sugar.slice(0, -1));
    } else if (readingType === 'weight') {
      setWeightKg(weightKg.slice(0, -1));
    } else if (readingType === 'pulse') {
      setPulseOnly(pulseOnly.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (readingType === 'bp') {
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setActiveBpField('systolic');
    } else if (readingType === 'sugar') {
      setSugar('');
    } else if (readingType === 'weight') {
      setWeightKg('');
    } else if (readingType === 'pulse') {
      setPulseOnly('');
    }
  };

  const handleVoiceData = (data: ParsedSpeechData) => {
    if (data.type) setReadingType(data.type);
    if (data.systolic) setSystolic(data.systolic.toString());
    if (data.diastolic) setDiastolic(data.diastolic.toString());
    if (data.pulse) setPulse(data.pulse.toString());
    if (data.sugar) setSugar(data.sugar.toString());
    if (data.sugarContext) setSugarContext(data.sugarContext);
    if (data.weightKg) setWeightKg(data.weightKg.toString());
  };

  const handleSave = async () => {
    setFormError('');

    if (readingType === 'bp') {
      const s = parseInt(systolic, 10);
      const d = parseInt(diastolic, 10);
      const p = pulse ? parseInt(pulse, 10) : undefined;
      if (!s || !d) {
        setFormError(language === 'hi' ? 'कृपया ऊपर और नीचे दोनों संख्याएं दर्ज करें' : 'Please enter both Upper and Lower numbers');
        return;
      }
      if (!warningAccepted) {
        const v = validateInputRange('bp', { systolic: s, diastolic: d, pulse: p });
        if (v.isUnusual) {
          setWarningMsg(language === 'hi' ? v.warningMsgHi || '' : v.warningMsg || '');
          return;
        }
      }

      setSaving(true);
      try {
        const created = await api.addReading({
          memberId: selectedMemberId,
          familyId: user?.familyId || 'f1',
          type: 'bp',
          systolic: s,
          diastolic: d,
          pulse: p,
          takenAt: isCustomTime ? istDateTimeLocalToISO(takenAt) : new Date().toISOString(),
          addedByUid: user?.id,
        });
        onSuccess(created, currentMember?.name || 'Member');
      } catch (err: any) {
        setFormError(err.message || 'Failed to save');
      } finally {
        setSaving(false);
      }
    } else if (readingType === 'sugar') {
      const s = parseInt(sugar, 10);
      if (!s) {
        setFormError(language === 'hi' ? 'कृपया शुगर की संख्या दर्ज करें' : 'Please enter sugar value');
        return;
      }
      if (!warningAccepted) {
        const v = validateInputRange('sugar', { sugar: s });
        if (v.isUnusual) {
          setWarningMsg(language === 'hi' ? v.warningMsgHi || '' : v.warningMsg || '');
          return;
        }
      }

      setSaving(true);
      try {
        const created = await api.addReading({
          memberId: selectedMemberId,
          familyId: user?.familyId || 'f1',
          type: 'sugar',
          sugar: s,
          sugarContext,
          takenAt: isCustomTime ? istDateTimeLocalToISO(takenAt) : new Date().toISOString(),
          addedByUid: user?.id,
        });
        onSuccess(created, currentMember?.name || 'Member');
      } catch (err: any) {
        setFormError(err.message || 'Failed to save');
      } finally {
        setSaving(false);
      }
    } else if (readingType === 'weight') {
      const w = parseFloat(weightKg);
      if (!w) {
        setFormError(language === 'hi' ? 'कृपया वज़न दर्ज करें' : 'Please enter weight in kg');
        return;
      }
      if (!warningAccepted) {
        const v = validateInputRange('weight', { weightKg: w });
        if (v.isUnusual) {
          setWarningMsg(language === 'hi' ? v.warningMsgHi || '' : v.warningMsg || '');
          return;
        }
      }

      setSaving(true);
      try {
        const created = await api.addReading({
          memberId: selectedMemberId,
          familyId: user?.familyId || 'f1',
          type: 'weight',
          weightKg: w,
          takenAt: isCustomTime ? istDateTimeLocalToISO(takenAt) : new Date().toISOString(),
          addedByUid: user?.id,
        });
        onSuccess(created, currentMember?.name || 'Member');
      } catch (err: any) {
        setFormError(err.message || 'Failed to save');
      } finally {
        setSaving(false);
      }
    } else if (readingType === 'pulse') {
      const p = parseInt(pulseOnly, 10);
      if (!p) {
        setFormError(language === 'hi' ? 'कृपया धड़कन दर्ज करें' : 'Please enter pulse bpm');
        return;
      }

      setSaving(true);
      try {
        const created = await api.addReading({
          memberId: selectedMemberId,
          familyId: user?.familyId || 'f1',
          type: 'pulse',
          pulse: p,
          takenAt: isCustomTime ? istDateTimeLocalToISO(takenAt) : new Date().toISOString(),
          addedByUid: user?.id,
        });
        onSuccess(created, currentMember?.name || 'Member');
      } catch (err: any) {
        setFormError(err.message || 'Failed to save');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[32px] bg-[#F4F6F9] dark:bg-[#0E1B2C] border-t-2 border-[#12B5A6]/30 p-5 md:p-6 pb-8 pb-safe shadow-2xl relative border-x border-black/10 dark:border-white/10">
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20 mx-auto mb-3" />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
              {language === 'hi' ? '+ नया माप जोड़ें' : '+ Add Health Reading'}
            </h3>
            <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {language === 'hi' ? '3 आसान स्टेप्स में रिकॉर्ड करें' : 'Easy 3-tap measurement entry'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#0E1B2C] dark:text-white shadow-2xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Close add reading sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pick Member (For Manager) */}
        {isManager && (
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5 px-1">
              {language === 'hi' ? 'किसके लिए माप है?' : 'Select Family Member:'}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                    selectedMemberId === m.id
                      ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] shadow-xs'
                      : 'bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/10 dark:border-white/10'
                  }`}
                >
                  {m.name} ({m.relation})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Big Type Selection Tiles (BP, Sugar, Weight, Pulse) */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { id: 'bp', label: 'BP', icon: <Heart className="w-5 h-5 fill-current" /> },
            { id: 'sugar', label: language === 'hi' ? 'शुगर' : 'Sugar', icon: <Activity className="w-5 h-5" /> },
            { id: 'weight', label: language === 'hi' ? 'वज़न' : 'Weight', icon: <Scale className="w-5 h-5" /> },
            { id: 'pulse', label: language === 'hi' ? 'धड़कन' : 'Pulse', icon: <Heart className="w-5 h-5" /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setReadingType(t.id as ReadingType)}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 font-heading font-black text-sm transition-all cursor-pointer ${
                readingType === t.id
                  ? 'bg-gradient-to-tr from-[#FF6B4A] to-[#FF9028] text-white shadow-md'
                  : 'bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/8 dark:border-white/10 hover:bg-[#E6F8F6] dark:hover:bg-[#12B5A6]/20'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Voice Input "Say it" button */}
        <div className="mb-4">
          <VoiceInput onParsedResult={handleVoiceData} targetType={readingType} />
        </div>

        {/* Errors */}
        {formError && (
          <div className="p-3 mb-3 bg-[#FEECEE] border border-[#E5484D] text-[#E5484D] font-bold text-sm rounded-xl text-center">
            {formError}
          </div>
        )}

        {/* TYPE SPECIFIC INPUT FIELDS */}
        {readingType === 'bp' && (
          <div className="card-wellness p-4 bg-white space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveBpField('systolic')}
                className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                  activeBpField === 'systolic'
                    ? 'border-[#FF6B4A] bg-[#FFF0E8] ring-4 ring-[#FF6B4A]/15'
                    : 'border-black/10 bg-[#F9FBFC]'
                }`}
              >
                <p className="text-[11px] font-black uppercase text-[#7E90A5]">Upper (Systolic)</p>
                <p className="text-4xl font-black text-[#FF6B4A] font-heading h-12 flex items-center justify-center">
                  {systolic || <span className="opacity-25 font-light">120</span>}
                </p>
                <span className="text-[11px] font-bold text-[#7E90A5]">mmHg</span>
              </div>

              <div
                onClick={() => setActiveBpField('diastolic')}
                className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                  activeBpField === 'diastolic'
                    ? 'border-[#12B5A6] bg-[#E6F8F6] ring-4 ring-[#12B5A6]/15'
                    : 'border-black/10 bg-[#F9FBFC]'
                }`}
              >
                <p className="text-[11px] font-black uppercase text-[#7E90A5]">Lower (Diastolic)</p>
                <p className="text-4xl font-black text-[#12B5A6] font-heading h-12 flex items-center justify-center">
                  {diastolic || <span className="opacity-25 font-light">80</span>}
                </p>
                <span className="text-[11px] font-bold text-[#7E90A5]">mmHg</span>
              </div>
            </div>

            {/* Pulse */}
            <div
              onClick={() => setActiveBpField('pulse')}
              className={`p-2.5 rounded-xl border flex items-center justify-between px-3 cursor-pointer ${
                activeBpField === 'pulse' ? 'border-[#FF6B4A] bg-[#FFF0E8] dark:bg-[#FF6B4A]/15' : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#17263A]'
              }`}
            >
              <span className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">Pulse (Heart rate) - Optional</span>
              <span className="text-lg font-black text-[#0E1B2C] dark:text-white">{pulse ? `${pulse} bpm` : '---'}</span>
            </div>
          </div>
        )}

        {readingType === 'sugar' && (
          <div className="card-wellness p-4 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fasting', en: 'Before food', hi: 'खाली पेट' },
                { id: 'after_meal', en: 'After food', hi: 'खाने के बाद' },
                { id: 'random', en: 'Anytime', hi: 'कभी भी' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSugarContext(c.id as SugarContext)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    sugarContext === c.id
                      ? 'bg-[#12B5A6] text-white shadow-xs'
                      : 'bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/5 dark:border-white/10'
                  }`}
                >
                  {language === 'hi' ? c.hi : c.en}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#E6F8F6] dark:bg-[#12B5A6]/15 border-2 border-[#12B5A6]/40 text-center">
              <p className="text-[11px] font-black uppercase text-[#12B5A6]">Sugar Level</p>
              <div className="flex items-baseline justify-center gap-1.5 my-1">
                <span className="text-5xl font-black text-[#0E1B2C] dark:text-white font-heading">
                  {sugar || <span className="opacity-25 font-light">110</span>}
                </span>
                <span className="text-base font-bold text-[#7E90A5] dark:text-[#A0B2C6]">mg/dL</span>
              </div>
            </div>
          </div>
        )}

        {readingType === 'weight' && (
          <div className="card-wellness p-4 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 text-center mb-4">
            <p className="text-[11px] font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6]">Body Weight in Kilograms</p>
            <div className="flex items-baseline justify-center gap-1.5 my-2">
              <span className="text-5xl font-black text-[#0E1B2C] dark:text-white font-heading">
                {weightKg || <span className="opacity-25 font-light">70.0</span>}
              </span>
              <span className="text-base font-bold text-[#7E90A5] dark:text-[#A0B2C6]">kg</span>
            </div>
          </div>
        )}

        {readingType === 'pulse' && (
          <div className="card-wellness p-4 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 text-center mb-4">
            <p className="text-[11px] font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6]">Resting Heart Rate (Pulse)</p>
            <div className="flex items-baseline justify-center gap-1.5 my-2">
              <span className="text-5xl font-black text-[#0E1B2C] dark:text-white font-heading">
                {pulseOnly || <span className="opacity-25 font-light">72</span>}
              </span>
              <span className="text-base font-bold text-[#7E90A5] dark:text-[#A0B2C6]">bpm</span>
            </div>
          </div>
        )}

        {/* Date / Time: Defaults to LIVE IST */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6] mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-4 h-4 text-[#12B5A6] shrink-0" />
            <span className="truncate">
              {isCustomTime
                ? formatStoredToIST(takenAt, language)
                : formatLiveIST(liveTime, language, true)}
            </span>
            {!isCustomTime && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] text-[9px] font-black uppercase tracking-wider shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B5A6] animate-pulse" />
                <span>LIVE IST</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isCustomTime && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomTime(false);
                  setShowDatePicker(false);
                  const now = new Date();
                  setLiveTime(now);
                  setTakenAt(getISTDateTimeLocal(now));
                }}
                className="text-[#FF6B4A] hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'लाइव समय' : 'Reset Live'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-[#12B5A6] underline cursor-pointer"
            >
              {showDatePicker ? 'Hide date' : 'Change date/time'}
            </button>
          </div>
        </div>

        {showDatePicker && (
          <div className="p-3 bg-white dark:bg-[#17263A] rounded-2xl border border-black/10 dark:border-white/10 mb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="sheet-time-picker" className="text-[11px] font-bold text-[#0E1B2C] dark:text-white">
                {language === 'hi' ? 'माप का सही समय (IST):' : 'Select Date & Time (IST):'}
              </label>
              <span className="text-[9px] font-bold text-[#7E90A5]">
                IST (UTC+5:30)
              </span>
            </div>
            <input
              id="sheet-time-picker"
              type="datetime-local"
              value={takenAt}
              max={getISTDateTimeLocal()}
              onChange={(e) => {
                setTakenAt(e.target.value);
                setIsCustomTime(true);
              }}
              className="w-full p-2 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#0E1B2C] text-[#0E1B2C] dark:text-white text-sm font-bold"
            />
          </div>
        )}

        {/* NUMBER PAD */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n.toString())}
              className="numpad-btn"
            >
              {n}
            </button>
          ))}
          {readingType === 'weight' ? (
            <button type="button" onClick={() => handleDigit('.')} className="numpad-btn">
              •
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className="numpad-btn text-base font-extrabold text-[#E5484D]"
            >
              Clear
            </button>
          )}
          <button type="button" onClick={() => handleDigit('0')} className="numpad-btn">
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="numpad-btn text-base font-extrabold text-[#0E1B2C] dark:text-white"
          >
            ⌫
          </button>
        </div>

        {/* ONE BIG SAVE BUTTON */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-action-gradient text-xl"
        >
          <Check className="w-7 h-7" strokeWidth={3} />
          <span>{saving ? 'Saving...' : (language === 'hi' ? 'माप सुरक्षित करें' : 'Save Reading')}</span>
        </button>

        {/* Warning Alert Modal */}
        {warningMsg && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="card-wellness p-6 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 max-w-sm text-center shadow-2xl rounded-3xl">
              <AlertTriangle className="w-12 h-12 text-[#E8A317] mx-auto mb-2" />
              <h4 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading">Check number</h4>
              <p className="text-sm font-bold text-[#E8A317] mt-1">{warningMsg}</p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setWarningAccepted(true);
                    setWarningMsg(null);
                    setTimeout(handleSave, 50);
                  }}
                  className="w-full py-3 bg-[#12B5A6] hover:bg-[#0EA092] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Yes, this is correct
                </button>
                <button
                  type="button"
                  onClick={() => setWarningMsg(null)}
                  className="w-full py-2.5 border border-black/20 dark:border-white/20 rounded-xl text-sm font-bold text-[#0E1B2C] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Change number
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
