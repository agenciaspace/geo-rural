import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Cria cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Funções auxiliares para autenticação
export const auth = {
  // Login com email e senha
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Cadastro de novo usuário
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  getUser: () => {
    return supabase.auth.getUser();
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Funções auxiliares para o banco de dados
export const db = {
  // Leads - captura de leads da landing page
  leads: {
    create: async (leadData) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();
      return { data, error };
    },
    
    list: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    }
  },

  // Orçamentos
  budgets: {
    create: async (budgetData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budgetData,
          user_id: user?.id
        }])
        .select();
      return { data, error };
    },

    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    }
  },

  // Análises GNSS
  gnssAnalyses: {
    create: async (analysisData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('gnss_analyses')
        .insert([{
          ...analysisData,
          user_id: user?.id
        }])
        .select();
      return { data, error };
    },

    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('gnss_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return { data, error };
    }
  }
};

// Funções auxiliares para storage
export const storage = {
  // Upload de arquivo GNSS
  uploadGnssFile: async (file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('gnss-files')
      .upload(fileName, file);
    
    if (error) return { data: null, error };
    
    // Gera URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('gnss-files')
      .getPublicUrl(fileName);
    
    return { data: { ...data, publicUrl }, error: null };
  },

  // Download de arquivo
  downloadFile: async (path) => {
    const { data, error } = await supabase.storage
      .from('gnss-files')
      .download(path);
    return { data, error };
  },

  // Listar arquivos do usuário
  listUserFiles: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: null };

    const { data, error } = await supabase.storage
      .from('gnss-files')
      .list(user.id, {
        limit: 100,
        offset: 0
      });
    return { data, error };
  }
};

export default supabase;