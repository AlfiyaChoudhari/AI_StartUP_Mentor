import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Lightbulb, 
  Users, 
  FileText, 
  Award, 
  Clock, 
  ArrowRight,
  TrendingDown,
  Percent,
  CheckSquare,
  Square,
  Search,
  Trash2,
  Calendar,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStartupIdeas, deleteStartupIdea, getActivityLogs } from '../services/dbService';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeStartup, loadStartups } = useOutletContext();
  const navigate = useNavigate();
  
  const [allIdeas, setAllIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [activityLogs, setActivityLogs] = useState([]);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('founder_checklist_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, label: 'Write & validate startup idea', completed: false, route: '/idea-validator' },
      { id: 2, label: 'Analyze main competitor landscape', completed: false, route: '/competitor-analysis' },
      { id: 3, label: 'Draft detailed 1-page business plan', completed: false, route: '/business-plan' },
      { id: 4, label: 'Generate investor pitch slides', completed: false, route: '/pitch-deck' },
      { id: 5, label: 'Model 3-year revenue forecast', completed: false, route: '/revenue-forecaster' },
      { id: 6, label: 'Take Investor Readiness Quiz', completed: false, route: '/investor-readiness' },
    ];
  });

  useEffect(() => {
    if (user) {
      loadAllIdeas();
      setActivityLogs(getActivityLogs());
    }

    // Listen for custom activeStartupChanged events
    const handleStartupChange = () => {
      loadAllIdeas();
      setActivityLogs(getActivityLogs());
    };
    window.addEventListener('activeStartupChanged', handleStartupChange);
    return () => window.removeEventListener('activeStartupChanged', handleStartupChange);
  }, [user, activeStartup]);

  const loadAllIdeas = async () => {
    try {
      const list = await fetchStartupIdeas(user?.id);
      setAllIdeas(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteIdea = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this startup project? All associated data will be removed.')) {
      await deleteStartupIdea(id);
      await loadStartups();
      loadAllIdeas();
      setActivityLogs(getActivityLogs());
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    localStorage.setItem('founder_checklist_tasks', JSON.stringify(updated));
  };

  // Filter ideas
  const filteredIdeas = allIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterScore === 'all') return matchesSearch;
    if (filterScore === 'high') return matchesSearch && (idea.validation_score || 0) >= 80;
    if (filterScore === 'medium') return matchesSearch && (idea.validation_score || 0) >= 55 && (idea.validation_score || 0) < 80;
    if (filterScore === 'low') return matchesSearch && (idea.validation_score || 0) < 55;
    return matchesSearch;
  });

  // Calculate metrics
  const totalProjects = allIdeas.length;
  const avgValidationScore = totalProjects > 0
    ? Math.round(allIdeas.reduce((sum, item) => sum + (item.validation_score || 0), 0) / totalProjects)
    : 0;
  
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const checklistPercentage = Math.round((completedTasksCount / tasks.length) * 100);

  // Recommendations based on validation score
  const getAIRecommendation = () => {
    if (!activeStartup) return "Create or select a startup idea to generate tailored AI guidance.";
    const score = activeStartup.validation_score || 50;
    if (score >= 80) {
      return "Excellent idea validation score! Focus heavily on drafting your Slide Deck and building your clickable MVP. Engage with prospective investors early.";
    }
    if (score >= 55) {
      return "Moderate market potential. Run a SWOT analysis to identify opportunities, then pivot details of your proposed solution to tighten problem-solution fit.";
    }
    return "Low initial validation. Reach out to prospective customers in your target domain, ask about their day-to-day work pain-points, and re-architect your core business model.";
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Welcome back, {user?.name || 'Founder'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Here's the current roadmap status for your active projects.
          </p>
        </div>

        {activeStartup && (
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ACTIVE:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeStartup.title}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Ideas</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Lightbulb size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalProjects}</div>
          <p className="text-[11px] text-slate-400 mt-2">Saved projects in workspace</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Validation</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Percent size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{avgValidationScore}%</div>
          <p className="text-[11px] text-slate-400 mt-2">Overall cohort validation rate</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Roadmap Progress</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{checklistPercentage}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${checklistPercentage}%` }} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Status</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <Award size={18} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
            {activeStartup ? (activeStartup.validation_score >= 70 ? 'Investor Ready' : 'Incubating') : 'No Active Idea'}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Startup maturity scale</p>
        </div>

      </div>

      {/* Main Grid: Checklist & AI Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Tasks checklist */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Roadmap Progress Tracker</h2>
              <p className="text-xs text-slate-400">Complete tasks to build your startup foundation</p>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/35 border border-transparent hover:border-slate-200/30 dark:hover:border-slate-800/30 transition duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <button className="text-indigo-600 dark:text-indigo-400 shrink-0">
                    {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <span className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                    {task.label}
                  </span>
                </div>

                <Link 
                  to={task.route} 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                  title="Go to module"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: AI Assistant & Advisor */}
        <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Zap size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">AI Recommendation</h2>
          </div>
          
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {getAIRecommendation()}
            </p>
            {activeStartup && (
              <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Active Score</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{activeStartup.validation_score || 50}%</span>
              </div>
            )}
          </div>

          <Link 
            to="/mentor-chat" 
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/10 transition cursor-pointer"
          >
            Consult Mentor Chatbot
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* Ideas Repository */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Ideas Repository Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Saved Projects & Ideas</h2>
            <p className="text-xs text-slate-400">Search and filter validated ideas in your incubator portfolio</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            </div>

            {/* Filter */}
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Scores</option>
              <option value="high">High (&gt;=80%)</option>
              <option value="medium">Medium (55% - 79%)</option>
              <option value="low">Low (&lt;55%)</option>
            </select>
          </div>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Lightbulb className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-xs text-slate-500 dark:text-slate-400">No startup projects match your criteria.</p>
            <Link to="/idea-validator" className="inline-block mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer">
              Validate a New Idea
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => {
              const score = idea.validation_score || 50;
              let scoreColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
              if (score >= 80) scoreColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
              else if (score >= 55) scoreColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";

              return (
                <div 
                  key={idea.id}
                  onClick={() => handleSelectStartup(idea.id)}
                  className={`
                    group glass-card p-6 rounded-2xl cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 border
                    ${activeStartup?.id === idea.id ? 'border-indigo-500/80 shadow-md bg-indigo-50/10 dark:bg-indigo-950/10' : 'border-slate-200/50 dark:border-slate-800/50'}
                  `}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreColor}`}>
                        Score: {score}%
                      </span>
                      <button 
                        onClick={(e) => handleDeleteIdea(e, idea.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition text-sm mb-1 leading-snug">
                      {idea.title}
                    </h3>
                    
                    {/* Desc */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                    {activeStartup?.id === idea.id && (
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">ACTIVE PROJECT</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Logs Feed */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          Recent Activity Timeline
        </h2>
        {activityLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No recent activity logs recorded.</p>
        ) : (
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex gap-4 items-start text-xs border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2 py-1">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{log.action}</span>
                  <span className="text-slate-500 dark:text-slate-400 block">{log.details}</span>
                  <span className="text-[10px] text-slate-400 block pt-1">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
