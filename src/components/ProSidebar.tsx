import { Check, Crown, Sparkles } from 'lucide-react';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

interface ProSidebarProps {
  isPremium: boolean;
  premiumUntil: string | null;
  price: { amount: number; offer: boolean; regular: number };
  onPay: () => void;
  paying: boolean;
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
  lastPayment,
  memberSince,
}) => {
  const { isManager } = useAuth();
  const { language } = usePreferences();

  const formatPaise = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

  const daysRemaining = premiumUntil
    ? Math.max(0, Math.ceil((new Date(premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="card-wellness p-4 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#FFB020] flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-black text-[#0E1B2C] dark:text-white font-heading truncate">
            {language === 'hi' ? 'MEDITREE PRO' : 'MEDITREE PRO'}
          </h3>
          <p className="text-[11px] font-bold text-[#7E90A5] truncate">
            {isPremium
              ? language === 'hi'
                ? `${daysRemaining} दिन शेष`
                : `${daysRemaining} days left`
              : language === 'hi'
              ? 'प्रीमियम सदस्यता'
              : 'Premium membership'}
          </p>
        </div>
      </div>

      {isPremium ? (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/10 border border-[#12B5A6]/20">
            <p className="text-sm font-bold text-[#0E1B2C] dark:text-white">
              {language === 'hi' ? 'आप प्रीमियम सदस्य हैं' : 'You are a premium member'}
            </p>
            <p className="text-xs font-semibold text-[#7E90A5] mt-1">
              {language === 'hi' ? 'सभी सुविधाएं अनलॉक' : 'All features unlocked'}
            </p>
          </div>

          {lastPayment && (
            <div className="p-3 rounded-xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/10 dark:border-white/10 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7E90A5]">
                {language === 'hi' ? 'भुगतान विवरण' : 'Payment Details'}
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-[#7E90A5]">{language === 'hi' ? 'राशि' : 'Amount'}</span>
                <span className="font-black text-[#0E1B2C] dark:text-white">{formatPaise(lastPayment.amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#7E90A5]">{language === 'hi' ? 'भुगतान तिथि' : 'Payment Date'}</span>
                <span className="font-bold text-[#0E1B2C] dark:text-white">
                  {new Date(lastPayment.paidAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#7E90A5]">{language === 'hi' ? 'भुगतान ID' : 'Payment ID'}</span>
                <span className="font-mono text-[10px] text-[#0E1B2C] dark:text-white truncate max-w-[120px]">
                  {lastPayment.paymentId}
                </span>
              </div>
              {memberSince && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#7E90A5]">{language === 'hi' ? 'सदस्यता तिथि' : 'Member Since'}</span>
                  <span className="font-bold text-[#0E1B2C] dark:text-white">
                    {new Date(memberSince).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {[
              language === 'hi' ? 'अलिमिटेड रीडिंग्स' : 'Unlimited readings',
              language === 'hi' ? 'प्रायोरिटी सपोर्ट' : 'Priority support',
              language === 'hi' ? 'पूरे परिवार के लिए' : 'For whole family',
            ].map((perk, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-[#0E1B2C] dark:text-white">
                <Check className="w-4 h-4 text-[#12B5A6] shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#FFF0E8] dark:bg-[#FF6B4A]/10 border border-[#FF6B4A]/20">
            <p className="text-xs font-bold text-[#7E90A5] uppercase tracking-wider">
              {language === 'hi' ? 'सीमित समय ऑफर' : 'Limited Time Offer'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#0E1B2C] dark:text-white">
                {formatPaise(price.amount)}
              </span>
              {price.offer && (
                <span className="text-sm font-bold text-[#7E90A5] line-through">
                  {formatPaise(price.regular)}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#7E90A5] mt-1">
              {language === 'hi' ? '6 महीने का प्रीमियम' : '6 months premium'}
            </p>
          </div>

          <div className="space-y-2">
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

          {isManager && (
            <button
              type="button"
              onClick={onPay}
              disabled={paying}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white font-black flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-[#FF6B4A]/25 active:scale-98 transition-transform disabled:opacity-50 py-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                {language === 'hi' ? 'सीमित समय ऑफर' : 'Limited Offer'}
              </span>
              <span className="text-sm font-black">
                {paying
                  ? language === 'hi' ? 'प्रोसेसिंग...' : 'Processing...'
                  : `${language === 'hi' ? 'UPI से भुगतान करें' : 'Pay with UPI'} - ${formatPaise(price.amount)}`}
              </span>
            </button>
          )}

          {!isManager && (
            <p className="text-xs font-bold text-[#7E90A5] text-center">
              {language === 'hi'
                ? 'कृपया अपने फैमिली मैनेजर से MEDITREE PRO अनलॉक करने को कहें'
                : 'Please ask your Family Manager to unlock MEDITREE PRO'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};