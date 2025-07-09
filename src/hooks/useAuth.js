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
    // Obter usuário atual
    const getSession = async () => {
      try {
        const { data: { user } } = await auth.getUser();
        setUser(user);
        setSession(user ? { user } : null);
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
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
      
      // Atualizar o estado do usuário se o login foi bem-sucedido
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
      }
      
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
      
      // Atualizar o estado do usuário se o cadastro foi bem-sucedido
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
      }
      
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
      const { data, error } = await auth.updateProfile(profileData);
      
      if (error) throw error;
      
      // Refresh user data
      const { data: { user: updatedUser } } = await auth.getUser();
      setUser(updatedUser);
      setSession(updatedUser ? { user: updatedUser } : null);
      
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