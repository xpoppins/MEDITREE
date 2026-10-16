import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Crown,
  FileText,
  Heart,
  HelpCircle,
  Infinity as InfinityIcon,
  Info,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

interface ProSidebarProps {
  isPremium: boolean;
  premiumUntil: string | null;
  price: { amount: number; offer: boolean; regular: number };
  onPay: () => void;
  paying: boolean;
  used?: number;
  freeLimit?: number;
  lastPayment?: {
    amount: number;
    paymentId: string;
    paidAt: string;
    orderId: string;
  } | null;
  memberSince?: string | null;
}

export const ProSidebar: React.FC<ProSidebarProps> = ({
  isPremium,
  premiumUntil,
  price,
  onPay,
  paying,
  used = 0,
  freeLimit = 5,
  lastPayment,
  memberSince,
}) => {
  const { isManager } = useAuth();
  const { language } = usePreferences();
  const [showKnowMore, setShowKnowMore] = useState(false);

  const formatPaise = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

  const daysRemaining = premiumUntil
    ? Math.max(0, Math.ceil((new Date(premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const readingsLeft = Math.max(0, freeLimit - used);
  const isLimitReached = !isPremium && used >= freeLimit;

  return (
    <div className="card-wellness p-4 sm:p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm relative overflow-hidden transition-all">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-black/8 dark:border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isPremium
                ? 'bg-gradient-to-br from-[#FF6B4A] to-[#FFB020] text-white'
                : 'bg-[#F4F6F9] dark:bg-[#17263A] text-[#7E90A5] dark:text-[#A0B2C6]'
            }`}
          >
            <Crown className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-black text-[#0E1B2C] dark:text-white font-heading truncate">
                {isPremium ? 'MEDITREE PRO' : 'MEDITREE'}
              </h3>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  isPremium
                    ? 'bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] dark:text-[#5EEAD4] border border-[#12B5A6]/30'
                    : 'bg-[#FFF0E8] dark:bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/25'
                }`}
              >
                {isPremium
                  ? language === 'hi' ? 'सक्रिय प्रो' : 'PRO Active'
                  : language === 'hi' ? 'मेडिट्री' : 'MEDITREE'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] truncate mt-0.5">
              {isPremium
                ? language === 'hi'
                  ? `${daysRemaining} दिन शेष (सभी सुविधाएं अनलॉक)`
                  : `${daysRemaining} days left (all features unlocked)`
                : language === 'hi'
                ? 'शुरुआती 5 रीडिंग्स मुफ्त हैं'
                : 'First 5 readings are free'}
            </p>
          </div>
        </div>

        {/* Know More Pill Trigger */}
        {!isPremium && (
          <button
            type="button"
            onClick={() => setShowKnowMore(true)}
            className="text-[11px] font-black text-[#12B5A6] dark:text-[#5EEAD4] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 bg-[#E6F8F6] dark:bg-[#12B5A6]/20 px-2 py-1 rounded-lg border border-[#12B5A6]/25 transition-all"
            title="View Pro benefits and full comparison"
          >
            <span>{language === 'hi' ? 'विवरण' : 'Know More'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isPremium ? (
        /* PREMIUM ACTIVE STATE */
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E6F8F6] to-[#F0FDF4] dark:from-[#0B2529] dark:to-[#0B221A] border border-[#12B5A6]/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#12B5A6] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-[#0E1B2C] dark:text-white font-heading">
                {language === 'hi' ? 'पूर्ण परिवार प्रो अनलॉक है' : 'Full Family PRO Unlocked'}
              </p>
              <p className="text-xs font-semibold text-[#4A5B70] dark:text-[#A0B2C6] mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'असीमित रीडिंग्स, सभी सदस्य और इमरजेंसी अलर्ट्स सक्रिय हैं।'
                  : 'Infinite vital readings, all family members & emergency health alerts are active.'}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {[
              {
                icon: InfinityIcon,
                title: language === 'hi' ? 'अनंत रीडिंग्स (कोई सीमा नहीं)' : 'Infinite Readings (Unlimited)',
              },
              {
                icon: Users,
                title: language === 'hi' ? 'परिवार के सभी सदस्य शामिल' : 'All Family Members & Profiles',
              },
              {
                icon: Activity,
                title: language === 'hi' ? 'पूर्ण ट्रैक कंट्रोल व सेफ ज़ोन' : 'Full Track Control & Safe Zones',
              },
              {
                icon: FileText,
                title: language === 'hi' ? 'डॉक्टर प्रिस्क्रिप्शन एक्सपोर्ट' : 'Official Doctor Rx Export',
              },
            ].map((perk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-xs font-bold text-[#0E1B2C] dark:text-white"
              >
                <div className="w-5 h-5 rounded-md bg-[#12B5A6]/15 text-[#12B5A6] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
                  <perk.icon className="w-3.5 h-3.5" />
                </div>
                <span>{perk.title}</span>
              </div>
            ))}
          </div>

          {lastPayment && (
            <div className="p-3 rounded-xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/8 dark:border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7E90A5] dark:text-[#A0B2C6]">
                <span>{language === 'hi' ? 'भुगतान राशि' : 'Amount Paid'}</span>
                <span className="font-black text-[#0E1B2C] dark:text-white">
                  {formatPaise(lastPayment.amount)}
                </span>
              </div>
              <div className="flex justify-between text-[#7E90A5] dark:text-[#A0B2C6]">
                <span>{language === 'hi' ? 'वैधता' : 'Valid Until'}</span>
                <span className="font-bold text-[#0E1B2C] dark:text-white">
                  {premiumUntil ? new Date(premiumUntil).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* BASIC PLAN STATE WITH 5 FREE READINGS + UPGRADE FLOW */
        <div className="space-y-3.5">
          {/* First 5 readings are free progress strip */}
          <div className="p-3.5 rounded-2xl bg-[#FFF9F0] dark:bg-[#132032] border border-[#FFB020]/25 dark:border-[#FFB020]/35">
            <div className="flex items-center justify-between text-xs font-black mb-1.5">
              <span className="flex items-center gap-1.5 text-[#0E1B2C] dark:text-white">
                <Clock className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span>{language === 'hi' ? 'फ्री ट्रायल रीडिंग्स' : 'Free Trial Readings'}</span>
              </span>
              <span
                className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                  isLimitReached
                    ? 'bg-[#FEECEE] text-[#B0282C] dark:bg-[#EF4444]/20 dark:text-[#FF8080]'
                    : 'bg-[#FF6B4A]/10 text-[#FF6B4A] dark:text-[#FFA07A]'
                }`}
              >
                {used} / {freeLimit} {language === 'hi' ? 'प्रयुक्त' : 'Used'}
              </span>
            </div>

            {/* Meter Bar */}
            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden my-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isLimitReached
                    ? 'bg-[#E5484D]'
                    : 'bg-gradient-to-r from-[#FF6B4A] via-[#FF9028] to-[#FFB020]'
                }`}
                style={{ width: `${Math.min((used / freeLimit) * 100, 100)}%` }}
              />
            </div>

            <p className="text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {isLimitReached
                ? language === 'hi'
                  ? '⚠️ ५ मुफ्त रीडिंग्स पूरी हो गईं। असीमित रीडिंग्स जारी रखने के लिए PRO लें।'
                  : '⚠️ 5 free readings reached. Upgrade to PRO to log infinite readings.'
                : language === 'hi'
                ? `पहली 5 रीडिंग्स मुफ्त हैं। आपके पास ${readingsLeft} और रीडिंग बची हैं।`
                : `First 5 readings are free. You have ${readingsLeft} free reading${readingsLeft === 1 ? '' : 's'} remaining.`}
            </p>
          </div>

          {/* Core PRO Benefits List (Explicitly mentions infinite readings, all family members, track control) */}
          <div className="space-y-2">
            {[
              {
                icon: InfinityIcon,
                title: language === 'hi' ? 'असीमित रीडिंग्स (Infinite Readings)' : 'Infinite Readings in PRO',
                desc: language === 'hi' ? 'कोई 5 रीडिंग सीमा नहीं, जब चाहें मापें' : 'No 5-reading cap; log as often as needed',
              },
              {
                icon: Users,
                title: language === 'hi' ? 'परिवार के सभी सदस्यों को जोड़ें' : 'Add ALL Family Members',
                desc: language === 'hi' ? 'माता-पिता, बच्चे व पूरे परिवार का डेटा' : 'All parents, spouses & children in one hub',
              },
              {
                icon: Activity,
                title: language === 'hi' ? 'पूर्ण स्वास्थ्य ट्रैक कंट्रोल' : 'Full Health Track Control',
                desc: language === 'hi' ? 'बीपी, शुगर, वजन, पल्स व सेफ-रेंज चेतावनी' : 'BP, Sugar, Weight, Pulse & safe zones',
              },
              {
                icon: FileText,
                title: language === 'hi' ? 'डॉक्टर प्रिस्क्रिप्शन व रिपोर्ट' : 'Official Doctor Rx Export',
                desc: language === 'hi' ? 'अस्पताल व डॉक्टर परामर्श के लिए पीडीएफ' : 'Printable PDF reports for clinic visits',
              },
            ].map((perk, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#142234] border border-black/5 dark:border-white/5"
              >
                <div className="w-6 h-6 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center shrink-0 mt-0.5">
                  <perk.icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#0E1B2C] dark:text-white leading-tight">
                    {perk.title}
                  </p>
                  <p className="text-[10.5px] font-semibold text-[#7E90A5] dark:text-[#A0B2C6] leading-tight mt-0.5">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Box with Special Discount */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF0E8] to-[#FFF8EE] dark:from-[#FF6B4A]/10 dark:to-[#FFB020]/10 border border-[#FF6B4A]/25 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B4A]">
                {language === 'hi' ? 'सीमित समय ऑफर • 50% छूट' : 'Special Family Offer'}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
                  {formatPaise(price.amount || 49900)}
                </span>
                <span className="text-xs font-bold text-[#7E90A5] line-through">
                  {formatPaise(price.regular || 99900)}
                </span>
                <span className="text-xs font-bold text-[#147A50] dark:text-[#52D49C]">
                  {language === 'hi' ? '६ महीने' : 'for 6 months'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowKnowMore(true)}
              className="text-xs font-black text-[#12B5A6] dark:text-[#5EEAD4] hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
            >
              <span>{language === 'hi' ? 'और जानें' : 'Know More'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PROMINENT PAYMENT OPTION BUTTON */}
          {isManager ? (
            <button
              type="button"
              onClick={onPay}
              disabled={paying}
              className="w-full min-h-[50px] py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF7E47] to-[#FF9028] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B4A]/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {paying ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
              )}
              <span>
                {paying
                  ? language === 'hi' ? 'प्रोसेसिंग...' : 'Connecting UPI...'
                  : `${language === 'hi' ? 'UPI से पेमेंट करें' : 'Pay with UPI'} — ${formatPaise(price.amount || 49900)}`}
              </span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-center text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {language === 'hi'
                ? 'कृपया अपने फैमिली मैनेजर से MEDITREE PRO अपग्रेड करने को कहें'
                : 'Please ask your Family Manager to upgrade to MEDITREE PRO'}
            </div>
          )}

          {/* Secondary Know More Link Button */}
          <button
            type="button"
            onClick={() => setShowKnowMore(true)}
            className="w-full py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-extrabold text-[#0E1B2C] dark:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#12B5A6]" />
            <span>
              {language === 'hi'
                ? 'प्रो फीचर्स व अंतर देखें (Know More)'
                : 'View All PRO Features & Comparison'}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================
          KNOW MORE MODAL: COMPREHENSIVE PRO FEATURES & COMPARISON
          ======================================================== */}
      {showKnowMore && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-details-title"
          onClick={() => setShowKnowMore(false)}
          className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-[#0E1B2C] rounded-[28px] p-5 sm:p-7 shadow-2xl relative border border-black/10 dark:border-white/10 max-h-[92vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowKnowMore(false)}
              className="absolute top-4 right-4 p-2 text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B4A] to-[#FFB020] text-white flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <div className="min-w-0 pr-8">
                <h3
                  id="pro-details-title"
                  className="text-xl sm:text-2xl font-black text-[#0E1B2C] dark:text-white font-heading"
                >
                  {language === 'hi' ? 'MEDITREE PRO की विशेषताएं' : 'MEDITREE PRO Features'}
                </h3>
                <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                  {language === 'hi'
                    ? 'पूरे परिवार के लिए संपूर्ण स्वास्थ्य नियंत्रण'
                    : 'Complete vital tracking and care control for your entire family'}
                </p>
              </div>
            </div>

            {/* Trial Notice */}
            <div className="p-3 mb-5 rounded-xl bg-[#FFF0E8] dark:bg-[#FF6B4A]/15 border border-[#FF6B4A]/30 text-xs text-[#0E1B2C] dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF6B4A] shrink-0" />
              <span>
                <strong>{language === 'hi' ? 'मेडिट्री:' : 'MEDITREE:'}</strong>{' '}
                {language === 'hi'
                  ? 'शुरुआती 5 रीडिंग्स मुफ्त हैं। इसके बाद PRO में असीमित रीडिंग्स मिलती हैं।'
                  : 'First 5 readings are completely free. Upgrade to PRO for infinite readings & family hub.'}
              </span>
            </div>

            {/* DETAILED FEATURES LIST (Focus on user requirements) */}
            <div className="space-y-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/6 dark:border-white/8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B4A]/15 text-[#FF6B4A] flex items-center justify-center shrink-0">
                    <InfinityIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white font-heading">
                    {language === 'hi' ? '१. अनंत रीडिंग्स (Infinite Readings)' : '1. Infinite Readings in PRO'}
                  </h4>
                </div>
                <p className="text-xs text-[#4A5B70] dark:text-[#CBD5E1] font-semibold pl-9 leading-relaxed">
                  {language === 'hi'
                    ? 'कोई सीमा नहीं! दिन में जितनी बार चाहें ब्लड प्रेशर, शुगर, वजन और पल्स लॉग करें। पूरे जीवनकाल का रिकॉर्ड सुरक्षित रहता है।'
                    : 'Zero limits. Log blood pressure, blood glucose, weight, and pulse as many times daily as required with permanent cloud history.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/6 dark:border-white/8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#12B5A6]/15 text-[#12B5A6] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white font-heading">
                    {language === 'hi' ? '२. परिवार के सभी सदस्यों को जोड़ें' : '2. Add ALL Family Members'}
                  </h4>
                </div>
                <p className="text-xs text-[#4A5B70] dark:text-[#CBD5E1] font-semibold pl-9 leading-relaxed">
                  {language === 'hi'
                    ? 'माता-पिता, सास-ससुर, जीवनसाथी और बच्चों के अलग-अलग प्रोफाइल बनाएं। एक ही डैशबोर्ड से सबके स्वास्थ्य का ध्यान रखें।'
                    : 'Create profiles for elderly parents, in-laws, spouse, and kids. Seamlessly switch between family members with 1 tap.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/6 dark:border-white/8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white font-heading">
                    {language === 'hi' ? '३. संपूर्ण स्वास्थ्य ट्रैक कंट्रोल (Track Control)' : '3. Complete Health Track Control'}
                  </h4>
                </div>
                <p className="text-xs text-[#4A5B70] dark:text-[#CBD5E1] font-semibold pl-9 leading-relaxed">
                  {language === 'hi'
                    ? 'क्लिनिकल सेफ ज़ोन, ट्रेंड वेलोसिटी ग्राफ, और स्वास्थ्य स्कोर (0-100) के साथ अनियमित उतार-चढ़ाव की तुरंत पहचान।'
                    : 'Personalized clinical safe bands, trend curve analytics, and real-time health score calculation (0-100) to keep vitals in control.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/6 dark:border-white/8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#E8A317]/15 text-[#E8A317] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white font-heading">
                    {language === 'hi' ? '४. डॉक्टर प्रिस्क्रिप्शन व रिपोर्ट एक्सपोर्ट' : '4. Official Doctor Rx & Clinical Reports'}
                  </h4>
                </div>
                <p className="text-xs text-[#4A5B70] dark:text-[#CBD5E1] font-semibold pl-9 leading-relaxed">
                  {language === 'hi'
                    ? 'अस्पताल व डॉक्टर विज़िट के लिए आधिकारिक प्रिस्क्रिप्शन समरी और विस्तृत स्वास्थ्य रिपोर्ट 1 क्लिक में डाउनलोड करें।'
                    : 'Generate official doctor-ready prescription cards and comprehensive health reports formatted for hospital consultations.'}
                </p>
              </div>
            </div>

            {/* SIDE-BY-SIDE COMPARISON TABLE */}
            <div className="mb-6 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-[#F4F6F9] dark:bg-[#17263A] p-2.5 font-black text-[#0E1B2C] dark:text-white border-b border-black/8 dark:border-white/10 text-center">
                <span className="text-left font-bold text-[#7E90A5]">Feature</span>
                <span>MEDITREE</span>
                <span className="text-[#FF6B4A]">MEDITREE PRO</span>
              </div>
              {[
                { name: 'Vitals Logging', basic: 'First 5 Free', pro: 'Infinite (Unlimited)' },
                { name: 'Family Members', basic: '1-2 Profiles', pro: 'All Family Members' },
                { name: 'Track Control', basic: 'Standard', pro: 'Full Clinical Safe Zones' },
                { name: 'Doctor Rx Export', basic: 'Preview Only', pro: 'Unlimited PDF Downloads' },
                { name: 'Emergency Alerts', basic: 'Standard', pro: 'Instant WhatsApp Alerts' },
                { name: 'Support', basic: 'Standard', pro: '24/7 Priority Support' },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-3 p-2.5 items-center text-center ${
                    idx % 2 === 0 ? 'bg-white dark:bg-[#0E1B2C]' : 'bg-[#FAFBFC] dark:bg-[#132032]'
                  }`}
                >
                  <span className="text-left font-bold text-[#0E1B2C] dark:text-white">{row.name}</span>
                  <span className="text-[#7E90A5] font-medium">{row.basic}</span>
                  <span className="font-black text-[#147A50] dark:text-[#52D49C]">{row.pro}</span>
                </div>
              ))}
            </div>

            {/* MODAL ACTION: DIRECT UPGRADE BUTTON */}
            {isManager ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowKnowMore(false);
                    onPay();
                  }}
                  disabled={paying}
                  className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF7E47] to-[#FF9028] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-[#FF6B4A]/25 active:scale-98 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {language === 'hi'
                      ? `परिवार के लिए PRO अनलॉक करें — ${formatPaise(price.amount || 49900)}`
                      : `Upgrade Family to PRO — ${formatPaise(price.amount || 49900)} / 6 Mos`}
                  </span>
                </button>
                <p className="text-[11px] font-bold text-center text-[#7E90A5] dark:text-[#A0B2C6]">
                  {language === 'hi'
                    ? 'सुरक्षित UPI भुगतान • तुरंत सक्रियण • कोई छुपा शुल्क नहीं'
                    : '100% Secure UPI Payment • Instant Activation • Cancel Anytime'}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowKnowMore(false)}
                className="w-full py-3 rounded-2xl bg-black/5 dark:bg-white/10 text-xs font-black text-[#0E1B2C] dark:text-white"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};