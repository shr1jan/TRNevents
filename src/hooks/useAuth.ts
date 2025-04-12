import { useContext, useMemo } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContextProvider';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Memoize the context to avoid unnecessary re-renders
  return useMemo(() => context, [context]);
}