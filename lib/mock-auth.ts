'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  location: string;
  stripeAccountId?: string;
}

function toAuthUser(user: User, profile?: Record<string, unknown> | null): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    fullName:
      (profile?.full_name as string) ??
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??           // Google OAuth
      '',
    username:
      (profile?.username as string) ??
      (user.email?.split('@')[0] ?? ''),
    avatar:
      (profile?.avatar_url as string) ??
      (user.user_metadata?.avatar_url as string) ??     // Google OAuth avatar
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    location: (profile?.location as string) ?? 'Λευκωσία',
    stripeAccountId: (profile?.stripe_account_id as string) ?? undefined,
  };
}

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user: sbUser } }) => {
      if (sbUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .single();
        setUser(toAuthUser(sbUser, profile));
      }
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(toAuthUser(session.user, profile));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Sign in with email + password */
  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: translateError(error.message) };
      return {};
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /** Register with email + password */
  const register = useCallback(
    async (fullName: string, email: string, password: string): Promise<{ error?: string }> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { error: translateError(error.message) };
      return {};
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /** Sign in with Google OAuth */
  const loginWithGoogle = useCallback(async (): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) return { error: translateError(error.message) };
    return {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Get the current session access token (for Realtime/API calls) */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading, login, register, loginWithGoogle, getAccessToken, logout };
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Λάθος email ή κωδικός.';
  if (msg.includes('Email not confirmed')) return 'Επιβεβαίωσε το email σου πρώτα.';
  if (msg.includes('User already registered')) return 'Υπάρχει ήδη λογαριασμός με αυτό το email.';
  if (msg.includes('Password should be at least')) return 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.';
  if (msg.includes('rate limit')) return 'Πολλές προσπάθειες. Δοκίμασε ξανά σε λίγο.';
  if (msg.includes('provider is not enabled')) return 'Η σύνδεση με Google δεν είναι ενεργοποιημένη ακόμα.';
  return msg;
}
