'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthCookie = (session: Session | null) => {
    const projectRef = 'dputisltxposlukceoxo';
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? '; Secure' : '';
      if (session) {
        const cookieValue = encodeURIComponent(JSON.stringify([session.access_token, session.refresh_token]));
        document.cookie = `sb-${projectRef}-auth-token=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
      } else {
        document.cookie = `sb-${projectRef}-auth-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      }
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthCookie(session);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthCookie(session);
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setAuthCookie(null);
    setLoading(false);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
