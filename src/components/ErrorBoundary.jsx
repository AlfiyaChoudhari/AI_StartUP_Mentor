import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-2xl p-8 shadow-xl text-center border border-rose-500/20 dark:border-rose-500/30">
            <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-950/50 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
              <AlertOctagon size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              An unexpected error occurred. Don't worry, your startup data is safe.
            </p>
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-lg p-4 text-left font-mono text-xs overflow-auto max-h-40 text-slate-600 dark:text-slate-400 mb-6">
              {this.state.error?.message || "Unknown error"}
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
