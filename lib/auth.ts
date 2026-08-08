'use client';

import { create } from 'zustand';
import { supabase, type Profile } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    let profile: Profile | null = null;
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data as Profile | null;
    }
    set({ user, profile, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const u = session?.user ?? null;
        let p: Profile | null = null;
        if (u) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();
          p = data as Profile | null;
        }
        set({ user: u, profile: p, loading: false });
      })();
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined },
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  signUp: async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return { error: error.message };
    const user = data.user;
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        phone,
        role: 'customer',
      });
    }
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    set({ profile: data as Profile | null });
  },
}));
