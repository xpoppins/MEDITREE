import { Download, Share2, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = usePreferences();

  // If already installed, hide
  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="w-full min-h-[58px] rounded-[20px] bg-[#0F5C5C] text-white font-bold text-lg flex items-center justify-center gap-2.5 px-4 py-2 cursor-pointer shadow-md active:scale-98"
      >
        <Download className="w-5 h-5" />
        <span>
          {language === 'hi'
            ? 'फ़ोन पर ऐप इंस्टॉल करें (PWA)'
            : 'Install App on Phone (PWA)'}
        </span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="w-full min-h-[54px] rounded-[20px] bg-white border-2 border-[#0F5C5C] text-[#0F5C5C] font-bold text-base flex items-center justify-center gap-2.5 px-4 py-2 cursor-pointer active:scale-98"
        >
          <Share2 className="w-5 h-5 text-[#FF7A59]" />
          <span>{language === 'hi' ? 'iPhone पर इंस्टॉल करें' : 'Install on iPhone / iPad'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-[26px] bg-[#FFF9F0] border-2 border-[#0F5C5C] p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 text-[#1F2933]/60 hover:text-[#1F2933] cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-[#0F5C5C] pr-8">
                {language === 'hi' ? 'iPhone पर कैसे जोड़ें:' : 'Install on iPhone'}
              </h3>
              <div className="mt-4 space-y-3 text-base font-semibold text-[#1F2933]">
                <p className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F5C5C] text-white flex items-center justify-center shrink-0 text-sm font-bold">1</span>
                  <span>
                    {language === 'hi'
                      ? 'नीचे सफ़ारी (Safari) में "Share" बटन दबाएं'
                      : 'Tap the Share icon in Safari toolbar at the bottom'}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F5C5C] text-white flex items-center justify-center shrink-0 text-sm font-bold">2</span>
                  <span>
                    {language === 'hi'
                      ? '"Add to Home Screen" चुनें'
                      : 'Scroll down and tap "Add to Home Screen"'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[50px] rounded-[18px] bg-[#0F5C5C] text-white text-base font-bold cursor-pointer"
              >
                {language === 'hi' ? 'समझ गए' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
