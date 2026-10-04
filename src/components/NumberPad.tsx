import { Delete } from 'lucide-react';
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  allowDecimal?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  allowDecimal = false,
}) => {
  const { language } = usePreferences();

  const handlePress = (val: string) => {
    // Gentle vibration if supported on phone
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
    onDigit(val);
  };

  const handleBackspace = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
    onBackspace();
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="w-full max-w-sm mx-auto select-none mt-2" aria-label="Large Touch Keypad">
      <div className="grid grid-cols-3 gap-3 md:gap-3.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handlePress(num.toString())}
            className="h-[68px] md:h-[72px] rounded-[20px] bg-white border border-[#0F5C5C]/20 shadow-sm text-3xl font-black text-[#1F2933] flex items-center justify-center transition-transform active:scale-95 active:bg-[#E7F3F3] focus-visible:outline-4 focus-visible:outline-[#0F5C5C] cursor-pointer"
            aria-label={`Digit ${num}`}
          >
            {num}
          </button>
        ))}

        {/* Bottom row: Decimal or Clear, 0, Backspace */}
        {allowDecimal ? (
          <button
            type="button"
            onClick={() => handlePress('.')}
            className="h-[68px] md:h-[72px] rounded-[20px] bg-white border border-[#0F5C5C]/20 shadow-sm text-3xl font-black text-[#1F2933] flex items-center justify-center transition-transform active:scale-95 active:bg-[#E7F3F3] focus-visible:outline-4 focus-visible:outline-[#0F5C5C] cursor-pointer"
            aria-label="Decimal point"
          >
            •
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="h-[68px] md:h-[72px] rounded-[20px] bg-[#FFF2F0] border border-[#FF7A59]/30 text-base font-bold text-[#D64545] flex items-center justify-center transition-transform active:scale-95 active:bg-[#FEEEEE] focus-visible:outline-4 focus-visible:outline-[#0F5C5C] cursor-pointer"
            aria-label="Clear entry"
          >
            {language === 'hi' ? 'साफ़' : 'Clear'}
          </button>
        )}

        <button
          type="button"
          onClick={() => handlePress('0')}
          className="h-[68px] md:h-[72px] rounded-[20px] bg-white border border-[#0F5C5C]/20 shadow-sm text-3xl font-black text-[#1F2933] flex items-center justify-center transition-transform active:scale-95 active:bg-[#E7F3F3] focus-visible:outline-4 focus-visible:outline-[#0F5C5C] cursor-pointer"
          aria-label="Digit 0"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="h-[68px] md:h-[72px] rounded-[20px] bg-[#F4F6F8] border border-[#0F5C5C]/20 shadow-sm text-[#1F2933] flex items-center justify-center transition-transform active:scale-95 active:bg-[#E7F3F3] focus-visible:outline-4 focus-visible:outline-[#0F5C5C] cursor-pointer"
          aria-label="Backspace delete last digit"
        >
          <Delete className="w-8 h-8 text-[#0F5C5C]" strokeWidth={2.5} />
        </button>
      </div>

      {allowDecimal && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-bold text-[#D64545] hover:underline cursor-pointer"
          >
            {language === 'hi' ? 'पूरा साफ़ करें (Clear all)' : 'Clear all numbers'}
          </button>
        </div>
      )}
    </div>
  );
};
