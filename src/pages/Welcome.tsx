import { Heart, Sparkles, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemo } = useAuth();
  const { language } = usePreferences();

  const handleDemoManager = async () => {
    await switchDemo('manager');
    navigate('/');
  };

  const handleDemoMember = async () => {
    await switchDemo('member');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#08101A] flex flex-col justify-between p-6 md:p-8 max-w-md md:max-w-lg mx-auto">
      {/* Brand Hero */}
      <div className="pt-8 md:pt-12 text-center">
        {/* MEDITREE Logo */}
        <div className="w-32 h-32 mx-auto rounded-[32px] shadow-xl shadow-black/15 mb-6 relative overflow-hidden">
          <img
            src="/logo.svg"
            alt="MEDITREE"
            className="w-full h-full"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F8F6] text-[#12B5A6] text-xs font-black uppercase tracking-wider mb-2">
          <span>MEDITREE Wellness</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-[#0E1B2C] dark:text-white font-heading tracking-tight">
          {language === 'hi' ? 'मेडीट्री (MEDITREE)' : 'MEDITREE'}
        </h1>

        <p className="text-xl md:text-2xl font-black text-[#0E1B2C] dark:text-white mt-2 leading-tight font-heading">
          {language === 'hi'
            ? 'पूरे परिवार का स्वास्थ्य व वाइटल्स एक जगह'
            : "Your Family's Health & Vitals in One Place"}
        </p>

        <p className="text-sm font-semibold text-[#7E90A5] mt-2 max-w-xs mx-auto">
          {language === 'hi'
            ? 'बुजुर्गों और परिवार के लिए विशेष रूप से डिज़ाइन किया गया सरल व सुंदर डिजिटल हेल्थ ट्रैकर।'
            : 'Elder-friendly design with big text, voice inputs, and real-time family health alerts.'}
        </p>
      </div>

      {/* Main Two Big Buttons */}
      <div className="space-y-3.5 my-6">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="btn-action-gradient text-lg"
        >
          <Users className="w-6 h-6" />
          <span>{language === 'hi' ? 'नया परिवार बनाएं (Manager)' : 'Create a Family'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/join')}
          className="btn-secondary-wellness text-lg"
        >
          <UserPlus className="w-6 h-6" />
          <span>{language === 'hi' ? 'परिवार कोड से जुड़ें (Member)' : 'Join My Family'}</span>
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full min-h-[52px] rounded-2xl bg-white dark:bg-[#17263A] border-2 border-black/10 dark:border-white/15 text-sm font-black text-[#0E1B2C] dark:text-white flex items-center justify-center gap-1.5 shadow-xs hover:border-[#12B5A6] active:scale-98 transition-all cursor-pointer"
          >
            <span>{language === 'hi' ? 'पहले से खाता है? लॉग इन करें' : 'Already have an account? Log in'}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Fast Demo Testing Area for Evaluator */}
      <div className="card-wellness p-4 bg-white text-center shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider font-extrabold text-[#7E90A5] mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Instant 1-Tap Demo Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDemoManager}
            className="py-2.5 px-3 rounded-xl bg-[#0E1B2C] text-white font-black text-xs hover:bg-[#17263A] transition-colors cursor-pointer"
          >
            👨‍💼 Manager (Rakesh)
          </button>
          <button
            type="button"
            onClick={handleDemoMember}
            className="py-2.5 px-3 rounded-xl bg-[#FFF0E8] text-[#FF6B4A] font-black text-xs hover:bg-[#FFE3D4] transition-colors cursor-pointer"
          >
            👴 Elder (Papa)
          </button>
        </div>
      </div>
    </div>
  );
};
