import { useAuth } from '@/components/AuthProvider';

export const useSupabaseAuth = () => {
  const { user, session, loading, isAuthenticated, signOut } = useAuth();
  
  return {
    isSignedIn: isAuthenticated,
    isLoaded: !loading,
    user,
    session,
    isAuthenticated,
    loading,
    signOut
  };
};
