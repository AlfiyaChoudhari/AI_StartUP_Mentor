import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(!isSupabaseConfigured);

  // Initialize Auth
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Get active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          fetchAndSetProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          fetchAndSetProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Sandbox mode initialization
      const localUser = localStorage.getItem('sandbox_user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      }
      setSandboxMode(true);
      setLoading(false);
    }
  }, []);

  // Fetch profiles table data on login
  const fetchAndSetProfile = async (supabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) throw error;
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: data?.name || 'Founder',
        ...data
      });
    } catch (err) {
      console.warn("Could not load user profile, using auth email:", err);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || 'Founder'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign Up
  const signUp = async (email, password, name) => {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox Register
      const newUser = { id: 'local-sandbox-user', email, name };
      localStorage.setItem('sandbox_user', JSON.stringify(newUser));
      setUser(newUser);
      return { data: { user: newUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    return { data, error };
  };

  // Sign In
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox Login
      const newUser = { id: 'local-sandbox-user', email, name: 'Sandbox Founder' };
      localStorage.setItem('sandbox_user', JSON.stringify(newUser));
      setUser(newUser);
      return { data: { user: newUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  // Sign Out
  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox Logout
      localStorage.removeItem('sandbox_user');
      setUser(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
    return { error };
  };

  // Update Profile Name
  const updateProfile = async (name) => {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox Profile Update
      const updatedUser = { ...user, name };
      localStorage.setItem('sandbox_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { error: null };
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name, email: user.email });
    
    if (!error) {
      setUser(prev => ({ ...prev, name }));
    }
    return { error };
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null }; // Sandbox Mode always succeeds
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  };

  // Function to refresh configuration when keys change in SettingsModal
  const reloadConfig = () => {
    const isNowConfigured = !!(
      localStorage.getItem('VITE_SUPABASE_URL') &&
      localStorage.getItem('VITE_SUPABASE_ANON_KEY')
    ) || isSupabaseConfigured;

    setSandboxMode(!isNowConfigured);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sandboxMode,
      isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      updateProfile,
      forgotPassword,
      reloadConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
