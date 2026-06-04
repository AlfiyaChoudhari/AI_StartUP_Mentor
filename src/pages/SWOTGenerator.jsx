import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldAlert, Send, Plus, Trash2, Shield, AlertTriangle, TrendingUp, HelpCircle, RefreshCw } from 'lucide-react';
import { generateSWOT } from '../services/aiService';

export default function SWOTGenerator() {
  const { activeStartup } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [swot, setSwot] = useState(null);
  const [error, setError] = useState('');
  const [newInputs, setNewInputs] = useState({ strengths: '', weaknesses: '', opportunities: '', threats: '' });

  useEffect(() => {
    if (activeStartup) {
      loadSavedSWOT();
    } else {
      setSwot(null);
    }
  }, [activeStartup]);

  const loadSavedSWOT = () => {
    // Check if there is an existing SWOT saved locally for this project
    const saved = localStorage.getItem(`swot_${activeStartup.id}`);
    if (saved) {
      setSwot(JSON.parse(saved));
    } else {
      setSwot(null);
    }
  };

  const handleGenerate = async () => {
    if (!activeStartup) return;

    setLoading(true);
    setError('');
    setSwot(null);

    try {
      const generated = await generateSWOT(activeStartup.title, activeStartup.description);
      setSwot(generated);
      localStorage.setItem(`swot_${activeStartup.id}`, JSON.stringify(generated));
    } catch (err) {
      console.error(err);
      setError('Failed to generate SWOT analysis. Please check your config keys.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (key) => {
    const text = newInputs[key];
    if (!text.trim() || !swot) return;

    const updated = {
      ...swot,
      [key]: [...(swot[key] || []), text.trim()]
    };
    setSwot(updated);
    localStorage.setItem(`swot_${activeStartup.id}`, JSON.stringify(updated));
    setNewInputs(prev => ({ ...prev, [key]: '' }));
  };

  const handleRemoveItem = (key, idx) => {
    if (!swot) return;
    const updatedItems = [...swot[key]];
    updatedItems.splice(idx, 1);

    const updated = {
      ...swot,
      [key]: updatedItems
    };
    setSwot(updated);
    localStorage.setItem(`swot_${activeStartup.id}`, JSON.stringify(updated));
  };

  if (!activeStartup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="mx-auto text-slate-400" size={48} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Active Startup Project</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an active startup project from the top dropdown selector, or validate a new idea on the Dashboard first.
        </p>
      </div>
    );
  }

  const quadrantStyles = {
    strengths: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-950/20',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      header: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
      icon: Shield
    },
    weaknesses: {
      bg: 'bg-amber-500/5 dark:bg-amber-950/20',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      header: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
      icon: AlertTriangle
    },
    opportunities: {
      bg: 'bg-blue-500/5 dark:bg-blue-950/20',
      border: 'border-blue-500/20 dark:border-blue-500/30',
      header: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      icon: TrendingUp
    },
    threats: {
      bg: 'bg-rose-500/5 dark:bg-rose-950/20',
      border: 'border-rose-500/20 dark:border-rose-500/30',
      header: 'text-rose-700 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
      icon: HelpCircle
    }
  };

  const keys = ['strengths', 'weaknesses', 'opportunities', 'threats'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            SWOT Analysis Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Map internal capacities against external market pressures to build strategic defenses.
          </p>
        </div>

        {swot && (
          <button
            onClick={handleGenerate}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            Re-generate
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Prompt Panel */}
      {!swot && !loading && (
        <div className="glass-panel p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <ShieldAlert size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Generate SWOT for {activeStartup.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our AI auditor will map out the internal Strengths/Weaknesses and external Opportunities/Threats based on your business vision.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            Run SWOT Audit
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* SWOT Quadrant Board */}
      {swot && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keys.map((key) => {
            const style = quadrantStyles[key];
            const Icon = style.icon;
            return (
              <div
                key={key}
                className={`
                  p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm
                  ${style.bg} ${style.border}
                `}
              >
                {/* Quadrant Header */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${style.header}`}>
                      <span className={`p-1.5 rounded-lg ${style.iconBg}`}><Icon size={14} /></span>
                      {key}
                    </h3>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {(swot[key] || []).length === 0 ? (
                      <p className="text-[11px] italic text-slate-400">No items listed. Add one below.</p>
                    ) : (
                      swot[key].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/20 dark:border-slate-800/20">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">{item}</p>
                          <button
                            onClick={() => handleRemoveItem(key, idx)}
                            className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Custom Item Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAddItem(key); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder={`Add custom ${key.slice(0, -1)}...`}
                    value={newInputs[key]}
                    onChange={(e) => setNewInputs(prev => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/70 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </form>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
