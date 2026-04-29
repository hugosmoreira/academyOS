import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Ensures a profiles row exists for the authenticated user.
 * Acts as a client-side fallback in case the server-side trigger
 * (on_auth_user_created) has not been installed yet.
 */
async function ensureProfile(user: User) {
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existing) {
      // Try with all columns first; fall back to minimal insert if columns are missing
      const { error } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email ?? '',
          full_name: user.user_metadata?.full_name ?? '',
        },
        { onConflict: 'id' },
      );

      if (error && error.message.includes('does not exist')) {
        // Column missing — try a minimal insert with required profile fields.
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email ?? '',
            full_name: user.user_metadata?.full_name ?? '',
          },
          { onConflict: 'id' },
        );
      } else if (error) {
        throw error;
      }

      console.info('[AcademyOS] ✅ Profile row created for', user.email);
    }
  } catch (err) {
    // Non-fatal: profile creation may fail due to RLS before the setup SQL is run.
    console.warn('[AcademyOS] ⚠️ Could not ensure profile row:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // When the user signs in, make sure they have a profiles row
  useEffect(() => {
    if (session?.user) {
      void ensureProfile(session.user);
    }
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async signIn(email, password) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(email, password, fullName) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
      },
      async sendPasswordReset(email) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
