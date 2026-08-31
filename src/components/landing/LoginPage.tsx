import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from '../../firebase';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Globe2,
  Chrome,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  user: User | null;
  onBackToLanding: () => void;
  onLaunchApp: () => void;
}

export const LoginPage: React.FC<Props> = ({ user, onBackToLanding, onLaunchApp }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLaunchApp();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLaunchApp();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword123!');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Left Visual Hero Banner */}
      <div className="relative flex-1 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-8 md:p-16 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Landing Page
          </button>
        </div>

        {/* Mid Title & Visual Graphic */}
        <div className="relative z-10 my-12 max-w-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/30 mb-6">
            <Globe2 className="h-8 w-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl leading-tight">
            VOLU-CAD 3D <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Officer Portal
            </span>
          </h1>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Secure Government &amp; Survey Officer Portal for 3D ULPIN spatial data verification, 3D floor explosion analysis, and Digital Property Passport validation.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Role-Based Access Control (RBAC)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Firebase Authenticated Encryption</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer info */}
        <div className="relative z-10 text-[11px] text-slate-500">
          VOLU-CAD 3D Spatial System
        </div>
      </div>

      {/* Right Login / Account Form */}
      <div className="w-full md:w-[480px] bg-slate-900 p-8 md:p-12 flex flex-col justify-center border-slate-800">
        <div className="w-full max-w-sm mx-auto">
          {user ? (
            /* Signed In View */
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 font-bold text-2xl">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.displayName || 'Authorized Officer'}</h2>
                <p className="text-xs text-slate-400 mt-1">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Active Authenticated Session
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110"
                >
                  <Globe2 className="h-4 w-4" /> Launch 3D GIS Platform
                </button>
                <button
                  onClick={() => signOut(auth)}
                  className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {mode === 'login' ? 'Officer Sign In' : 'Register Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter credentials to access 3D Cadastral Mapping
                </p>
              </div>

              {/* Mode Selector */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Official Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@nic.in"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
                >
                  <UserIcon className="h-4 w-4" />
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
                </button>
              </form>

              <div className="relative flex items-center justify-center border-t border-slate-800 pt-3">
                <span className="bg-slate-900 px-2 text-[10px] uppercase tracking-wider text-slate-500">Or Continue With</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800"
              >
                <Chrome className="h-4 w-4 text-cyan-400" />
                Sign In with Google
              </button>

              {/* DEMO Login Presets */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Quick Demo Presets:</span>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('surveyor@sih2026.gov.in')}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 py-1.5 text-[10px] text-cyan-400 font-medium hover:bg-slate-800"
                  >
                    Survey Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin@sih2026.gov.in')}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 py-1.5 text-[10px] text-purple-400 font-medium hover:bg-slate-800"
                  >
                    System Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
