import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Users, 
  FileText, 
  Presentation, 
  TrendingUp, 
  MessageSquare, 
  Award, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Database,
  Building,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SettingsModal from './SettingsModal';
import { fetchStartupIdeas, saveStartupIdea } from '../services/dbService';

export default function Layout() {
  const { user, signOut, sandboxMode } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [startups, setStartups] = useState([]);
  const [activeStartup, setActiveStartup] = useState(null);
  const [showAddStartup, setShowAddStartup] = useState(false);
  const [newStartupTitle, setNewStartupTitle] = useState('');

  // Load user's startup ideas
  useEffect(() => {
    if (user) {
      loadStartups();
    }
  }, [user]);

  const loadStartups = async () => {
    try {
      const list = await fetchStartupIdeas(user?.id);
      setStartups(list);
      
      const savedId = localStorage.getItem('active_startup_id');
      const found = list.find(s => s.id === savedId) || list[0];
      if (found) {
        setActiveStartup(found);
        localStorage.setItem('active_startup_id', found.id);
      } else {
        setActiveStartup(null);
        localStorage.removeItem('active_startup_id');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectStartup = (id) => {
    const found = startups.find(s => s.id === id);
    if (found) {
      setActiveStartup(found);
      localStorage.setItem('active_startup_id', found.id);
      // Dispatch a custom event to notify child components that startup changed
      window.dispatchEvent(new Event('activeStartupChanged'));
    }
  };

  const handleCreateStartup = async (e) => {
    e.preventDefault();
    if (!newStartupTitle.trim()) return;

    try {
      const newIdea = await saveStartupIdea(
        user?.id,
        newStartupTitle,
        "A new startup project ready for validation.",
        50,
        null
      );
      setNewStartupTitle('');
      setShowAddStartup(false);
      
      // Reload list and set active
      const list = await fetchStartupIdeas(user?.id);
      setStartups(list);
      setActiveStartup(newIdea);
      localStorage.setItem('active_startup_id', newIdea.id);
      window.dispatchEvent(new Event('activeStartupChanged'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Idea Validator', path: '/idea-validator', icon: Lightbulb },
    { name: 'Competitor Analysis', path: '/competitor-analysis', icon: Users },
    { name: 'Business Plan', path: '/business-plan', icon: FileText },
    { name: 'Pitch Deck', path: '/pitch-deck', icon: Presentation },
    { name: 'Revenue Forecasting', path: '/revenue-forecaster', icon: TrendingUp },
    { name: 'Mentor Chat', path: '/mentor-chat', icon: MessageSquare },
    { name: 'SWOT Analysis', path: '/swot-generator', icon: ShieldAlert },
    { name: 'Investor Readiness', path: '/investor-readiness', icon: Award }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo */}
        <div className="h-20 px-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-500/20">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                AI Startup Mentor
              </span>
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-widest uppercase">
                CO-FOUNDER SUITE
              </span>
            </div>
          </Link>
          <button className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200'}
                `}
              >
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
          {/* User profile card */}
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
              {user?.name ? user.name[0].toUpperCase() : 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name || 'Founder'}</span>
              <span className="block text-[11px] text-slate-400 truncate">{user?.email}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            >
              <Settings size={14} />
              Settings
            </button>
            <button 
              onClick={handleSignOut}
              className="py-2 px-3 flex items-center justify-center rounded-xl border border-rose-200 dark:border-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Burger toggle for mobile */}
            <button 
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Active Project Dropdown */}
            <div className="flex items-center gap-2">
              <Building size={16} className="text-slate-400" />
              {showAddStartup ? (
                <form onSubmit={handleCreateStartup} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-150">
                  <input
                    type="text"
                    required
                    placeholder="Enter startup name..."
                    value={newStartupTitle}
                    onChange={(e) => setNewStartupTitle(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button type="submit" className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs cursor-pointer">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowAddStartup(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={activeStartup?.id || ''}
                    onChange={(e) => handleSelectStartup(e.target.value)}
                    className="bg-transparent border-0 font-semibold text-sm text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer pr-8 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  >
                    {startups.length === 0 ? (
                      <option value="">No Active Startup</option>
                    ) : (
                      startups.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))
                    )}
                  </select>
                  <button 
                    onClick={() => setShowAddStartup(true)}
                    className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 rounded-lg cursor-pointer"
                    title="Add new startup"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connectivity Status Indicator */}
            {sandboxMode ? (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Database size={12} />
                Sandbox Mode
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Database size={12} />
                Supabase Live
              </span>
            )}

            {/* Dark/Light mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 gradient-bg">
          <Outlet context={{ activeStartup, loadStartups }} />
        </main>
      </div>

      {/* Global Config Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
