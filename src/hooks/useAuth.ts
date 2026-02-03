import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
}

// Safety timeout to prevent infinite loading (5 seconds)
const AUTH_TIMEOUT_MS = 5000;

// Fast synchronous user creation (doesn't block UI)
const getBaseUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
});

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Background profile enrichment (non-blocking)
  const enrichUserWithProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profile?.name) {
        setUser(prev => prev ? { ...prev, name: profile.name } : null);
      }
    } catch (error) {
      // Profile enrichment is best-effort, don't break anything
      console.warn('Could not enrich user profile:', error);
    }
  }, []);

  // Process user and unlock loading state
  const handleUser = useCallback((supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      const baseUser = getBaseUser(supabaseUser);
      setUser(baseUser);
      // Enrich in background (non-blocking)
      enrichUserWithProfile(supabaseUser.id);
    } else {
      setUser(null);
    }
  }, [enrichUserWithProfile]);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (isInitialized.current) return;
    isInitialized.current = true;

    let isMounted = true;

    // Safety timeout - force unlock loading after timeout
    timeoutRef.current = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Auth initialization timed out, forcing loading to false');
        setIsLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    // 1. Set up auth state listener FIRST (recommended pattern)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      try {
        handleUser(session?.user || null);
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setUser(null);
      } finally {
        // Always unlock loading on any auth event
        setIsLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });

    // 2. Check for existing session AFTER setting up listener
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (isMounted) {
          handleUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleUser, isLoading]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error inesperado al iniciar sesión' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error inesperado al registrarse' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };
};
