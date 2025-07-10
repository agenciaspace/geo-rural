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
      detectSessionInUrl: true,
      // Configurações para permitir login sem confirmação de email
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
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
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Traduzir erros comuns para português
    if (error) {
      let translatedError = { ...error };
      if (error.message?.includes('Email not confirmed')) {
        translatedError.message = 'Email não confirmado. Você pode usar a aplicação, mas é recomendado confirmar seu email.';
      } else if (error.message?.includes('Invalid login credentials')) {
        translatedError.message = 'Credenciais inválidas. Verifique seu email e senha.';
      } else if (error.message?.includes('User not found')) {
        translatedError.message = 'Usuário não encontrado. Verifique seu email.';
      } else if (error.message?.includes('Too many requests')) {
        translatedError.message = 'Muitas tentativas. Tente novamente em alguns minutos.';
      }
      return { data, error: translatedError };
    }
    
    return { data, error };
  },

  // Cadastro de novo usuário
  signUp: async (email, password, metadata = {}) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
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
      return { error: { message: 'Supabase não configurado' } };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  getUser: () => {
    if (!supabase) {
      return Promise.resolve({ 
        data: { user: null }, 
        error: { message: 'Supabase não configurado' } 
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
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Usuário não autenticado' } 
      };
    }

    // Atualizar tabela user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        full_name: profileData.name,
        phone: profileData.phone,
        company_name: profileData.company,
        position: profileData.position,
        city: profileData.city,
        state: profileData.state,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  },

  // Buscar perfil do usuário
  getUserProfile: async () => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Usuário não autenticado' } 
      };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  },

  // Alterar senha
  updatePassword: async (newPassword) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  },

  // Atualizar email
  updateEmail: async (newEmail) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      email: newEmail
    });
    return { data, error };
  },

  // Reenviar email de confirmação
  resendConfirmation: async (email) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    // Traduzir erros comuns para português
    if (error) {
      let translatedError = { ...error };
      if (error.message?.includes('Email not confirmed')) {
        translatedError.message = 'Email não confirmado';
      } else if (error.message?.includes('Invalid email')) {
        translatedError.message = 'Email inválido';
      } else if (error.message?.includes('Too many requests')) {
        translatedError.message = 'Muitas tentativas. Tente novamente em alguns minutos.';
      }
      return { data, error: translatedError };
    }
    
    return { data, error };
  }
};

// Funções auxiliares para o banco de dados
export const db = {
  // Leads - captura de leads da landing page
  leads: {
    create: async (leadData) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();
      return { data, error };
    },
    
    list: async () => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { 
          data: null, 
          error: { message: 'Usuário não autenticado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    // Buscar orçamento por link personalizado (rota pública)
    getByCustomLink: async (customLink) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      try {
        // Usar função SQL pública que bypassa completamente RLS
        const publicSupabase = createClient(
          process.env.REACT_APP_SUPABASE_URL || 'https://lywwxzfnhzbdkxnblvcf.supabase.co',
          process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ'
        );
        
        const { data, error } = await publicSupabase.rpc('get_budget_by_custom_link', {
          link_param: customLink
        });
        
        console.log('getByCustomLink RPC result:', { data, error, customLink });
        
        if (error) {
          console.error('getByCustomLink RPC error:', error);
          return { data: null, error };
        }
        
        if (data && data.length > 0) {
          return { data: data[0], error: null };
        } else {
          return { data: null, error: { code: 'PGRST116', message: 'Orçamento não encontrado' } };
        }
      } catch (err) {
        console.error('getByCustomLink error:', err);
        
        // Fallback para API REST direta
        try {
          const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://lywwxzfnhzbdkxnblvcf.supabase.co';
          const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ';
          
          const response = await fetch(`${supabaseUrl}/rest/v1/budgets?custom_link=eq.${customLink}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('getByCustomLink API fallback result:', { data, customLink });
          
          if (data && data.length > 0) {
            return { data: data[0], error: null };
          } else {
            return { data: null, error: { code: 'PGRST116', message: 'Orçamento não encontrado' } };
          }
        } catch (fallbackErr) {
          console.error('getByCustomLink fallback error:', fallbackErr);
          return { data: null, error: fallbackErr };
        }
      }
    },

    // Aprovar orçamento via link
    approveByCustomLink: async (customLink) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      try {
        // Usar função SQL pública que bypassa RLS
        const publicSupabase = createClient(
          process.env.REACT_APP_SUPABASE_URL || 'https://lywwxzfnhzbdkxnblvcf.supabase.co',
          process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ'
        );
        
        const { data, error } = await publicSupabase.rpc('approve_budget_by_custom_link', {
          link_param: customLink
        });
        
        console.log('approveByCustomLink RPC result:', { data, error, customLink });
        return { data, error };
      } catch (err) {
        console.error('approveByCustomLink error:', err);
        return { data: null, error: err };
      }
    },

    // Rejeitar orçamento via link
    rejectByCustomLink: async (customLink, comment) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      try {
        // Usar função SQL pública que bypassa RLS
        const publicSupabase = createClient(
          process.env.REACT_APP_SUPABASE_URL || 'https://lywwxzfnhzbdkxnblvcf.supabase.co',
          process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ'
        );
        
        const { data, error } = await publicSupabase.rpc('reject_budget_by_custom_link', {
          link_param: customLink,
          comment_param: comment
        });
        
        console.log('rejectByCustomLink RPC result:', { data, error, customLink });
        return { data, error };
      } catch (err) {
        console.error('rejectByCustomLink error:', err);
        return { data: null, error: err };
      }
    }
  },

  // Clientes
  clients: {
    create: async (clientData) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          data: null, 
          error: { message: 'Usuário não autenticado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
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
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          data: null, 
          error: { message: 'Usuário não autenticado' } 
        };
      }
      
      const { data, error } = await supabase
        .from('gnss_analyses')
        .select('*')
        .eq('user_id', user.id)
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
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Usuário não autenticado' } 
      };
    }

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
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }
    
    const { data, error } = await supabase.storage
      .from('gnss-files')
      .download(path);
    return { data, error };
  },

  // Listar arquivos do usuário
  listUserFiles: async () => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Usuário não autenticado' } 
      };
    }

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