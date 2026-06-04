import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Send, Download, AlertCircle, RefreshCw, Eye, Edit } from 'lucide-react';
import { generateBusinessPlan } from '../services/aiService';
import { saveBusinessPlan, fetchBusinessPlan } from '../services/dbService';
import { exportBusinessPlanPDF } from '../services/exportService';

export default function BusinessPlanGen() {
  const { activeStartup } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Sync with active startup and fetch existing plan
  useEffect(() => {
    if (activeStartup) {
      loadExistingPlan(activeStartup.id);
    } else {
      setPlan(null);
    }
  }, [activeStartup]);

  // Reload plan when project changes
  useEffect(() => {
    const handleStartupChange = () => {
      if (activeStartup) {
        loadExistingPlan(activeStartup.id);
      }
    };
    window.addEventListener('activeStartupChanged', handleStartupChange);
    return () => window.removeEventListener('activeStartupChanged', handleStartupChange);
  }, [activeStartup]);

  const loadExistingPlan = async (startupId) => {
    setLoading(true);
    setPlan(null);
    setError('');
    setIsEditing(false);
    try {
      const data = await fetchBusinessPlan(startupId);
      if (data) {
        setPlan(data.plan_content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!activeStartup) return;

    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const generated = await generateBusinessPlan(activeStartup.title, activeStartup.description);
      setPlan(generated);
      await saveBusinessPlan(activeStartup.id, generated);
    } catch (err) {
      console.error(err);
      setError('An error occurred during plan generation. Check your configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!activeStartup || !plan) return;
    setLoading(true);
    try {
      await saveBusinessPlan(activeStartup.id, plan);
      setIsEditing(false);
      alert('Business Plan changes saved successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save your custom business plan edits.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeStartup || !plan) return;
    exportBusinessPlanPDF(activeStartup.title, plan);
  };

  const updatePlanField = (field, val) => {
    setPlan(prev => ({
      ...prev,
      [field]: val
    }));
  };

  if (!activeStartup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <FileText className="mx-auto text-slate-400" size={48} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Active Startup Project</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an active startup project from the top dropdown selector, or validate a new idea on the Dashboard first.
        </p>
      </div>
    );
  }

  const sections = [
    { key: 'executiveSummary', label: '1. Executive Summary' },
    { key: 'problemStatement', label: '2. Problem Statement' },
    { key: 'solution', label: '3. Proposed Solution' },
    { key: 'targetMarket', label: '4. Target Market & Segmentation' },
    { key: 'revenueModel', label: '5. Revenue & Monetization Model' },
    { key: 'marketingStrategy', label: '6. Marketing & Distribution' },
    { key: 'operationsPlan', label: '7. Operational Roadmap' },
    { key: 'financialPlan', label: '8. Financial Plan & Runway' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <FileText size={24} />
            </div>
            Business Plan Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Build a comprehensive one-page strategic business plan tailored for incubator audits and grants.
          </p>
        </div>

        {plan && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Eye size={14} />
                  Preview Plan
                </>
              ) : (
                <>
                  <Edit size={14} />
                  Edit Plan
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Prompt Panel */}
      {!plan && !loading && (
        <div className="glass-panel p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Generate Business Plan for {activeStartup.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our AI will draft a complete business plan spanning target segments, distribution, ops, and finances using your startup specifications.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            Draft Business Plan Outline
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-28" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
                <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Document Viewer / Editor */}
      {plan && !loading && (
        <div className="space-y-6">
          
          {/* Main Document Panel */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            
            {/* Header branding */}
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{activeStartup.title}</span>
              <span className="text-slate-400">Date generated: {new Date().toLocaleDateString()}</span>
            </div>

            {/* Render sections */}
            <div className="space-y-6">
              {sections.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide border-l-2 border-indigo-600 pl-3">
                    {label}
                  </h3>
                  
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={plan[key] || ''}
                      onChange={(e) => updatePlanField(key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                      {plan[key] || 'Not specified.'}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Re-generate option */}
            {!isEditing && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Need revisions? Re-generate the draft using AI.</span>
                <button
                  onClick={handleGenerate}
                  className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Re-draft Plan
                </button>
              </div>
            )}

            {/* Save Edits button */}
            {isEditing && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button
                  onClick={handleSaveEdits}
                  className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  Save Plan Edits
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
