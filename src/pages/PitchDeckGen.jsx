import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Presentation, Send, Download, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Edit, Save } from 'lucide-react';
import { generatePitchDeck } from '../services/aiService';
import { savePitchDeck, fetchPitchDeck } from '../services/dbService';
import { exportPitchDeckPDF, exportPitchDeckPPTX } from '../services/exportService';

export default function PitchDeckGen() {
  const { activeStartup } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [error, setError] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTheme, setActiveTheme] = useState('navy'); // navy, emerald, purple, minimal

  // Sync with active startup and fetch existing deck
  useEffect(() => {
    if (activeStartup) {
      loadExistingDeck(activeStartup.id);
    } else {
      setSlides([]);
    }
  }, [activeStartup]);

  // Reload deck when project changes
  useEffect(() => {
    const handleStartupChange = () => {
      if (activeStartup) {
        loadExistingDeck(activeStartup.id);
      }
    };
    window.addEventListener('activeStartupChanged', handleStartupChange);
    return () => window.removeEventListener('activeStartupChanged', handleStartupChange);
  }, [activeStartup]);

  const loadExistingDeck = async (startupId) => {
    setLoading(true);
    setSlides([]);
    setError('');
    setIsEditing(false);
    setCurrentSlideIndex(0);
    try {
      const data = await fetchPitchDeck(startupId);
      if (data) {
        setSlides(data.deck_content.slides || []);
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
    setSlides([]);

    try {
      const generated = await generatePitchDeck(activeStartup.title, activeStartup.description);
      setSlides(generated.slides || []);
      await savePitchDeck(activeStartup.id, generated);
    } catch (err) {
      console.error(err);
      setError('An error occurred during pitch generation. Check your configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!activeStartup || slides.length === 0) return;
    setLoading(true);
    try {
      await savePitchDeck(activeStartup.id, { slides });
      setIsEditing(false);
      alert('Slide deck updates saved successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save slide deck edits.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeStartup || slides.length === 0) return;
    exportPitchDeckPDF(activeStartup.title, slides);
  };

  const handleExportPPTX = () => {
    if (!activeStartup || slides.length === 0) return;
    exportPitchDeckPPTX(activeStartup.title, slides);
  };

  const handleSlideContentChange = (val) => {
    const updated = [...slides];
    updated[currentSlideIndex].content = val;
    setSlides(updated);
  };

  const handleSlideTitleChange = (val) => {
    const updated = [...slides];
    updated[currentSlideIndex].title = val;
    setSlides(updated);
  };

  const getThemeClass = () => {
    switch (activeTheme) {
      case 'emerald':
        return 'bg-emerald-950 text-emerald-50 border-emerald-800';
      case 'purple':
        return 'bg-violet-950 text-violet-50 border-violet-800';
      case 'minimal':
        return 'bg-white text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800';
      case 'navy':
      default:
        return 'bg-slate-950 text-slate-100 border-slate-800';
    }
  };

  const getAccentClass = () => {
    switch (activeTheme) {
      case 'emerald': return 'bg-emerald-500';
      case 'purple': return 'bg-violet-500';
      case 'minimal': return 'bg-indigo-600 dark:bg-indigo-400';
      case 'navy':
      default: return 'bg-blue-500';
    }
  };

  if (!activeStartup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <Presentation className="mx-auto text-slate-400" size={48} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Active Startup Project</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an active startup project from the top dropdown selector, or validate a new idea on the Dashboard first.
        </p>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Presentation size={24} />
            </div>
            Pitch Deck Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Build investor presentation slides, customize themes, and export directly as PowerPoint files.
          </p>
        </div>

        {slides.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save size={14} />
                  Done Editing
                </>
              ) : (
                <>
                  <Edit size={14} />
                  Edit Content
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              PDF
            </button>
            <button
              onClick={handleExportPPTX}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              <Download size={14} />
              PowerPoint (PPTX)
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
      {slides.length === 0 && !loading && (
        <div className="glass-panel p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Presentation size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Generate Pitch Deck for {activeStartup.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our AI will formulate a complete 10-slide outline: Problem, Solution, Opportunity, Traction, Financials, and Ask.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            Generate Slide Outline
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
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      )}

      {/* Slide Viewer Layout */}
      {slides.length > 0 && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel: Slide outline list */}
          <div className="lg:col-span-1 glass-panel p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-1 max-h-[500px] overflow-y-auto">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Slide Navigation</span>
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setIsEditing(false);
                }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex justify-between items-center cursor-pointer
                  ${idx === currentSlideIndex 
                    ? 'bg-indigo-50 dark:bg-indigo-950/65 font-bold text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600 rounded-l-none' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                `}
              >
                <span className="truncate">{s.title}</span>
                <span className="text-[10px] opacity-60">S{s.slideNumber || idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Right panel: Active Slide Preview and customizations */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Customizer row */}
            <div className="flex justify-between items-center p-3 glass-panel rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customize Theme</span>
              <div className="flex gap-2">
                {[
                  { id: 'navy', label: 'Navy Dark', color: 'bg-slate-950 border-slate-800' },
                  { id: 'emerald', label: 'Forest Green', color: 'bg-emerald-950 border-emerald-800' },
                  { id: 'purple', label: 'Vibrant Indigo', color: 'bg-violet-950 border-violet-800' },
                  { id: 'minimal', label: 'Classic Light', color: 'bg-white border-slate-200' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={`
                      w-6 h-6 rounded-full border-2 cursor-pointer transition
                      ${theme.color}
                      ${activeTheme === theme.id ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-80 hover:opacity-100'}
                    `}
                    title={theme.label}
                  />
                ))}
              </div>
            </div>

            {/* Slide Presentation Card */}
            <div className={`
              aspect-[16/9] w-full p-8 md:p-12 rounded-3xl border shadow-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden
              ${getThemeClass()}
            `}>
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${getAccentClass()}`} />

              {/* Header */}
              <div className="flex justify-between items-start">
                {isEditing ? (
                  <input
                    type="text"
                    value={currentSlide?.title || ''}
                    onChange={(e) => handleSlideTitleChange(e.target.value)}
                    className="w-2/3 bg-transparent border-b border-dashed border-slate-400 focus:outline-none focus:border-indigo-500 text-lg md:text-2xl font-bold py-1"
                  />
                ) : (
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight">
                    {currentSlide?.title || 'Slide Title'}
                  </h2>
                )}
                
                <span className="text-xs font-bold opacity-40">SLIDE {currentSlide?.slideNumber || currentSlideIndex + 1} / {slides.length}</span>
              </div>

              {/* Content body */}
              <div className="flex-1 my-6 flex flex-col justify-center">
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={currentSlide?.content || ''}
                    onChange={(e) => handleSlideContentChange(e.target.value)}
                    className="w-full bg-slate-100/10 p-3 rounded-lg text-xs font-mono border border-slate-400/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter bullet points, one per line..."
                  />
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {currentSlide?.content ? (
                      currentSlide.content.split('\n').map((line, lidx) => (
                        <p key={lidx} className="text-xs md:text-sm font-medium leading-relaxed opacity-90">
                          {line.trim().startsWith('•') || line.trim().startsWith('-') ? line : `• ${line}`}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs italic opacity-40">No slide content.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-400/20 pt-4 flex justify-between items-center text-[10px] opacity-40">
                <span>{activeStartup.title.toUpperCase()}</span>
                <span>AI Investor Presentation</span>
              </div>
            </div>

            {/* Slide Pagination Controls */}
            <div className="flex justify-between items-center">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => {
                  setCurrentSlideIndex(prev => prev - 1);
                  setIsEditing(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                Previous Slide
              </button>

              {isEditing ? (
                <button
                  onClick={handleSaveEdits}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save size={14} />
                  Save Presentation Updates
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Slide {currentSlideIndex + 1} of {slides.length}</span>
              )}

              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => {
                  setCurrentSlideIndex(prev => prev + 1);
                  setIsEditing(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer"
              >
                Next Slide
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
