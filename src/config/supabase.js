import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Cria cliente do Supabase apenas se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
    })
  : null;

// Verificar se Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Funções auxiliares para autenticação
export const auth = {
  // Login com email e senha
  signIn: async (email, password) => {
    if (!supabase) {
      // Modo demo/desenvolvimento - simular login
      const mockUser = {
        id: 'demo-user',
        email: email,
        user_metadata: { name: 'Usuário Demo' }
      };
      return { 
        data: { user: mockUser, session: { user: mockUser } }, 
        error: null 
      };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Cadastro de novo usuário
  signUp: async (email, password, metadata = {}) => {
    if (!supabase) {
      // Modo demo/desenvolvimento - simular cadastro
      const mockUser = {
        id: 'demo-user',
        email: email,
        user_metadata: { name: metadata.name || 'Usuário Demo' }
      };
      return { 
        data: { user: mockUser, session: { user: mockUser } }, 
        error: null 
      };
    }
    
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
    if (!supabase) {
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  getUser: () => {
    if (!supabase) {
      return Promise.resolve({ 
        data: { user: null }, 
        error: null 
      });
    }
    
    return supabase.auth.getUser();
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback) => {
    if (!supabase) {
      // Retornar um subscription mock
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
    
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Funções auxiliares para o banco de dados
export const db = {
  // Leads - captura de leads da landing page
  leads: {
    create: async (leadData) => {
      if (!supabase) {
        console.log('Modo demo: Lead capturado:', leadData);
        return { data: [{ id: 'demo-lead', ...leadData }], error: null };
      }
      
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();
      return { data, error };
    },
    
    list: async () => {
      if (!supabase) {
        return { data: [], error: null };
      }
      
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
      if (!supabase) {
        console.log('Modo demo: Orçamento criado:', budgetData);
        return { data: [{ id: 'demo-budget', ...budgetData }], error: null };
      }
      
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
      if (!supabase) {
        // Retornar dados de exemplo para demonstração
        return { 
          data: [
            {
              id: 'demo-1',
              client_name: 'João Silva',
              property_name: 'Fazenda São João',
              total: 2500.00,
              status: 'sent', 
              created_at: new Date().toISOString()
            },
            {
              id: 'demo-2',
              client_name: 'Maria Santos',
              property_name: 'Sítio Esperança',
              total: 1800.00,
              status: 'approved',
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ], 
          error: null 
        };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    getById: async (id) => {
      if (!supabase) {
        return { data: null, error: null };
      }
      
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
      if (!supabase) {
        console.log('Modo demo: Análise GNSS criada:', analysisData);
        return { data: [{ id: 'demo-analysis', ...analysisData }], error: null };
      }
      
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
      if (!supabase) {
        // Retornar dados de exemplo para demonstração
        return { 
          data: [
            {
              id: 'demo-gnss-1',
              filename: 'DEMO_001.obs',
              analysis_result: { quality: 'boa', coordinates: { lat: -23.5505, lng: -46.6333 } },
              quality_color: 'green',
              created_at: new Date().toISOString()
            }
          ], 
          error: null 
        };
      }
      
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
    if (!supabase) {
      console.log('Modo demo: Arquivo GNSS simulado:', file.name);
      return { 
        data: { 
          path: `demo/${file.name}`, 
          publicUrl: '#' 
        }, 
        error: null 
      };
    }
    
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
    if (!supabase) {
      return { data: null, error: { message: 'Funcionalidade não disponível no modo demo' } };
    }
    
    const { data, error } = await supabase.storage
      .from('gnss-files')
      .download(path);
    return { data, error };
  },

  // Listar arquivos do usuário
  listUserFiles: async () => {
    if (!supabase) {
      return { data: [], error: null };
    }
    
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