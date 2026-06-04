import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, Send, AlertCircle, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { assessInvestorReadiness } from '../services/aiService';

export default function InvestorReadiness() {
  const { activeStartup } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  
  // Quiz states
  const [answers, setAnswers] = useState({
    productStage: 'ideation',
    marketValidation: 'none',
    revenueModel: 'subscription',
    teamStrength: 'solo',
    currentTraction: 'none'
  });

  useEffect(() => {
    if (activeStartup) {
      loadSavedAssessment();
    } else {
      setReport(null);
    }
  }, [activeStartup]);

  const loadSavedAssessment = () => {
    const saved = localStorage.getItem(`readiness_${activeStartup.id}`);
    if (saved) {
      setReport(JSON.parse(saved));
    } else {
      setReport(null);
      // Reset quiz defaults
      setAnswers({
        productStage: 'ideation',
        marketValidation: 'none',
        revenueModel: 'subscription',
        teamStrength: 'solo',
        currentTraction: 'none'
      });
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!activeStartup) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const assessment = await assessInvestorReadiness(answers);
      setReport(assessment);
      localStorage.setItem(`readiness_${activeStartup.id}`, JSON.stringify(assessment));
    } catch (err) {
      console.error(err);
      setError('An error occurred during VC evaluation. Check your config keys.');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  if (!activeStartup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <Award className="mx-auto text-slate-400" size={48} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Active Startup Project</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an active startup project from the top dropdown selector, or validate a new idea on the Dashboard first.
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 75) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 45) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Award size={24} />
          </div>
          Investor Readiness Assessment
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Perform a rigorous VC portfolio self-assessment to discover structural flaws and generate a Readiness Index.
        </p>
      </div>

      {/* Main Grid: Quiz Form vs Audit Report */}
      {!report && !loading && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            Readiness Evaluation Survey
          </h2>
          
          <form onSubmit={handleQuizSubmit} className="space-y-6">
            
            {/* Q1 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">1. What is your product maturity stage?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { id: 'ideation', label: 'Ideation / Conceptual' },
                  { id: 'mvp', label: 'Prototype / MVP Built' },
                  { id: 'launch', label: 'Public Beta / Launched' },
                  { id: 'growth', label: 'Product Market Scaling' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateAnswer('productStage', opt.id)}
                    className={`p-3.5 rounded-xl border text-left font-medium transition cursor-pointer ${answers.productStage === opt.id ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-350'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">2. What level of market validation have you achieved?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { id: 'none', label: 'None (Hypothetical)' },
                  { id: 'surveys', label: 'Surveys & Interviews' },
                  { id: 'pilots', label: 'Active Pilot Projects' },
                  { id: 'revenue', label: 'Organic Sales Revenue' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateAnswer('marketValidation', opt.id)}
                    className={`p-3.5 rounded-xl border text-left font-medium transition cursor-pointer ${answers.marketValidation === opt.id ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-350'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">3. What is your primary monetization or business model?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { id: 'subscription', label: 'SaaS Subscription' },
                  { id: 'transactional', label: 'Transactional Fee' },
                  { id: 'sales', label: 'Direct Enterprise Sales' },
                  { id: 'advertising', label: 'Freemium / Advertising' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateAnswer('revenueModel', opt.id)}
                    className={`p-3.5 rounded-xl border text-left font-medium transition cursor-pointer ${answers.revenueModel === opt.id ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-350'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">4. How is the founding team structured?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { id: 'solo', label: 'Solo Founder' },
                  { id: 'co-founders', label: '2 Co-founders (Biz + Tech)' },
                  { id: 'hired', label: 'Biz/Tech + Salaried team' },
                  { id: 'advisors', label: 'Complete Team + Advisory' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateAnswer('teamStrength', opt.id)}
                    className={`p-3.5 rounded-xl border text-left font-medium transition cursor-pointer ${answers.teamStrength === opt.id ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-350'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q5 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">5. What traction metrics do you have?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { id: 'none', label: 'No data points yet' },
                  { id: 'waitlist', label: 'Waitlist / Letter of Intent' },
                  { id: 'users', label: 'Active User growth MoM' },
                  { id: 'customers', label: 'Paying users / ARR' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateAnswer('currentTraction', opt.id)}
                    className={`p-3.5 rounded-xl border text-left font-medium transition cursor-pointer ${answers.currentTraction === opt.id ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-350'}`}
                  >
                    {opt.label}
                  </button>
                ))}
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
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send size={16} />
              Evaluate Investor Readiness
            </button>

          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      )}

      {/* Assessment Audit Report display */}
      {report && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Circular Score & Rating Banner */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-2">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Audit Evaluation</span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Investor Readiness Report</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                This assessment grades product lifecycle alignment, addressable market metrics, team capacities, and funding maturity.
              </p>
            </div>
            
            <div className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center min-w-[150px] ${getScoreColor(report.readinessScore)}`}>
              <span className="text-[9px] uppercase tracking-wider font-extrabold block opacity-80">Readiness Score</span>
              <span className="text-3xl font-black">{report.readinessScore}%</span>
              <span className="block text-[10px] font-bold mt-1 uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">{report.maturityRating}</span>
            </div>
          </div>

          {/* Audit Writeups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Product & Engineering Assessment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed">{report.productEvaluation}</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Market & TAM Assessment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-355 leading-relaxed">{report.marketEvaluation}</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Revenue & Monetization Assessment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-355 leading-relaxed">{report.revenueEvaluation}</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Founding Team Capacity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-355 leading-relaxed">{report.teamEvaluation}</p>
            </div>

          </div>

          {/* Core milestones */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">Required Milestones to Raise Capital</h3>
            <div className="space-y-3">
              {report.milestones && report.milestones.map((m, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={16} />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Quiz / Audit again button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                localStorage.removeItem(`readiness_${activeStartup.id}`);
                setReport(null);
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer"
            >
              Re-take Readiness quiz
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
