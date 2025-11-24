import {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import type {User} from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
});

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * signout with supabase
   */
  async function signOut() {
    const {error} = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUser(null);
    }
  }

  // load user
  useEffect(() => {
    supabase.auth.getUser().then(({data}) => {
      setUser(data.user ?? null);
    });

    const {data: listener} =
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{user, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
