import { AlertTriangle, Phone, PhoneCall, ShieldAlert, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const EmergencyButton: React.FC = () => {
  const { currentMember, members } = useAuth();
  const { language } = usePreferences();
  const [showConfirm, setShowConfirm] = useState(false);

  // Preferred contact or first available
  const contact =
    currentMember?.emergencyContact ||
    members.find((m) => m.emergencyContact)?.emergencyContact || {
      name: 'Rakesh (Son)',
      phone: '+919876543210',
      relation: 'Family Emergency',
    };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="px-2 sm:px-3 py-1.5 rounded-xl bg-[#FEECEE] hover:bg-[#FCD7DA] text-[#E5484D] border border-[#E5484D]/30 flex items-center gap-1 sm:gap-1.5 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
        aria-label="Call emergency contact"
      >
        <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#E5484D]" />
        <span className="hidden sm:inline">{language === 'hi' ? 'आपातकालीन SOS' : 'Emergency SOS'}</span>
        <span className="sm:hidden font-bold">SOS</span>
      </button>

      {/* Emergency Dialing Sheet / Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="card-wellness p-6 bg-white dark:bg-[#0E1B2C] max-w-sm w-full text-center border-2 border-[#E5484D] dark:border-[#E5484D]/50 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-2 text-[#7E90A5] dark:text-[#A0B2C6] hover:text-[#0E1B2C] dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#FEECEE] dark:bg-[#E5484D]/20 text-[#E5484D] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <PhoneCall className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
              {language === 'hi' ? 'आपातकालीन कॉल' : 'Emergency Contact'}
            </h3>

            <p className="text-sm font-semibold text-[#7E90A5] dark:text-[#A0B2C6] mt-1">
              {language === 'hi' ? 'सीधे फोन मिलाने के लिए नीचे टैप करें:' : 'Tap below to dial immediate family help:'}
            </p>

            <div className="my-5 p-4 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-left">
              <p className="text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6]">Primary Contact</p>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white mt-0.5">{contact.name}</p>
              <p className="text-lg font-black text-[#E5484D] font-mono mt-0.5">{contact.phone}</p>
            </div>

            <div className="space-y-3">
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="w-full min-h-[58px] rounded-2xl bg-[#E5484D] hover:bg-[#D4373C] text-white text-lg font-black flex items-center justify-center gap-2 shadow-lg shadow-[#E5484D]/30 active:scale-98 transition-transform"
              >
                <Phone className="w-6 h-6" />
                <span>{language === 'hi' ? 'अभी कॉल करें' : 'Call Emergency Now'}</span>
              </a>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="w-full py-2.5 text-sm font-bold text-[#7E90A5] dark:text-[#A0B2C6] hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
