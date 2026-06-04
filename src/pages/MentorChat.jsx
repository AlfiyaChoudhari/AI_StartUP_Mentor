import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { chatWithMentor } from '../services/aiService';
import { saveChatMessage, fetchChatHistory } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

export default function MentorChat() {
  const { user } = useAuth();
  const { activeStartup } = useOutletContext();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Suggested Prompts
  const promptPills = [
    { label: "Acquire first 10 clients", val: "How do I acquire my first 10 customers without spending money on marketing?" },
    { label: "SaaS Pricing tips", val: "How should I structure the pricing model for my SaaS product?" },
    { label: "Pitch deck structure", val: "What structure or narrative should I use to pitch pre-seed investors?" },
    { label: "Building an MVP", val: "What is a lean framework to define and build my MVP roadmap?" }
  ];

  // Fetch past chat history
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const history = await fetchChatHistory(user?.id);
      const formatted = [];
      history.forEach(chat => {
        formatted.push({ sender: 'user', text: chat.message, timestamp: chat.timestamp });
        formatted.push({ sender: 'mentor', text: chat.response, timestamp: chat.timestamp });
      });

      if (formatted.length === 0) {
        // Initial greetings
        formatted.push({
          sender: 'mentor',
          text: `### Welcome back, Founder! 🚀\nI am your AI Startup Mentor. I can help evaluate your monetization models, go-to-market channels, funding applications, or technical roadmap.\n\nSelect a suggestion below or type your question to begin.`,
          timestamp: new Date().toISOString()
        });
      }
      setMessages(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    setError('');
    if (!textToSend) setInput('');

    // Append user message
    const userMsg = { sender: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // 1. Fetch AI completion
      const response = await chatWithMentor(text, messages);

      // 2. Save DB record
      await saveChatMessage(user?.id, text, response);

      // 3. Append mentor response
      setMessages(prev => [...prev, { sender: 'mentor', text: response, timestamp: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
      setError('Connection interrupted. Please verify your configurations and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Custom Markdown bubble formatter
  const formatMarkdown = (text) => {
    if (!text) return "";
    return text.split('\n').map((line, i) => {
      let content = line;
      if (content.startsWith('### ')) {
        return <h4 key={i} className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1 uppercase tracking-wider">{content.replace('### ', '')}</h4>;
      }
      if (content.startsWith('## ')) {
        return <h3 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">{content.replace('## ', '')}</h3>;
      }
      if (content.startsWith('# ')) {
        return <h2 key={i} className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">{content.replace('# ', '')}</h2>;
      }
      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        const clean = content.replace(/^[\*\-]\s+/, '');
        return <li key={i} className="ml-4 list-disc text-xs leading-relaxed my-0.5">{clean}</li>;
      }
      if (content.trim().match(/^\d+\.\s+/)) {
        const clean = content.replace(/^\d+\.\s+/, '');
        return <li key={i} className="ml-4 list-decimal text-xs leading-relaxed my-0.5">{clean}</li>;
      }
      // Bold formatter
      if (content.includes('**')) {
        const parts = content.split('**');
        return (
          <p key={i} className="text-xs leading-relaxed my-1">
            {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="font-bold text-indigo-600 dark:text-indigo-400">{p}</strong> : p)}
          </p>
        );
      }
      return content.trim() ? <p key={i} className="text-xs leading-relaxed my-1">{content}</p> : <div key={i} className="h-1.5" />;
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] space-y-4">
      
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <MessageSquare size={24} />
          </div>
          Startup Mentor Chat
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Receive advisory answers on strategy, pricing, product cycles, or pitch structure.
        </p>
      </div>

      {/* Chat Display Pane */}
      <div className="flex-1 glass-panel rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex flex-col overflow-hidden shadow-sm">
        
        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}>
                <div className={`
                  max-w-md p-4 rounded-2xl relative shadow-sm text-slate-700 dark:text-slate-200 border
                  ${isUser 
                    ? 'bg-indigo-600 border-indigo-700 text-white rounded-br-none' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200/50 dark:border-slate-800/50 rounded-bl-none'}
                `}>
                  {/* Sender title */}
                  <span className={`block text-[8px] font-bold uppercase tracking-wider mb-1.5 opacity-60 ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {isUser ? 'You' : 'AI Startup Mentor'}
                  </span>
                  
                  {/* Bubble text */}
                  {isUser ? <p className="text-xs leading-relaxed">{msg.text}</p> : formatMarkdown(msg.text)}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-md p-4 rounded-2xl rounded-bl-none bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mr-2">Mentor</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Pills Panel */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
          <div className="flex flex-wrap gap-2">
            {promptPills.map((pill, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendMessage(pill.val)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 rounded-lg transition cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              required
              disabled={loading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about user growth, funding, or product..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
