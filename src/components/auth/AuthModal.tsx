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
import { Shield, Lock, Mail, User as UserIcon, LogOut, X, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, user, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('Authentication failed. Please check your credentials.');
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
      onClose();
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        <div className="p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {user ? 'User Profile Account' : mode === 'login' ? 'Officer & User Portal' : 'Create VOLU-CAD Account'}
                </h2>
                <p className="text-xs text-slate-400">
                  {user ? 'Authenticated Session' : 'Firebase Authentication'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {user ? (
            /* Signed In User View */
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-14 w-14 rounded-full border-2 border-cyan-400 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xl border border-cyan-500/30">
                    {(user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-bold text-white text-base truncate">
                    {user.displayName || 'Authorized User'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Authenticated via Firebase
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                <p><strong className="text-slate-200">UID:</strong> <span className="font-mono text-cyan-400">{user.uid}</span></p>
                <p className="mt-1"><strong className="text-slate-200">Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              </div>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          ) : (
            /* Auth Form (Login / Register) */
            <div className="mt-5 space-y-4">
              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
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

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@nic.in"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
                >
                  <UserIcon className="h-4 w-4" />
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
                </button>
              </form>

              <div className="relative flex items-center justify-center border-t border-slate-800 pt-3">
                <span className="bg-slate-900 px-2 text-[10px] uppercase text-slate-500">Or continue with</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-98"
              >
                <Chrome className="h-4 w-4 text-cyan-400" />
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
