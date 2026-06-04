import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Lightbulb, Send, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { validateIdea } from '../services/aiService';
import { saveStartupIdea } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

export default function IdeaValidator() {
  const { user } = useAuth();
  const { loadStartups } = useOutletContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      // 1. AI generation
      const analysis = await validateIdea(title.trim(), description.trim());
      setReport(analysis);

      // 2. Save startup idea database record
      await saveStartupIdea(
        user?.id,
        title.trim(),
        description.trim(),
        analysis.score,
        analysis
      );

      // 3. Refresh list in layout
      await loadStartups();
    } catch (err) {
      console.error(err);
      setError('An error occurred during evaluation. Please check your API keys or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine score color classes
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 55) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Lightbulb size={24} />
          </div>
          Idea Validation Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Input your startup vision and get a rigorous feasibility audit and validation score.
        </p>
      </div>

      {/* Input panel / Loading */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Startup Name / Working Title</label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="e.g. AgriFlow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Elevator Pitch & Core Value Proposition</label>
            <textarea
              required
              rows={4}
              disabled={loading}
              placeholder="Describe what problem you are solving, who your target customer is, how your product solves it, and your primary business model."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
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
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                AI Incubator Analyzing...
              </>
            ) : (
              <>
                <Send size={16} />
                Validate Startup Idea
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      )}

      {/* Validation Report View */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Summary Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Audit Complete</span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title} Assessment</h2>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-center ${getScoreColor(report.score)}`}>
                <span className="block text-[9px] uppercase tracking-wider font-semibold opacity-70">Validation Score</span>
                <span className="text-2xl font-black">{report.score} / 100</span>
              </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Problem-Solution Fit</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{report.problemSolutionFit}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Market Demand & Needs</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{report.marketNeed}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Scalability Potential</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{report.scalability}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Revenue & Monetization</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{report.revenuePotential}</p>
              </div>
            </div>
            
            {/* Innovation Rating */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500">Innovation Index</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">{report.innovationScore}%</span>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">Strategic Action Items</h3>
            <div className="space-y-3">
              {report.feedback && report.feedback.map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={16} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module Redirects */}
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={() => navigate('/competitor-analysis')}
              className="px-5 py-3 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              Analyze Competitors
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate('/business-plan')}
              className="px-5 py-3 rounded-2xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              Generate Business Plan
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
