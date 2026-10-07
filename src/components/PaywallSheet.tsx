import { Check, Crown, ShieldCheck, Sparkles, X } from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';

interface PaywallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  price: { amount: number; offer: boolean; regular: number };
  used: number;
  freeLimit: number;
  isManager: boolean;
  onPay: () => void;
  paying: boolean;
}

export const PaywallSheet: React.FC<PaywallSheetProps> = ({
  isOpen,
  onClose,
  price,
  used,
  freeLimit,
  isManager,
  onPay,
  paying,
}) => {
  const { language } = usePreferences();

  if (!isOpen) return null;

  const formatPaise = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#0E1B2C] rounded-[28px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B4A] to-[#FFB020] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
            {language === 'hi' ? 'MEDITREE PRO अनलॉक करें' : 'Unlock MEDITREE PRO'}
          </h3>
          <p className="text-sm font-semibold text-[#7E90A5] mt-1">
            {language === 'hi'
              ? 'परिवार के लिए अलिमिटेड रीडिंग्स, 6 महीने'
              : 'Unlimited readings for your family, 6 months'}
          </p>
        </div>

        <div className="bg-[#F9FBFC] dark:bg-[#17263A] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#0E1B2C] dark:text-white">
              {language === 'hi' ? 'मुफ्त रीडिंग्स इस्तेमाल हो गईं' : 'Free readings used'}
            </span>
            <span className="text-sm font-black text-[#FF6B4A]">
              {used} / {freeLimit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FFB020] rounded-full"
              style={{ width: `${Math.min((used / freeLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#FFF0E8] to-[#FFF8EE] dark:from-[#FF6B4A]/10 dark:to-[#FFB020]/10 rounded-2xl p-4 mb-4 border border-[#FF6B4A]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#7E90A5] uppercase tracking-wider">
                {language === 'hi' ? 'सीमित समय ऑफर' : 'Limited Time Offer'}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#0E1B2C] dark:text-white">
                  {formatPaise(price.amount)}
                </span>
                {price.offer && (
                  <span className="text-lg font-bold text-[#7E90A5] line-through">
                    {formatPaise(price.regular)}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#7E90A5] mt-1">
                {language === 'hi' ? '6 महीने का प्रीमियम' : '6 months premium'}
              </p>
            </div>
            {price.offer && (
              <span className="px-2 py-1 rounded-lg bg-[#FF6B4A] text-white text-xs font-black">
                {language === 'hi' ? 'ऑफर' : 'OFFER'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {[
            language === 'hi' ? 'अलिमिटेड रीडिंग्स - कोई सीमा नहीं' : 'Unlimited readings - no cap',
            language === 'hi' ? 'पूरे परिवार के लिए प्रीमियम' : 'Premium for whole family',
            language === 'hi' ? 'प्रायोरिटी सपोर्ट' : 'Priority support',
          ].map((perk, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-[#0E1B2C] dark:text-white">
              <Check className="w-4 h-4 text-[#12B5A6] shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {isManager ? (
          <button
            type="button"
            onClick={onPay}
            disabled={paying}
            className="w-full min-h-[58px] rounded-[20px] bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white text-lg font-black flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B4A]/25 active:scale-98 transition-transform disabled:opacity-50"
          >
            {paying ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            <span>
              {paying
                ? language === 'hi' ? 'प्रोसेसिंग...' : 'Processing...'
                : `${language === 'hi' ? 'UPI से भुगतान करें' : 'Pay with UPI'} - ${formatPaise(price.amount)}`}
            </span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F4F6F9] dark:bg-[#17263A] text-center">
            <p className="text-sm font-bold text-[#7E90A5]">
              {language === 'hi'
                ? 'कृपया अपने फैमिली मैनेजर से MEDITREE PRO अनलॉक करने को कहें'
                : 'Please ask your Family Manager to unlock MEDITREE PRO'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};