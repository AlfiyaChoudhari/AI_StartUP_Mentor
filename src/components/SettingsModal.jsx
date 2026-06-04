import React, { useState, useEffect } from 'react';
import { X, Key, Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured as originalSupabaseConfigured } from '../supabaseClient';
import { isGroqConfigured as originalGroqConfigured } from '../services/aiService';

export default function SettingsModal({ isOpen, onClose }) {
  const { reloadConfig } = useAuth();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSupabaseUrl(localStorage.getItem('VITE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '');
      setSupabaseKey(localStorage.getItem('VITE_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
      setGroqKey(localStorage.getItem('VITE_GROQ_API_KEY') || import.meta.env.VITE_GROQ_API_KEY || '');
      setSavedStatus(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('VITE_SUPABASE_URL', supabaseUrl.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', supabaseKey.trim());
    localStorage.setItem('VITE_GROQ_API_KEY', groqKey.trim());
    
    setSavedStatus(true);
    reloadConfig();
    
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
      // Reload page to re-initialize Supabase client cleanly
      window.location.reload();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('VITE_SUPABASE_URL');
    localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
    localStorage.removeItem('VITE_GROQ_API_KEY');
    setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
    setSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
    setGroqKey(import.meta.env.VITE_GROQ_API_KEY || '');
    reloadConfig();
    alert('Local configurations reset to .env defaults.');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-slate-900 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">API Configuration</h2>
              <p className="text-xs text-slate-400">Manage your connections & service keys</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-xs space-y-1">
            <span className="font-semibold block">Running in Local Sandbox Mode by default</span>
            <span>Leave fields empty to run locally using browser memory (mock data will generate automatically). Input keys below to connect real-time databases and the Groq AI service.</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xxx.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Supabase Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Groq API Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Key className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Get keys at console.groq.com (Llama-3.3 supported)</p>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              <RefreshCw size={14} />
              Reset defaults
            </button>

            <button
              type="submit"
              disabled={savedStatus}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {savedStatus ? (
                <>
                  <CheckCircle size={14} />
                  Configurations Saved!
                </>
              ) : (
                'Save and Reload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
