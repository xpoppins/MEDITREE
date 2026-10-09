import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Heart,
  Scale,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api/client';
import { BigButton } from '../components/BigButton';
import { NumberPad } from '../components/NumberPad';
import { PaywallSheet } from '../components/PaywallSheet';
import { TopHeader } from '../components/TopHeader';
import { VoiceInput } from '../components/VoiceInput';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { Member, ReadingType, SugarContext } from '../types';
import { validateInputRange } from '../utils/healthRules';
import { ParsedSpeechData } from '../utils/speechParser';
import {
  formatLiveIST,
  formatStoredToIST,
  getISTDateTimeLocal,
  istDateTimeLocalToISO,
} from '../utils/timeUtils';
import { createOrder, verifyPayment } from '../services/payments';

export const AddReading: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isManager, members } = useAuth();
  const { language } = usePreferences();

  // Selected member: If member role, locked to their own ID. If manager, pick step or initial query.
  const queryParams = new URLSearchParams(location.search);
  const initialMemberId = queryParams.get('memberId') || (isManager ? '' : user?.memberId || '');

  const [step, setStep] = useState<number>(initialMemberId ? 2 : 1);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId);
  const [readingType, setReadingType] = useState<ReadingType>('bp');

  // Input fields
  // Active BP field: 'systolic' | 'diastolic' | 'pulse'
  const [activeBpField, setActiveBpField] = useState<'systolic' | 'diastolic' | 'pulse'>('systolic');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');

  // Sugar
  const [sugar, setSugar] = useState('');
  const [sugarContext, setSugarContext] = useState<SugarContext>('fasting');

  // Weight
  const [weightKg, setWeightKg] = useState('');

  // Date / Time: Defaults to live Indian Standard Time (IST) ticker
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [liveTime, setLiveTime] = useState<Date>(() => new Date());
  const [takenAt, setTakenAt] = useState<string>(() => getISTDateTimeLocal());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isCustomTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      setLiveTime(now);
      setTakenAt(getISTDateTimeLocal(now));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCustomTime]);

  // Validation warning modal/inline
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [warningConfirmed, setWarningConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Paywall
  const [paywall, setPaywall] = useState<{
    isOpen: boolean;
    price: { amount: number; offer: boolean; regular: number };
    used: number;
    freeLimit: number;
  }>({ isOpen: false, price: { amount: 0, offer: false, regular: 0 }, used: 0, freeLimit: 5 });
  const [paying, setPaying] = useState(false);

  const currentMember = members.find((m) => m.id === selectedMemberId);

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    setFormError('');
    if (readingType === 'bp') {
      if (activeBpField === 'systolic') {
        if (systolic.length < 3) {
          const next = systolic + digit;
          setSystolic(next);
          // Auto advance to diastolic after 3 digits or if >= 100
          if (next.length === 3 || parseInt(next, 10) >= 140) {
            setActiveBpField('diastolic');
          }
        }
      } else if (activeBpField === 'diastolic') {
        if (diastolic.length < 3) {
          const next = diastolic + digit;
          setDiastolic(next);
        }
      } else if (activeBpField === 'pulse') {
        if (pulse.length < 3) {
          setPulse(pulse + digit);
        }
      }
    } else if (readingType === 'sugar') {
      if (sugar.length < 3) {
        setSugar(sugar + digit);
      }
    } else if (readingType === 'weight') {
      if (digit === '.' && weightKg.includes('.')) return;
      if (weightKg.length < 5) {
        setWeightKg(weightKg + digit);
      }
    }
  };

  const handleBackspace = () => {
    if (readingType === 'bp') {
      if (activeBpField === 'systolic') {
        setSystolic(systolic.slice(0, -1));
      } else if (activeBpField === 'diastolic') {
        if (!diastolic) {
          setActiveBpField('systolic');
        } else {
          setDiastolic(diastolic.slice(0, -1));
        }
      } else if (activeBpField === 'pulse') {
        setPulse(pulse.slice(0, -1));
      }
    } else if (readingType === 'sugar') {
      setSugar(sugar.slice(0, -1));
    } else if (readingType === 'weight') {
      setWeightKg(weightKg.slice(0, -1));
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
    }
  };

  // Voice speech parsed callback
  const handleVoiceResult = (data: ParsedSpeechData) => {
    if (data.type) {
      setReadingType(data.type);
    }
    if (data.systolic) setSystolic(data.systolic.toString());
    if (data.diastolic) setDiastolic(data.diastolic.toString());
    if (data.pulse) setPulse(data.pulse.toString());
    if (data.sugar) setSugar(data.sugar.toString());
    if (data.sugarContext) setSugarContext(data.sugarContext);
    if (data.weightKg) setWeightKg(data.weightKg.toString());
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const order = await createOrder();
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'MediTree',
        description: '6 months premium for your family',
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#0F5C5C' },
        handler: async (resp: any) => {
          await verifyPayment({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          setPaywall((p) => ({ ...p, isOpen: false }));
          handleSave();
        },
      });
      rzp.open();
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setPaying(false);
    }
  };

  const handleSave = async () => {
    setFormError('');

    // Pre-validation
    if (readingType === 'bp') {
      const s = parseInt(systolic, 10);
      const d = parseInt(diastolic, 10);
      const p = pulse ? parseInt(pulse, 10) : undefined;
      if (!s || !d) {
        setFormError(language === 'hi' ? 'कृपया ऊपर और नीचे दोनों संख्याएं दर्ज करें' : 'Please enter both Upper and Lower numbers');
        return;
      }

      // Check range bounds
      if (!warningConfirmed) {
        const rangeCheck = validateInputRange('bp', { systolic: s, diastolic: d, pulse: p });
        if (rangeCheck.isUnusual) {
          setValidationWarning(language === 'hi' ? rangeCheck.warningMsgHi || '' : rangeCheck.warningMsg || '');
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
          addedBy: user?.id,
        });
        navigate('/result', { state: { reading: created, memberName: currentMember?.name } });
      } catch (err: any) {
        if (err.message === 'PAYWALL' || err.message?.includes('Free readings finished')) {
          setPaywall({ isOpen: true, price: err.price || { amount: 1100, offer: true, regular: 9900 }, used: err.used || 5, freeLimit: 5 });
        } else {
          setFormError(err.message || 'Failed to save reading');
        }
      } finally {
        setSaving(false);
      }
    } else if (readingType === 'sugar') {
      const s = parseInt(sugar, 10);
      if (!s) {
        setFormError(language === 'hi' ? 'कृपया शुगर की संख्या दर्ज करें' : 'Please enter the sugar value');
        return;
      }

      if (!warningConfirmed) {
        const rangeCheck = validateInputRange('sugar', { sugar: s });
        if (rangeCheck.isUnusual) {
          setValidationWarning(language === 'hi' ? rangeCheck.warningMsgHi || '' : rangeCheck.warningMsg || '');
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
          addedBy: user?.id,
        });
        navigate('/result', { state: { reading: created, memberName: currentMember?.name } });
      } catch (err: any) {
        if (err.message === 'PAYWALL' || err.message?.includes('Free readings finished')) {
          setPaywall({ isOpen: true, price: err.price || { amount: 1100, offer: true, regular: 9900 }, used: err.used || 5, freeLimit: 5 });
        } else {
          setFormError(err.message || 'Failed to save reading');
        }
      } finally {
        setSaving(false);
      }
    } else if (readingType === 'weight') {
      const w = parseFloat(weightKg);
      if (!w) {
        setFormError(language === 'hi' ? 'कृपया वज़न दर्ज करें' : 'Please enter weight');
        return;
      }

      if (!warningConfirmed) {
        const rangeCheck = validateInputRange('weight', { weightKg: w });
        if (rangeCheck.isUnusual) {
          setValidationWarning(language === 'hi' ? rangeCheck.warningMsgHi || '' : rangeCheck.warningMsg || '');
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
          addedBy: user?.id,
        });
        navigate('/result', { state: { reading: created, memberName: currentMember?.name } });
      } catch (err: any) {
        if (err.message === 'PAYWALL' || err.message?.includes('Free readings finished')) {
          setPaywall({ isOpen: true, price: err.price || { amount: 1100, offer: true, regular: 9900 }, used: err.used || 5, freeLimit: 5 });
        } else {
          setFormError(err.message || 'Failed to save reading');
        }
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-28 pb-safe transition-colors">
      <TopHeader />

      <main className="max-w-md md:max-w-lg mx-auto p-4 md:p-6">
        {/* Top Back / Step Tracker */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2 && isManager) setStep(1);
              else navigate('/');
            }}
            className="flex items-center gap-1.5 text-lg font-bold text-[#0F5C5C] dark:text-[#12B5A6] py-2 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>{language === 'hi' ? 'पीछे' : 'Back'}</span>
          </button>

          <span className="text-sm font-extrabold text-[#0F5C5C] dark:text-[#12B5A6] bg-[#E7F3F3] dark:bg-[#12B5A6]/20 px-3.5 py-1 rounded-full">
            {language === 'hi' ? `चरण ${step} / 3` : `Step ${step} of 3`}
          </span>
        </div>

        {/* STEP 1: PICK WHO (Skipped for members; manager picks member avatar) */}
        {step === 1 && isManager && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center my-2">
              <h2 className="text-3xl font-black text-[#0F5C5C] dark:text-[#12B5A6]">
                {language === 'hi' ? 'किसके लिए माप दर्ज कर रहे हैं?' : 'Whose reading is this?'}
              </h2>
              <p className="text-base text-[#1F2933]/70 dark:text-[#A0B0C4] font-semibold mt-1">
                {language === 'hi' ? 'सदस्य का नाम चुनें' : 'Tap a family member to continue'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-4">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    setStep(2);
                  }}
                  className={`p-5 rounded-[24px] bg-white dark:bg-[#0E1B2C] border-2 text-center transition-all cursor-pointer active:scale-95 shadow-sm ${
                    selectedMemberId === member.id
                      ? 'border-[#0F5C5C] dark:border-[#12B5A6] bg-[#E7F3F3] dark:bg-[#102336]'
                      : 'border-[#0F5C5C]/15 dark:border-white/10 hover:border-[#0F5C5C] dark:hover:border-[#12B5A6]'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#0F5C5C] text-white flex items-center justify-center text-3xl font-black mb-2 shadow-xs">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-black text-[#1F2933] dark:text-white truncate">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-[#1F2933]/70 dark:text-[#A0B0C4] truncate">
                    {member.relation}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: THREE GIANT TILES (Blood Pressure, Sugar, Weight) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center my-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F5C5C] dark:text-[#12B5A6] bg-[#E7F3F3] dark:bg-[#12B5A6]/20 px-3 py-1 rounded-full">
                {currentMember?.name}
              </span>
              <h2 className="text-3xl font-black text-[#0F5C5C] dark:text-[#12B5A6] mt-2">
                {language === 'hi' ? 'क्या नापा है?' : 'What did you check?'}
              </h2>
              <p className="text-base text-[#1F2933]/70 dark:text-[#A0B0C4] font-semibold mt-1">
                {language === 'hi' ? 'नीचे से एक विकल्प चुनें' : 'Choose one of the 3 tests below'}
              </p>
            </div>

            <div className="space-y-4 mt-6">
              {/* Tile 1: Blood Pressure */}
              <button
                type="button"
                onClick={() => {
                  setReadingType('bp');
                  setStep(3);
                }}
                className="w-full min-h-[96px] p-5 rounded-[26px] bg-white dark:bg-[#0E1B2C] border-2 border-[#0F5C5C]/20 dark:border-white/10 hover:border-[#0F5C5C] dark:hover:border-[#12B5A6] flex items-center gap-4 text-left shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-[20px] bg-[#FEEEEE] dark:bg-[#D64545]/20 text-[#D64545] flex items-center justify-center shrink-0">
                  <Heart className="w-9 h-9 fill-[#D64545]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1F2933] dark:text-white">
                    {language === 'hi' ? 'रक्तचाप (Blood Pressure)' : 'Blood Pressure (BP)'}
                  </h3>
                  <p className="text-base font-semibold text-[#1F2933]/70 dark:text-[#A0B0C4]">
                    {language === 'hi' ? 'ऊपर और नीचे की संख्या (उदा. 120/80)' : 'Upper and Lower numbers (e.g. 120 / 80)'}
                  </p>
                </div>
              </button>

              {/* Tile 2: Blood Sugar */}
              <button
                type="button"
                onClick={() => {
                  setReadingType('sugar');
                  setStep(3);
                }}
                className="w-full min-h-[96px] p-5 rounded-[26px] bg-white dark:bg-[#0E1B2C] border-2 border-[#0F5C5C]/20 dark:border-white/10 hover:border-[#0F5C5C] dark:hover:border-[#12B5A6] flex items-center gap-4 text-left shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-[20px] bg-[#E8F7EE] dark:bg-[#1E8E4E]/20 text-[#1E8E4E] flex items-center justify-center shrink-0">
                  <Activity className="w-9 h-9" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1F2933] dark:text-white">
                    {language === 'hi' ? 'ब्लड शुगर (Blood Sugar)' : 'Blood Sugar'}
                  </h3>
                  <p className="text-base font-semibold text-[#1F2933]/70 dark:text-[#A0B0C4]">
                    {language === 'hi' ? 'खाली पेट या खाने के बाद (उदा. 110)' : 'Fasting or After food (e.g. 110 mg/dL)'}
                  </p>
                </div>
              </button>

              {/* Tile 3: Weight */}
              <button
                type="button"
                onClick={() => {
                  setReadingType('weight');
                  setStep(3);
                }}
                className="w-full min-h-[96px] p-5 rounded-[26px] bg-white dark:bg-[#0E1B2C] border-2 border-[#0F5C5C]/20 dark:border-white/10 hover:border-[#0F5C5C] dark:hover:border-[#12B5A6] flex items-center gap-4 text-left shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-[20px] bg-[#EBF3FF] dark:bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Scale className="w-9 h-9" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1F2933] dark:text-white">
                    {language === 'hi' ? 'शरीर का वज़न (Weight)' : 'Body Weight'}
                  </h3>
                  <p className="text-base font-semibold text-[#1F2933]/70 dark:text-[#A0B0C4]">
                    {language === 'hi' ? 'किलोग्राम में (उदा. 68.5 kg)' : 'In Kilograms (e.g. 68.5 kg)'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CUSTOM LARGE NUMBER PAD & ENTRY */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header info */}
            <div className="flex items-center justify-between bg-white dark:bg-[#0E1B2C] px-4 py-2.5 rounded-2xl border border-[#0F5C5C]/15 dark:border-white/10 shadow-2xs">
              <span className="font-extrabold text-[#0F5C5C] dark:text-[#12B5A6] text-base">
                👤 {currentMember?.name}
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-[#FF7A59] hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'जांच बदलें' : 'Change test'}
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#FEEEEE] dark:bg-[#D64545]/20 border-2 border-[#D64545] text-[#D64545] dark:text-[#FF8080] font-bold text-center">
                {formError}
              </div>
            )}

            {/* Voice Input "Say it" button */}
            <VoiceInput onParsedResult={handleVoiceResult} targetType={readingType} />

            {/* INPUT FIELDS: SPECIFIC TO READING TYPE */}
            {readingType === 'bp' && (
              <div className="card-soft p-4 md:p-5 bg-white dark:bg-[#0E1B2C] border border-black/8 dark:border-white/10 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Upper (Systolic) */}
                  <div
                    onClick={() => setActiveBpField('systolic')}
                    className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                      activeBpField === 'systolic'
                        ? 'border-[#0F5C5C] dark:border-[#12B5A6] bg-[#E7F3F3] dark:bg-[#12B5A6]/20 ring-4 ring-[#0F5C5C]/15 dark:ring-[#12B5A6]/20'
                        : 'border-[#0F5C5C]/20 dark:border-white/10 bg-[#F9FAFA] dark:bg-[#142234]'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase text-[#1F2933]/70 dark:text-[#A0B0C4]">
                      {language === 'hi' ? 'ऊपर (Upper)' : 'Upper (Systolic)'}
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-[#0F5C5C] dark:text-[#12B5A6] h-12 flex items-center justify-center">
                      {systolic || <span className="opacity-25 font-light">120</span>}
                    </p>
                    <span className="text-xs font-semibold text-[#1F2933]/60 dark:text-[#7E90A5]">mmHg</span>
                  </div>

                  {/* Lower (Diastolic) */}
                  <div
                    onClick={() => setActiveBpField('diastolic')}
                    className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                      activeBpField === 'diastolic'
                        ? 'border-[#FF7A59] bg-[#FFF2F0] dark:bg-[#FF6B4A]/20 ring-4 ring-[#FF7A59]/15'
                        : 'border-[#0F5C5C]/20 dark:border-white/10 bg-[#F9FAFA] dark:bg-[#142234]'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase text-[#1F2933]/70 dark:text-[#A0B0C4]">
                      {language === 'hi' ? 'नीचे (Lower)' : 'Lower (Diastolic)'}
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-[#FF7A59] h-12 flex items-center justify-center">
                      {diastolic || <span className="opacity-25 font-light">80</span>}
                    </p>
                    <span className="text-xs font-semibold text-[#1F2933]/60 dark:text-[#7E90A5]">mmHg</span>
                  </div>
                </div>

                {/* Optional Pulse */}
                <div
                  onClick={() => setActiveBpField('pulse')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer flex items-center justify-between px-4 transition-all ${
                    activeBpField === 'pulse'
                      ? 'border-[#0F5C5C] dark:border-[#12B5A6] bg-[#E7F3F3] dark:bg-[#12B5A6]/20 ring-2 ring-[#0F5C5C]/15'
                      : 'border-[#0F5C5C]/15 dark:border-white/10 bg-white dark:bg-[#142234]'
                  }`}
                >
                  <span className="text-sm font-bold text-[#1F2933]/80 dark:text-[#A0B0C4]">
                    {language === 'hi' ? 'नाड़ी की गति (Pulse / धड़कन)' : 'Pulse (Heart rate) - Optional'}
                  </span>
                  <span className="text-2xl font-black text-[#0F5C5C] dark:text-[#12B5A6]">
                    {pulse ? `${pulse} bpm` : '---'}
                  </span>
                </div>
              </div>
            )}

            {/* SUGAR ENTRY */}
            {readingType === 'sugar' && (
              <div className="card-soft p-4 md:p-5 bg-white dark:bg-[#0E1B2C] border border-black/8 dark:border-white/10 shadow-sm space-y-4">
                {/* Big Context Selector (3 choices) */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1F2933]/70 dark:text-[#A0B0C4] mb-2 text-center">
                    {language === 'hi' ? 'कब नापा गया था?' : 'When was this taken?'}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'fasting', en: 'Before food', hi: 'खाली पेट' },
                        { id: 'after_meal', en: 'After food', hi: 'खाने के बाद' },
                        { id: 'random', en: 'Anytime', hi: 'दिन में कभी भी' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSugarContext(c.id)}
                        className={`min-h-[54px] px-2 py-1.5 rounded-2xl text-sm font-extrabold text-center transition-all cursor-pointer ${
                          sugarContext === c.id
                            ? 'bg-[#0F5C5C] dark:bg-[#12B5A6] text-white dark:text-[#0E1B2C] shadow-md'
                            : 'bg-[#F2F6F6] dark:bg-[#17263A] text-[#0F5C5C] dark:text-[#A0B0C4] hover:bg-[#E7F3F3] dark:hover:bg-[#1F334D]'
                        }`}
                      >
                        {language === 'hi' ? c.hi : c.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Sugar Display Box */}
                <div className="p-4 rounded-2xl bg-[#E7F3F3] dark:bg-[#102336] border-2 border-[#0F5C5C] dark:border-[#12B5A6] text-center">
                  <p className="text-xs font-bold uppercase text-[#0F5C5C] dark:text-[#12B5A6]">
                    {language === 'hi' ? 'शुगर का स्तर' : 'Blood Sugar Value'}
                  </p>
                  <div className="flex items-baseline justify-center gap-2 my-1">
                    <span className="text-5xl font-black text-[#0F5C5C] dark:text-white">
                      {sugar || <span className="opacity-25 font-light">120</span>}
                    </span>
                    <span className="text-xl font-bold text-[#0F5C5C] dark:text-[#12B5A6]">mg/dL</span>
                  </div>
                </div>
              </div>
            )}

            {/* WEIGHT ENTRY */}
            {readingType === 'weight' && (
              <div className="card-soft p-4 md:p-5 bg-white dark:bg-[#0E1B2C] border border-black/8 dark:border-white/10 shadow-sm space-y-3">
                <div className="p-4 rounded-2xl bg-[#E7F3F3] dark:bg-[#102336] border-2 border-[#0F5C5C] dark:border-[#12B5A6] text-center">
                  <p className="text-xs font-bold uppercase text-[#0F5C5C] dark:text-[#12B5A6]">
                    {language === 'hi' ? 'वज़न (Weight in kg)' : 'Weight in Kilograms'}
                  </p>
                  <div className="flex items-baseline justify-center gap-2 my-1">
                    <span className="text-5xl font-black text-[#0F5C5C] dark:text-white">
                      {weightKg || <span className="opacity-25 font-light">70.0</span>}
                    </span>
                    <span className="text-xl font-bold text-[#0F5C5C] dark:text-[#12B5A6]">kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* DATE & TIME (Defaults to LIVE IST, with "Change" toggle) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-sm text-[#1F2933]/80 dark:text-white/80">
              <div className="flex items-center gap-2 font-bold min-w-0">
                <Clock className="w-4 h-4 text-[#0F5C5C] dark:text-[#12B5A6] shrink-0" />
                <span className="truncate">
                  {isCustomTime
                    ? formatStoredToIST(takenAt, language)
                    : formatLiveIST(liveTime, language, true)}
                </span>
                {!isCustomTime && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F8F1] dark:bg-[#1FA971]/20 text-[#1FA971] text-[10px] font-black uppercase tracking-wider shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA971] animate-pulse" />
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
                    className="text-xs font-bold text-[#FF6B4A] hover:underline cursor-pointer"
                  >
                    {language === 'hi' ? 'लाइव समय रीसेट करें' : 'Reset to Live'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-xs font-bold text-[#0F5C5C] dark:text-[#12B5A6] underline cursor-pointer"
                >
                  {showDatePicker
                    ? (language === 'hi' ? 'छुपाएं' : 'Hide')
                    : (language === 'hi' ? 'तारीख/समय बदलें' : 'Change date/time')}
                </button>
              </div>
            </div>

            {showDatePicker && (
              <div className="p-3 bg-white dark:bg-[#17263A] rounded-2xl border border-[#0F5C5C]/20 dark:border-white/10 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="time-picker" className="block text-xs font-bold text-[#1F2933] dark:text-white">
                    {language === 'hi' ? 'माप का सही समय चुनें (IST):' : 'Select measurement date & time (IST):'}
                  </label>
                  <span className="text-[10px] font-bold text-[#7E90A5]">
                    IST (UTC+5:30)
                  </span>
                </div>
                <input
                  id="time-picker"
                  type="datetime-local"
                  value={takenAt}
                  max={getISTDateTimeLocal()}
                  onChange={(e) => {
                    setTakenAt(e.target.value);
                    setIsCustomTime(true);
                  }}
                  className="w-full p-2.5 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#0E1B2C] text-[#0E1B2C] dark:text-white text-base font-bold"
                />
              </div>
            )}

            {/* CUSTOM NUMBER PAD */}
            <NumberPad
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onClear={handleClear}
              allowDecimal={readingType === 'weight'}
            />

            {/* ONE HUGE SAVE BUTTON */}
            <div className="pt-2">
              <BigButton
                variant="coral"
                loading={saving}
                onClick={handleSave}
                icon={<Check className="w-8 h-8" strokeWidth={3} />}
              >
                {language === 'hi' ? 'माप सुरक्षित करें (Save)' : 'Save Reading'}
              </BigButton>
            </div>
          </div>
        )}

        {/* VALIDATION WARNING DIALOG (Friendly) */}
        {validationWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-[28px] bg-[#FFF9F0] dark:bg-[#0E1B2C] border-2 border-[#E0A100] p-6 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-[#FEF8E7] dark:bg-[#E0A100]/20 text-[#C58500] dark:text-[#FFB020] flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-9 h-9" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-[#1F2933] dark:text-white">
                {language === 'hi' ? 'एक बार जांच लें' : 'Please check the number'}
              </h3>
              <p className="text-lg font-bold text-[#8A5800] dark:text-[#F3C465] mt-2">
                {validationWarning}
              </p>
              <p className="text-sm text-[#1F2933]/70 dark:text-[#A0B0C4] mt-2 font-medium">
                {language === 'hi'
                  ? 'यदि मशीन में यही संख्या दिख रही है, तो आप पुष्टि करके आगे बढ़ सकते हैं।'
                  : 'If this matches your monitor screen exactly, tap confirm to save.'}
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setWarningConfirmed(true);
                    setValidationWarning(null);
                    setTimeout(handleSave, 50);
                  }}
                  className="w-full min-h-[58px] rounded-[20px] bg-[#0F5C5C] dark:bg-[#12B5A6] text-white text-lg font-bold cursor-pointer hover:opacity-90 active:scale-98"
                >
                  {language === 'hi' ? 'हाँ, यह संख्या सही है' : 'Yes, this number is correct'}
                </button>
                <button
                  type="button"
                  onClick={() => setValidationWarning(null)}
                  className="w-full min-h-[52px] rounded-[18px] bg-white dark:bg-[#17263A] border border-[#0F5C5C]/30 dark:border-white/20 text-[#0F5C5C] dark:text-[#12B5A6] text-base font-bold cursor-pointer hover:opacity-90 active:scale-98"
                >
                  {language === 'hi' ? 'संख्या बदलें' : 'Let me re-enter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYWALL SHEET */}
        <PaywallSheet
          isOpen={paywall.isOpen}
          onClose={() => setPaywall((p) => ({ ...p, isOpen: false }))}
          price={paywall.price}
          used={paywall.used}
          freeLimit={paywall.freeLimit}
          isManager={isManager}
          onPay={handlePay}
          paying={paying}
        />
      </main>
    </div>
  );
};
