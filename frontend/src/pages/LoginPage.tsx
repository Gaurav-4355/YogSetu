import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { normalizeIdentifier, validateIdentifier } from '../lib/identity';
import { Stethoscope, User, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'user' | 'doctor'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detectedType = identifier.includes('@') ? 'Email' : identifier.trim() ? 'Phone' : 'Identifier';

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter a Gmail or phone number.');
      return;
    }

    if (!validateIdentifier(identifier)) {
      setError('Please enter a valid email address or at least 7-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const { canonical } = normalizeIdentifier(identifier);
      login({
        identifier: canonical,
        name: displayName.trim() || undefined,
        role,
      });

      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        // Check if patient has any active assignment from a doctor
        const assignments = await api.getAssignments(canonical);
        if (assignments && assignments.length > 0) {
          navigate('/assigned');
        } else {
          navigate('/home');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoId: string, demoName: string, demoRole: 'user' | 'doctor') => {
    setIdentifier(demoId);
    setDisplayName(demoName);
    setRole(demoRole);
    login({ identifier: demoId, name: demoName, role: demoRole });

    if (demoRole === 'doctor') {
      navigate('/doctor');
    } else {
      setLoading(true);
      api.getAssignments(demoId).then((assigns) => {
        setLoading(false);
        if (assigns && assigns.length > 0) {
          navigate('/assigned');
        } else {
          navigate('/home');
        }
      }).catch(() => {
        setLoading(false);
        navigate('/home');
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            YogSetu • योगसेतु
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-850">
            Demo Sign-In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            No password required for hackathon presentation.
          </p>
        </div>

        {/* Visible Demo Note (Required by Section 2) */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Demo Prototype Notice</span>
            Demo sign-in. No password, no verification. A real production version would use OTP/Google sign-in and patient consent.
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft space-y-6">
          {/* Two Large Role Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  role === 'user'
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/30'
                    : 'border-sand-200 hover:border-sand-300 bg-sand-50/50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                  <User className="w-5 h-5" />
                </div>
                <div className="font-serif font-bold text-slate-850 text-sm">Normal User</div>
                <div className="text-[11px] text-slate-500">Patient or home yogi</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  role === 'doctor'
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/30'
                    : 'border-sand-200 hover:border-sand-300 bg-sand-50/50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="font-serif font-bold text-slate-850 text-sm">Doctor / PT</div>
                <div className="text-[11px] text-slate-500">Assign & track patients</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Gmail or Phone Number
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Detected: {detectedType}
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g., priya@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sand-200 text-slate-850 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Display Name <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder={role === 'doctor' ? 'e.g., Dr. Aarav Mehta' : 'e.g., Priya Sharma'}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sand-200 text-slate-850 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-sm font-medium"
              />
            </div>

            {error && (
              <p className="text-xs text-coral-600 font-semibold bg-coral-50 p-2.5 rounded-lg border border-coral-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Continue to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Box (Section 11) */}
          <div className="pt-4 border-t border-sand-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Try Demo Accounts (Pre-seeded with 14-day history)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('demo@yogsetu.test', 'Dr. Aarav Mehta (PT)', 'doctor')}
                className="p-2.5 text-left rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 transition text-xs"
              >
                <span className="font-bold text-teal-900 block">🩺 Dr. Demo</span>
                <span className="text-teal-700 text-[11px]">demo@yogsetu.test</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('priya.sharma@example.com', 'Priya Sharma', 'user')}
                className="p-2.5 text-left rounded-xl bg-sand-100 hover:bg-sand-200/70 border border-sand-200 transition text-xs"
              >
                <span className="font-bold text-slate-800 block">👤 Priya (Active Patient)</span>
                <span className="text-slate-500 text-[11px]">priya.sharma@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9876543210', 'Rajesh Patel', 'user')}
                className="p-2.5 text-left rounded-xl bg-sand-100 hover:bg-sand-200/70 border border-sand-200 transition text-xs"
              >
                <span className="font-bold text-slate-800 block">📱 Rajesh (Phone Patient)</span>
                <span className="text-slate-500 text-[11px]">+91 98765 43210</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ananya@example.com', 'Ananya Verma', 'user')}
                className="p-2.5 text-left rounded-xl bg-sand-100 hover:bg-sand-200/70 border border-sand-200 transition text-xs"
              >
                <span className="font-bold text-slate-800 block">🧘 Ananya (Self Plan)</span>
                <span className="text-slate-500 text-[11px]">ananya@example.com (No doctor)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
