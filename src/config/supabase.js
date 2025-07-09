import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://lywwxzfnhzbdkxnblvcf.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ';

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
        user_metadata: { 
          name: 'Usuário Demo',
          phone: '',
          company: '',
          position: '',
          city: '',
          state: ''
        }
      };
      
      // Persistir no localStorage para manter os dados entre recargas
      localStorage.setItem('demo-user', JSON.stringify(mockUser));
      
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
        user_metadata: { 
          name: metadata.name || 'Usuário Demo',
          phone: metadata.phone || '',
          company: metadata.company || '',
          position: metadata.position || '',
          city: metadata.city || '',
          state: metadata.state || ''
        }
      };
      
      // Persistir no localStorage para manter os dados entre recargas
      localStorage.setItem('demo-user', JSON.stringify(mockUser));
      
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
      // Limpar dados do localStorage no modo demo
      localStorage.removeItem('demo-user');
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  getUser: () => {
    if (!supabase) {
      // Verificar se há um usuário demo no localStorage
      const storedUser = localStorage.getItem('demo-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          return Promise.resolve({ 
            data: { user }, 
            error: null 
          });
        } catch (e) {
          console.error('Erro ao parsear usuário demo:', e);
        }
      }
      
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
  },

  // Atualizar perfil do usuário
  updateProfile: async (profileData) => {
    if (!supabase) {
      // Modo demo - atualizar dados no localStorage
      const storedUser = localStorage.getItem('demo-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const updatedUser = {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              ...profileData
            }
          };
          localStorage.setItem('demo-user', JSON.stringify(updatedUser));
          console.log('Modo demo: Perfil atualizado:', profileData);
          return { data: { user: updatedUser }, error: null };
        } catch (e) {
          console.error('Erro ao atualizar perfil demo:', e);
        }
      }
      return { data: { user: profileData }, error: null };
    }

    const { data, error } = await supabase.auth.updateUser({
      data: profileData
    });
    return { data, error };
  },

  // Alterar senha
  updatePassword: async (newPassword) => {
    if (!supabase) {
      console.log('Modo demo: Senha alterada');
      return { error: null };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  },

  // Atualizar email
  updateEmail: async (newEmail) => {
    if (!supabase) {
      console.log('Modo demo: Email alterado para:', newEmail);
      return { error: null };
    }

    const { data, error } = await supabase.auth.updateUser({
      email: newEmail
    });
    return { data, error };
  },

  // Reenviar email de confirmação
  resendConfirmation: async (email) => {
    if (!supabase) {
      console.log('Modo demo: Email de confirmação reenviado para:', email);
      return { error: null };
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    return { data, error };
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
              status: 'active', 
              created_at: new Date().toISOString(),
              budget_request: {
                client_name: 'João Silva',
                property_name: 'Fazenda São João',
                city: 'São Paulo',
                state: 'SP',
                vertices_count: 4,
                property_area: 10.5,
                client_type: 'pessoa_fisica'
              },
              budget_result: {
                total_price: 2500.00,
                success: true
              }
            }
          ], 
          error: null 
        };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Retornar lista vazia em vez de erro para permitir uso da aplicação
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
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

  // Clientes
  clients: {
    create: async (clientData) => {
      if (!supabase) {
        console.log('Modo demo: Cliente criado:', clientData);
        return { data: [{ id: 'demo-client', ...clientData }], error: null };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          user_id: user?.id
        }])
        .select();
      return { data, error };
    },

    list: async () => {
      if (!supabase) {
        return { data: [], error: null };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Retornar lista vazia em vez de erro para permitir uso da aplicação
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    getById: async (id) => {
      if (!supabase) {
        return { data: null, error: null };
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    update: async (id, clientData) => {
      if (!supabase) {
        console.log('Modo demo: Cliente atualizado:', id, clientData);
        return { data: [{ id, ...clientData }], error: null };
      }
      
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
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