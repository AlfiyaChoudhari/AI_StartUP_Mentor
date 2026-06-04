import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: resetError } = await forgotPassword(email);
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <div className="w-full max-w-md">
        
        {/* Logo/Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20 mb-4">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            AI Startup Mentor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Accelerate your founder journey from idea to funding</p>
        </div>

        {/* Forgot Password Panel */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Reset Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Enter your email and we'll send you a link to restore access.</p>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
              <CheckCircle className="shrink-0 mt-0.5" size={16} />
              <span>A password reset link has been dispatched to your email. Check your spam folder if it doesn't arrive.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. founder@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
            >
              {loading ? 'Sending Recovery Mail...' : 'Send Recovery Link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition">
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
