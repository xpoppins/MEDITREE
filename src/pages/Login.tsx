import { ArrowLeft, Eye, EyeOff, LogIn, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = usePreferences();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(language === 'hi' ? 'कृपया ईमेल दर्ज करें' : 'Please enter your email');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Could not log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await login('rakesh@sharma.in', 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
          <span>{language === 'hi' ? 'पीछे' : 'Back to Welcome'}</span>
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
          {language === 'hi' ? 'लॉग इन करें' : 'Welcome Back'}
        </h2>
        <p className="text-xs font-bold text-[#7E90A5] mt-1 mb-5">
          Sign in to access your family health vault.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#FEECEE] dark:bg-[#E5484D]/15 border border-[#E5484D] text-[#E5484D] dark:text-[#FF8080] font-bold text-xs">
            {error}
          </div>
        )}

        {forgotMsg && (
          <div className="p-3 mb-4 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 border border-[#12B5A6] text-[#12B5A6] font-bold text-xs">
            Password reset link sent to {email || 'your email'}!
          </div>
        )}

        {/* Continue with Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full min-h-[52px] rounded-2xl bg-white dark:bg-[#17263A] border border-black/15 dark:border-white/15 shadow-2xs font-heading font-black text-sm text-[#0E1B2C] dark:text-white flex items-center justify-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-98 transition-all mb-4"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
          <span className="text-[11px] font-black uppercase text-[#7E90A5]">or email</span>
          <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rakesh@sharma.in"
              className="w-full h-12 rounded-2xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-4 font-bold text-sm focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all placeholder-[#7E90A5]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase text-[#7E90A5]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotMsg(true)}
                className="text-xs font-bold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
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
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            </button>
          </div>
        </form>

        {/* Demo Fast Fills */}
        <div className="mt-6 pt-4 border-t border-black/8 dark:border-white/8">
          <p className="text-[11px] font-black uppercase text-[#7E90A5] mb-2 text-center">
            Tap a demo account to autofill:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('rakesh@sharma.in');
                setPassword('password123');
              }}
              className="p-2.5 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-left cursor-pointer hover:border-[#FF6B4A] transition-all"
            >
              <p className="font-black text-[#0E1B2C] dark:text-white">Rakesh (Manager)</p>
              <p className="text-[10px] text-[#7E90A5]">rakesh@sharma.in</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('papa@sharma.in');
                setPassword('password123');
              }}
              className="p-2.5 rounded-xl bg-white dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-left cursor-pointer hover:border-[#12B5A6] transition-all"
            >
              <p className="font-black text-[#0E1B2C] dark:text-white">Papa (Member)</p>
              <p className="text-[10px] text-[#7E90A5]">papa@sharma.in</p>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/8 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-bold text-[#7E90A5]">
          <span>New to HealthNest?</span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#FF5A36] text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Create a Family</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
