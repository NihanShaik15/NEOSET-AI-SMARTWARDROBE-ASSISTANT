import React, { useState } from 'react';
import { UserGender, UserProfile } from '../types';
import { Sparkles, Shield, ArrowRight, User, Check, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onAuthSuccess: (profile: UserProfile, isNewAccount?: boolean) => void;
  onClose?: () => void;
  currentProfile?: UserProfile | null;
  theme?: 'light' | 'dark' | 'neon';
  initialMode?: 'signup' | 'signin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onAuthSuccess,
  onClose,
  currentProfile,
  theme = 'dark',
  initialMode = 'signup',
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [name, setName] = useState(currentProfile?.name || '');
  const [email, setEmail] = useState(currentProfile?.email || '');
  const [gender, setGender] = useState<UserGender>(currentProfile?.gender || 'boy');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to personalize your avatar.');
      return;
    }
    if (!gender) {
      setError('Please select a gender (Boy or Girl) to lock your avatar profile.');
      return;
    }

    const profile: UserProfile = {
      id: currentProfile && !isSignUp ? currentProfile.id : `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@neoset.design`,
      gender,
      createdAt: currentProfile && !isSignUp ? currentProfile.createdAt : new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem('neoset_user_profile', JSON.stringify(profile));
    onAuthSuccess(profile, isSignUp);
  };

  const handleQuickEnter = (selectedGender: UserGender) => {
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: selectedGender === 'boy' ? 'Julian Vance' : 'Elena Rostova',
      email: `${selectedGender === 'boy' ? 'julian' : 'elena'}@neoset.design`,
      gender: selectedGender,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('neoset_user_profile', JSON.stringify(profile));
    onAuthSuccess(profile, true);
  };

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900'
            : isNeon
            ? 'bg-neutral-950 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-neutral-100'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 bg-[#244837]/10 text-[#244837] dark:text-[#C5A880] border border-[#244837]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Twin Identity & Authentication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
            {isSignUp ? 'Create New Account' : 'Sign In to Your Studio'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {isSignUp
              ? 'Set up your profile and configure your anatomical 2D avatar. New accounts start with a clean dashboard with no dress.'
              : 'Sign in to access your personal digital twin and customized wardrobe looks.'}
          </p>
        </div>

        {/* Account Mode Switcher Tabs */}
        <div className={`flex items-center p-1 rounded-2xl border mb-5 ${
          isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
              isSignUp
                ? 'bg-[#244837] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <span>Create New Account</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
              Clean Canvas
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
              !isSignUp
                ? 'bg-[#244837] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Clean Dashboard Guarantee Banner */}
        {isSignUp && (
          <div className="mb-4 p-3 rounded-2xl bg-[#244837]/10 border border-[#244837]/25 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#B38F5F] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-[#244837] dark:text-[#C5A880]">Clean Dashboard:</strong>{' '}
              <span className="text-neutral-600 dark:text-neutral-300">
                Your new account will launch with a completely clean avatar stage without any dress or clothing equipped. You can try on and style outfits anytime in the interactive Fitting Room.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Email */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leo, Jordan, Maya"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-[#244837]'
                      : 'bg-neutral-800/80 border border-neutral-700 text-neutral-100 focus:border-[#C5A880]'
                  }`}
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Email Address <span className="text-[11px] font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition focus:outline-none ${
                  isLight
                    ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-[#244837]'
                    : 'bg-neutral-800/80 border border-neutral-700 text-neutral-100 focus:border-[#C5A880]'
                }`}
              />
            </div>
          </div>

          {/* Gender Selection (Crucial Requirement) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Select Gender <span className="text-[#B38F5F] font-bold">*</span>
              </label>
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500">
                <Lock className="w-3 h-3" />
                <span>Locks in dashboard</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Boy Option */}
              <button
                type="button"
                onClick={() => setGender('boy')}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col items-center sm:items-start ${
                  gender === 'boy'
                    ? isNeon
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : isLight
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-blue-950/40 border-blue-400 text-blue-200 ring-2 ring-blue-400/20'
                    : isLight
                    ? 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 text-neutral-700'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-850 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <span className="text-base">👔</span> Boy / Male
                  </span>
                  {gender === 'boy' && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Masculine athletic build, clean fade or crop hairstyles, tailored suits, jackets & boy closet.
                </p>
              </button>

              {/* Girl Option */}
              <button
                type="button"
                onClick={() => setGender('girl')}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col items-center sm:items-start ${
                  gender === 'girl'
                    ? isNeon
                      ? 'bg-pink-950/40 border-pink-400 text-pink-200 ring-2 ring-pink-400/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : isLight
                      ? 'bg-[#244837]/10 border-[#244837] text-[#244837] ring-2 ring-[#244837]/20'
                      : 'bg-[#244837]/30 border-[#C5A880] text-[#C5A880] ring-2 ring-[#C5A880]/20'
                    : isLight
                    ? 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 text-neutral-700'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-850 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <span className="text-base">👗</span> Girl / Female
                  </span>
                  {gender === 'girl' && (
                    <span className="w-5 h-5 rounded-full bg-[#244837] dark:bg-[#C5A880] text-white dark:text-neutral-950 flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Feminine silhouette, contoured clavicle, flowing hairstyles, chic dresses, skirts & girl closet.
                </p>
              </button>
            </div>

            {/* Permanent Lock Notice */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Profile Lock Policy:</strong> To ensure accurate fitting simulations, you cannot switch gender inside the dashboard once entered.
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-500 font-medium text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-[#244837] hover:bg-[#1C382B] active:scale-95 transition shadow-lg shadow-[#244837]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {isSignUp
                ? `Create Account & Open Clean Dashboard (${gender === 'boy' ? 'Boy Profile' : 'Girl Profile'})`
                : `Sign In to Studio (${gender === 'boy' ? 'Boy Profile' : 'Girl Profile'})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Instant Presets */}
        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-400">
            {isSignUp ? 'Or start a new clean demo account instantly:' : 'Or sign in quickly with demo profile:'}
          </span>
          <div className="flex items-center justify-center gap-3 mt-2.5">
            <button
              type="button"
              onClick={() => handleQuickEnter('boy')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 active:scale-95 transition cursor-pointer"
            >
              ⚡ Fast New Boy (Clean Canvas)
            </button>
            <button
              type="button"
              onClick={() => handleQuickEnter('girl')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#B38F5F]/30 bg-[#B38F5F]/10 hover:bg-[#B38F5F]/20 text-[#B38F5F] dark:text-[#C5A880] active:scale-95 transition cursor-pointer"
            >
              ⚡ Fast New Girl (Clean Canvas)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
