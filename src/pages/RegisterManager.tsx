import { ArrowLeft, Eye, EyeOff, ShieldCheck, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const RegisterManager: React.FC = () => {
  const navigate = useNavigate();
  const { registerManager } = useAuth();
  const { language } = usePreferences();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await registerManager(name, email, password, familyName);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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

        <h2 className="text-2xl sm:text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
          Create a Family
        </h2>
        <p className="text-xs font-bold text-[#7E90A5] mt-1 mb-5">
          You will become the Family Manager and receive a 6-character invite code.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#FEECEE] dark:bg-[#E5484D]/15 border border-[#E5484D] text-[#E5484D] dark:text-[#FF8080] font-bold text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="w-full h-12 rounded-2xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-4 font-bold text-sm focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all placeholder-[#7E90A5]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
              Family Group Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Malhotra Family"
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
              placeholder="e.g. vikram@malhotra.in"
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

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-action-gradient text-base"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{loading ? 'Creating Family...' : 'Create Family & Start'}</span>
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
