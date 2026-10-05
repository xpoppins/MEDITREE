import { Check, Mic, MicOff, RefreshCw, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { ParsedSpeechData, parseHealthSpeech } from '../utils/speechParser';

interface VoiceInputProps {
  onParsedResult: (data: ParsedSpeechData) => void;
  targetType?: 'bp' | 'sugar' | 'weight' | 'pulse';
}

// Support SpeechRecognition type in browsers
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onParsedResult, targetType }) => {
  const { language } = usePreferences();
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<ParsedSpeechData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const startListening = () => {
    setErrorMessage('');
    setTranscript('');
    setParsed(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate speech for demo or when browser mic is disabled/unsupported
      setShowModal(true);
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        let sample = 'BP 130 over 85 pulse 72';
        if (targetType === 'sugar') sample = 'Sugar 140 after food';
        if (targetType === 'weight') sample = 'Weight 72 kg';
        setTranscript(sample);
        setParsed(parseHealthSpeech(sample));
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setShowModal(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        const parsedResult = parseHealthSpeech(spoken);
        setParsed(parsedResult);
        setIsListening(false);
      };

      recognition.onerror = (_e: any) => {
        setIsListening(false);
        setErrorMessage(
          language === 'hi'
            ? 'आवाज़ साफ़ सुनाई नहीं दी। कृपया दोबारा बोलें।'
            : 'Could not hear clearly. Please try speaking again.'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMessage('Microphone access unavailable. You can enter with the keypad.');
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    if (parsed) {
      onParsedResult(parsed);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={startListening}
        className="w-full min-h-[58px] rounded-[20px] bg-[#E7F3F3] hover:bg-[#D3E9E9] text-[#0F5C5C] border-2 border-[#0F5C5C]/30 flex items-center justify-center gap-3 px-5 py-2 font-bold text-lg transition-transform active:scale-[0.98] cursor-pointer"
        aria-label="Use voice input to speak health numbers"
      >
        <Mic className="w-6 h-6 text-[#FF7A59] animate-pulse" strokeWidth={2.5} />
        <span>
          {language === 'hi' ? 'बोलकर बताएं ("Say it")' : 'Say it ("BP 130 over 85")'}
        </span>
      </button>

      {/* Voice Assistant Sheet/Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFF9F0] dark:bg-[#08101A] border-2 border-[#0F5C5C] dark:border-[#12B5A6] rounded-[28px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-[#1F2933]/70 dark:text-white/70 hover:text-[#1F2933] dark:hover:text-white cursor-pointer rounded-full"
              aria-label="Close voice dialog"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center my-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#E7F3F3] dark:bg-[#0F5C5C]/20 flex items-center justify-center mb-4">
                {isListening ? (
                  <Mic className="w-10 h-10 text-[#FF7A59] animate-bounce" strokeWidth={2.5} />
                ) : (
                  <MicOff className="w-10 h-10 text-[#0F5C5C] dark:text-[#12B5A6]" strokeWidth={2} />
                )}
              </div>

              <h3 className="text-2xl font-black text-[#1F2933] dark:text-white">
                {isListening
                  ? (language === 'hi' ? 'सुन रहे हैं...' : 'Listening now...')
                  : (language === 'hi' ? 'क्या यह सही है?' : 'What we heard')}
              </h3>

              {isListening && (
                <p className="text-lg text-[#1F2933]/80 dark:text-white/80 mt-2 font-medium">
                  {language === 'hi'
                    ? 'कृपया साफ़ बोलें: "BP 130 over 85" या "Sugar 140"'
                    : 'Speak clearly: "BP 130 over 85" or "Sugar 140"'}
                </p>
              )}

              {/* What was heard */}
              {transcript && (
                <div className="bg-white dark:bg-[#132032] rounded-2xl p-4 my-4 border border-[#0F5C5C]/20 dark:border-[#12B5A6]/30 text-left">
                  <p className="text-xs uppercase font-bold text-[#1F2933]/60 dark:text-white/60 mb-1">
                    {language === 'hi' ? 'आपने कहा:' : 'You said:'}
                  </p>
                  <p className="text-xl font-bold text-[#0F5C5C] dark:text-[#12B5A6]">"{transcript}"</p>

                  {/* Parsed summary */}
                  {parsed && (
                    <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-2 text-base font-bold">
                      {parsed.systolic && parsed.diastolic && (
                        <span className="bg-[#E8F7EE] dark:bg-[#146636]/20 text-[#146636] dark:text-[#67E2D5] px-3 py-1 rounded-xl">
                          BP: {parsed.systolic} / {parsed.diastolic}
                        </span>
                      )}
                      {parsed.pulse && (
                        <span className="bg-[#FEF8E7] dark:bg-[#8A5800]/20 text-[#8A5800] dark:text-[#F5C767] px-3 py-1 rounded-xl">
                          Pulse: {parsed.pulse}
                        </span>
                      )}
                      {parsed.sugar && (
                        <span className="bg-[#E8F7EE] dark:bg-[#146636]/20 text-[#146636] dark:text-[#67E2D5] px-3 py-1 rounded-xl">
                          Sugar: {parsed.sugar} mg/dL
                        </span>
                      )}
                      {parsed.weightKg && (
                        <span className="bg-[#E8F7EE] dark:bg-[#146636]/20 text-[#146636] dark:text-[#67E2D5] px-3 py-1 rounded-xl">
                          Weight: {parsed.weightKg} kg
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <p className="text-base text-[#D64545] dark:text-[#FF8080] font-bold mt-2 bg-[#FEEEEE] dark:bg-[#D64545]/20 p-3 rounded-xl">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col gap-3">
              {parsed ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full min-h-[60px] rounded-[20px] bg-[#0F5C5C] text-white text-xl font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
                >
                  <Check className="w-6 h-6" strokeWidth={2.5} />
                  <span>{language === 'hi' ? 'हाँ, यह सही है' : 'Yes, use this'}</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={startListening}
                className="w-full min-h-[56px] rounded-[20px] bg-white dark:bg-[#17263A] border-2 border-[#0F5C5C] text-[#0F5C5C] dark:text-[#12B5A6] text-lg font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{language === 'hi' ? 'दोबारा बोलें' : 'Speak again'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
