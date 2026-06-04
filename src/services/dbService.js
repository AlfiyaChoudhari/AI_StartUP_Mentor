// Database Service with Supabase/LocalStorage Sandbox Fallback
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// Helper: LocalStorage mock tables
const getLocalData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Dynamic activity log helper
function addActivityLog(action, details) {
  const logs = getLocalData('startup_activity_logs');
  logs.unshift({
    id: Math.random().toString(36).substr(2, 9),
    action,
    details,
    timestamp: new Date().toISOString()
  });
  setLocalData('startup_activity_logs', logs.slice(0, 50)); // Keep last 50
}

export function getActivityLogs() {
  return getLocalData('startup_activity_logs');
}

// 1. Startup Ideas
export async function saveStartupIdea(userId, title, description, validationScore, validationReport) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('startup_ideas')
        .insert([{ user_id: userId, title, description, validation_score: validationScore, validation_report: validationReport }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase saveStartupIdea failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const ideas = getLocalData('startup_ideas');
  const newIdea = {
    id: Math.random().toString(36).substr(2, 9),
    user_id: userId || 'local-sandbox-user',
    title,
    description,
    validation_score: validationScore,
    validation_report: validationReport,
    created_at: new Date().toISOString()
  };
  ideas.unshift(newIdea);
  setLocalData('startup_ideas', ideas);
  addActivityLog('Validated Startup Idea', `Evaluated "${title}" (Score: ${validationScore}%)`);
  return newIdea;
}

export async function fetchStartupIdeas(userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('startup_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase fetchStartupIdeas failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const ideas = getLocalData('startup_ideas');
  const uId = userId || 'local-sandbox-user';
  return ideas.filter(idea => idea.user_id === uId);
}

export async function deleteStartupIdea(ideaId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('startup_ideas')
        .delete()
        .eq('id', ideaId);
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase deleteStartupIdea failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  let ideas = getLocalData('startup_ideas');
  const targetIdea = ideas.find(idea => idea.id === ideaId);
  ideas = ideas.filter(idea => idea.id !== ideaId);
  setLocalData('startup_ideas', ideas);

  if (targetIdea) {
    addActivityLog('Deleted Idea', `Removed project "${targetIdea.title}"`);
  }
  return true;
}

// 2. Competitor Reports
export async function saveCompetitorReport(startupId, reportContent) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('competitor_reports')
        .insert([{ startup_id: startupId, report_content: reportContent }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase saveCompetitorReport failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const reports = getLocalData('competitor_reports');
  const newReport = {
    id: Math.random().toString(36).substr(2, 9),
    startup_id: startupId,
    report_content: reportContent,
    created_at: new Date().toISOString()
  };
  reports.unshift(newReport);
  setLocalData('competitor_reports', reports);
  
  const ideas = getLocalData('startup_ideas');
  const idea = ideas.find(i => i.id === startupId);
  addActivityLog('Competitor Audit', `Generated competitive analysis for "${idea?.title || 'Unknown startup'}"`);
  return newReport;
}

export async function fetchCompetitorReport(startupId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('competitor_reports')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase fetchCompetitorReport failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const reports = getLocalData('competitor_reports');
  return reports.find(rep => rep.startup_id === startupId) || null;
}

// 3. Business Plans
export async function saveBusinessPlan(startupId, planContent) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .insert([{ startup_id: startupId, plan_content: planContent }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase saveBusinessPlan failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const plans = getLocalData('business_plans');
  const newPlan = {
    id: Math.random().toString(36).substr(2, 9),
    startup_id: startupId,
    plan_content: planContent,
    created_at: new Date().toISOString()
  };
  plans.unshift(newPlan);
  setLocalData('business_plans', plans);

  const ideas = getLocalData('startup_ideas');
  const idea = ideas.find(i => i.id === startupId);
  addActivityLog('Business Plan', `Generated comprehensive business plan for "${idea?.title || 'Unknown startup'}"`);
  return newPlan;
}

export async function fetchBusinessPlan(startupId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase fetchBusinessPlan failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const plans = getLocalData('business_plans');
  return plans.find(plan => plan.startup_id === startupId) || null;
}

// 4. Pitch Decks
export async function savePitchDeck(startupId, deckContent) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .insert([{ startup_id: startupId, deck_content: deckContent }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase savePitchDeck failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const decks = getLocalData('pitch_decks');
  const newDeck = {
    id: Math.random().toString(36).substr(2, 9),
    startup_id: startupId,
    deck_content: deckContent,
    created_at: new Date().toISOString()
  };
  decks.unshift(newDeck);
  setLocalData('pitch_decks', decks);

  const ideas = getLocalData('startup_ideas');
  const idea = ideas.find(i => i.id === startupId);
  addActivityLog('Pitch Deck', `Generated Pitch Slide Deck outline for "${idea?.title || 'Unknown startup'}"`);
  return newDeck;
}

export async function fetchPitchDeck(startupId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase fetchPitchDeck failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const decks = getLocalData('pitch_decks');
  return decks.find(deck => deck.startup_id === startupId) || null;
}

// 5. Revenue Forecasts
export async function saveRevenueForecast(startupId, forecastData) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('revenue_forecasts')
        .insert([{ startup_id: startupId, forecast_data: forecastData }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase saveRevenueForecast failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const forecasts = getLocalData('revenue_forecasts');
  const newForecast = {
    id: Math.random().toString(36).substr(2, 9),
    startup_id: startupId,
    forecast_data: forecastData,
    created_at: new Date().toISOString()
  };
  forecasts.unshift(newForecast);
  setLocalData('revenue_forecasts', forecasts);

  const ideas = getLocalData('startup_ideas');
  const idea = ideas.find(i => i.id === startupId);
  addActivityLog('Revenue Forecast', `Updated financial projections for "${idea?.title || 'Unknown startup'}"`);
  return newForecast;
}

export async function fetchRevenueForecast(startupId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('revenue_forecasts')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase fetchRevenueForecast failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const forecasts = getLocalData('revenue_forecasts');
  return forecasts.find(f => f.startup_id === startupId) || null;
}

// 6. Chat History
export async function saveChatMessage(userId, message, response) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([{ user_id: userId, message, response }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase saveChatMessage failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const chats = getLocalData('chat_history');
  const newChat = {
    id: Math.random().toString(36).substr(2, 9),
    user_id: userId || 'local-sandbox-user',
    message,
    response,
    timestamp: new Date().toISOString()
  };
  chats.push(newChat);
  setLocalData('chat_history', chats);
  return newChat;
}

export async function fetchChatHistory(userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase fetchChatHistory failed, fallback to local:", e);
    }
  }

  // Local Storage Sandbox
  const chats = getLocalData('chat_history');
  const uId = userId || 'local-sandbox-user';
  return chats.filter(chat => chat.user_id === uId);
}
