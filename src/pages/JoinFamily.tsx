import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const JoinFamily: React.FC = () => {
  const navigate = useNavigate();
  const { joinFamily } = useAuth();
  const { language } = usePreferences();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeBoxes, setCodeBoxes] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const boxRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleBoxChange = (index: number, val: string) => {
    const char = val.toUpperCase().slice(-1);
    const updated = [...codeBoxes];
    updated[index] = char;
    setCodeBoxes(updated);

    if (char && index < 5) {
      boxRefs[index + 1].current?.focus();
    }
  };

  const handleBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeBoxes[index] && index > 0) {
      boxRefs[index - 1].current?.focus();
    }
  };

  const handlePasteCode = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const updated = [...codeBoxes];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setCodeBoxes(updated);
    if (pasted.length >= 6) {
      boxRefs[5].current?.focus();
    }
  };

  const inviteCode = codeBoxes.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all details.');
      return;
    }

    if (inviteCode.length < 6) {
      setError('Please enter the full 6-character family invite code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await joinFamily(name, email, password, inviteCode);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Could not join family.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] p-4 sm:p-6 flex flex-col justify-center items-center transition-colors">
      <div className="w-full max-w-md card-wellness p-6 sm:p-8 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-2xl">
        <button
          type="button"
          onClick={() => navigate('/welcome')}
          className="flex items-center gap-1.5 text-sm font-black text-[#0E1B2C] dark:text-white py-1 cursor-pointer mb-4 hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Welcome</span>
        </button>

        <div className="flex justify-center mb-6">
          <img
            src="/logo.svg"
            alt="MEDITREE"
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
          Join My Family
        </h2>
        <p className="text-xs font-bold text-[#7E90A5] mt-1 mb-5">
          Enter the 6-character code shared by your family manager.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#FEECEE] dark:bg-[#E5484D]/15 border border-[#E5484D] text-[#E5484D] dark:text-[#FF8080] font-bold text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 6 Large Code Boxes */}
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-2">
              6-Character Invite Code
            </label>
            <div className="grid grid-cols-6 gap-2" onPaste={handlePasteCode}>
              {codeBoxes.map((val, idx) => (
                <input
                  key={idx}
                  ref={boxRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleBoxChange(idx, e.target.value)}
                  onKeyDown={(e) => handleBoxKeyDown(idx, e)}
                  placeholder="•"
                  className="h-13 sm:h-14 rounded-2xl bg-white dark:bg-[#17263A] border border-black/15 dark:border-white/15 text-center text-xl sm:text-2xl font-black text-[#0E1B2C] dark:text-white uppercase focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all"
                />
              ))}
            </div>
            <p className="text-[11px] font-bold text-[#7E90A5] mt-1">
              Default demo code: <span className="text-[#FF6B4A] font-mono font-black">K7P3QX</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full h-12 rounded-2xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-4 font-bold text-sm focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all placeholder-[#7E90A5]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@family.com"
              className="w-full h-12 rounded-2xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-4 font-bold text-sm focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all placeholder-[#7E90A5]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 rounded-2xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-4 pr-12 font-bold text-sm focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all placeholder-[#7E90A5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E90A5] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-action-gradient text-base"
            >
              <UserPlus className="w-5 h-5" />
              <span>{loading ? 'Joining Family...' : 'Join Family'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-black/8 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-bold text-[#7E90A5]">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] font-black text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Sign In</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
