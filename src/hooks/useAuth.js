import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '../config/supabase';

// Contexto de autenticação
const AuthContext = createContext({});

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      const { data: { user } } = await auth.getUser();
      // Só setar usuário se email estiver confirmado
      if (user && user.email_confirmed_at) {
        setUser(user);
        setSession({ user });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔥 useAuth: onAuthStateChange event:', event);
        console.log('🔥 useAuth: session:', session);
        console.log('🔥 useAuth: session?.user?.email_confirmed_at:', session?.user?.email_confirmed_at);
        
        // Só setar usuário se email estiver confirmado ou se for logout
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
        } else if (session?.user?.email_confirmed_at) {
          // Email confirmado - usuário pode ser autenticado
          setSession(session);
          setUser(session.user);
        } else {
          // Email não confirmado - não autenticar
          console.log('🔥 useAuth: Email não confirmado, não autenticando');
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função de login
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signIn(email, password);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signUp(email, password, metadata);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização do perfil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      // Passar o usuário do contexto como fallback
      const { data, error } = await auth.updateProfile(profileData, user);
      
      if (error) throw error;
      
      // Refresh user data
      try {
        const { data: { user: updatedUser } } = await auth.getUser();
        setUser(updatedUser);
        setSession(updatedUser ? { user: updatedUser } : null);
      } catch (refreshError) {
        console.log('Erro ao atualizar dados do usuário, mantendo usuário atual');
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização da senha
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      const { data, error } = await auth.updatePassword(newPassword);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização do email
  const updateEmail = async (newEmail) => {
    try {
      setLoading(true);
      const { data, error } = await auth.updateEmail(newEmail);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };


  // Função para reenviar email de confirmação
  const resendConfirmation = async (email) => {
    try {
      setLoading(true);
      const { data, error } = await auth.resendConfirmation(email);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    updateEmail,
    resendConfirmation,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};