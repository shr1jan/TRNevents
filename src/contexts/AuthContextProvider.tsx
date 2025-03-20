import { createContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  session: null,
  signOut: async () => {},
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = () => {
    // This is a placeholder function that will be called after successful login
    // The actual login is handled by Supabase in the AuthScreen component
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
