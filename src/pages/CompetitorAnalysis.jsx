import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Send, AlertCircle, RefreshCw, Trophy, ShieldAlert, BadgeInfo } from 'lucide-react';
import { analyzeCompetitors } from '../services/aiService';
import { saveCompetitorReport, fetchCompetitorReport } from '../services/dbService';

export default function CompetitorAnalysis() {
  const { activeStartup } = useOutletContext();
  
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // Sync with active startup and fetch existing report
  useEffect(() => {
    if (activeStartup) {
      setDomain(activeStartup.title);
      setDescription(activeStartup.description || '');
      loadExistingReport(activeStartup.id);
    } else {
      setReport(null);
      setDomain('');
      setDescription('');
    }
  }, [activeStartup]);

  // Reload report when project changes
  useEffect(() => {
    const handleStartupChange = () => {
      if (activeStartup) {
        loadExistingReport(activeStartup.id);
      }
    };
    window.addEventListener('activeStartupChanged', handleStartupChange);
    return () => window.removeEventListener('activeStartupChanged', handleStartupChange);
  }, [activeStartup]);

  const loadExistingReport = async (startupId) => {
    setLoading(true);
    setReport(null);
    setError('');
    try {
      const data = await fetchCompetitorReport(startupId);
      if (data) {
        setReport(data.report_content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!activeStartup) return;
    if (!domain.trim() || !description.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const analysis = await analyzeCompetitors(domain.trim(), description.trim());
      setReport(analysis);
      await saveCompetitorReport(activeStartup.id, analysis);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please check your configurations and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeStartup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <Users className="mx-auto text-slate-400" size={48} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Active Startup Project</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an active startup project from the top dropdown selector, or validate a new idea on the Dashboard first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Users size={24} />
          </div>
          Competitor Analysis
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Perform digital forensics on competing services to define your unique product-led competitive advantage.
        </p>
      </div>

      {/* Audit request panel */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Startup Domain / Brand</label>
              <input
                type="text"
                required
                disabled={loading}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Short Description / Target Industry</label>
              <input
                type="text"
                required
                disabled={loading}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Scanning competitor landscape...
              </>
            ) : (
              <>
                <Send size={14} />
                Generate Competitor Report
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {[1, 2, 3].map(n => (
              <div key={n} className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Report Display */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Table Matrix */}
          <div className="glass-panel rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                Competitor Feature Matrix
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4 w-40">Competitor</th>
                    <th className="p-4">Key Strengths</th>
                    <th className="p-4">Key Weaknesses</th>
                    <th className="p-4 w-40">Pricing Model</th>
                    <th className="p-4 w-48">Target Audience</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {report.competitors && report.competitors.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{comp.name}</td>
                      <td className="p-4 leading-relaxed">{comp.strengths}</td>
                      <td className="p-4 leading-relaxed text-rose-600 dark:text-rose-400">{comp.weaknesses}</td>
                      <td className="p-4 font-medium">{comp.pricing}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 leading-normal">{comp.audience}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Moat / Advantage suggestions */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className="text-indigo-600 dark:text-indigo-400" />
              Strategic Advantage Recommendations
            </h3>
            <div className="space-y-3">
              {report.competitiveAdvantage && report.competitiveAdvantage.map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs text-slate-600 dark:text-slate-300">
                  <BadgeInfo className="shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" size={16} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
