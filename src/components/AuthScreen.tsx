import React, { useState } from 'react';
import { Mail, Lock, UserCheck, ShieldCheck } from 'lucide-react';
import { UserSession } from '../types';
import { Logo } from './Logo';

interface AuthScreenProps {
  onLogin: (session: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for password');
      return;
    }

    setIsBusy(true);
    setTimeout(() => {
      const isAdmin = trimmed.toLowerCase().includes('admin') || trimmed === 'admin@nrityasana.com';
      const session: UserSession = {
        userId: 'u-' + Math.random().toString(36).substring(2, 9),
        email: trimmed,
        role: isAdmin ? 'ADMIN' : 'USER',
        token: 'mock-jwt-' + Date.now(),
      };
      setIsBusy(false);
      onLogin(session);
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setIsBusy(true);
    setError(null);
    setTimeout(() => {
      const session: UserSession = {
        userId: 'u-google-' + Math.random().toString(36).substring(2, 7),
        email: 'ananya@nrityasana.com',
        role: 'USER',
        token: 'mock-google-token-' + Date.now(),
      };
      setIsBusy(false);
      onLogin(session);
    }, 500);
  };

  const quickLoginAs = (role: 'USER' | 'ADMIN') => {
    const session: UserSession = {
      userId: role === 'ADMIN' ? 'u-admin' : 'u-current',
      email: role === 'ADMIN' ? 'admin@nrityasana.com' : 'ananya@nrityasana.com',
      role: role,
      token: 'mock-session-token',
    };
    onLogin(session);
  };

  return (
    <div id="auth-screen" className="min-h-screen bg-[#FDF8F5] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-[430px] bg-white/85 backdrop-blur-sm p-8 sm:p-10 rounded-[32px] border border-[#F2E6E2] shadow-sm">
        {/* App Logo Emblem */}
        <div className="flex justify-center mb-5">
          <Logo variant="full" size="xl" showSubtitle={false} />
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h2 className="font-serif text-2xl font-bold text-[#1F161A] tracking-tight">
            {isLogin ? 'Welcome back' : 'Begin your practice'}
          </h2>
          <p className="mt-1.5 text-[#6B5C62] text-sm">
            {isLogin ? 'Return to your rhythm.' : 'Create a quiet space for movement.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div id="auth-error" className="mb-5 p-3 rounded-xl bg-[#FDEEF3] border border-[#F9D2DF] text-[#781D32] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94848A]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF3F0]/70 border border-[#EADBDA] text-[#1F161A] text-sm focus:outline-none focus:border-[#781D32] focus:ring-1 focus:ring-[#781D32] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94848A]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF3F0]/70 border border-[#EADBDA] text-[#1F161A] text-sm focus:outline-none focus:border-[#781D32] focus:ring-1 focus:ring-[#781D32] transition-all"
              />
            </div>
          </div>

          <button
            id="auth-submit-button"
            type="submit"
            disabled={isBusy}
            className="w-full py-3.5 px-4 mt-2 rounded-xl bg-[#781D32] hover:bg-[#641427] active:scale-[0.99] text-white font-medium text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isBusy ? 'Processing...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#F2E6E2]"></div>
          </div>
          <div className="relative flex justify-center text-xs text-[#94848A]">
            <span className="bg-[#FAF3F0] px-3">or</span>
          </div>
        </div>

        {/* Google sign-in */}
        <button
          id="auth-google-button"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#FAF3F0] border border-[#EADBDA] text-[#1F161A] font-medium text-sm flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle sign in / register */}
        <div className="mt-6 text-center">
          <button
            id="auth-toggle-mode-button"
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-[#781D32] hover:text-[#E25B88] hover:underline font-semibold cursor-pointer transition-colors"
          >
            {isLogin ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-8 pt-6 border-t border-[#F2E6E2]">
          <p className="text-[11px] text-[#7D6D73] text-center mb-3 font-medium uppercase tracking-wider">
            Quick demo credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs('USER')}
              className="px-3 py-2 bg-[#FDEEF3] hover:bg-[#FCDAE5] text-[#781D32] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#F9D2DF]"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#E25B88]" />
              Student (Ananya)
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs('ADMIN')}
              className="px-3 py-2 bg-[#FEF5EA] hover:bg-[#FCE6CA] text-[#781D32] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#FCE6CA]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F59E38]" />
              Teacher (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
