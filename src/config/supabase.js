import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Debug logs temporários - REMOVER APÓS CONFIRMAR QUE FUNCIONA
console.log('🔥 SUPABASE CONFIG CHECK:');
console.log('🔥 URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('🔥 KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado');
console.log('🔥 Cliente Supabase será:', supabaseUrl && supabaseAnonKey ? 'CRIADO' : 'NULL (modo demo)');

// Cria cliente do Supabase apenas se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    },
    db: {
      schema: 'public'
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

    // Traduzir erros comuns
    if (error) {
      let translatedError = { ...error };
      if (error.message?.includes('Invalid login credentials')) {
        translatedError.message = 'Credenciais inválidas. Verifique seu email e senha.';
      } else if (error.message?.includes('Email not confirmed')) {
        translatedError.message = 'Email não confirmado. Verifique sua caixa de entrada.';
      }
      return { data, error: translatedError };
    }

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
        data: metadata,
        emailRedirectTo: window.location.origin + '/app'
      }
    });

    // Log para debug
    console.log('🔥 Supabase signUp response:', { data, error });
    
    // Retornar resultado bruto do Supabase
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
  updateProfile: async (profileData, userFromContext = null) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    console.log('=== INÍCIO DEBUG updateProfile ===');
    
    // Primeiro verificar se temos sessão válida no Supabase
    let user = null;
    let hasValidSession = false;
    
    try {
      const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();
      console.log('Usuário da sessão Supabase:', sessionUser);
      console.log('Erro do usuário:', userError);
      
      if (sessionUser && !userError) {
        user = sessionUser;
        hasValidSession = true;
        console.log('✅ Sessão válida encontrada no Supabase');
      }
    } catch (error) {
      console.log('Erro ao obter usuário da sessão:', error);
    }
    
    // Se não há sessão válida, usar o usuário do contexto
    if (!hasValidSession && userFromContext) {
      console.log('🔄 Usando usuário do contexto React:', userFromContext);
      user = userFromContext;
    }
    
    console.log('Estado da autenticação:', {
      hasValidSession,
      userId: user?.id,
      userEmail: user?.email
    });
    
    if (!user || !user.id) {
      console.error('❌ Nenhum usuário encontrado');
      console.error('User from session:', user);
      console.error('User from context:', userFromContext);
      return { 
        data: null, 
        error: { message: 'Usuário não autenticado - Faça login novamente' } 
      };
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      aud: user.aud,
      role: user.role
    });

    // Permitir que usuários não confirmados completem o onboarding
    // Verificar se há um usuário válido independente da confirmação de email
    // O usuário deve ter um ID válido, mesmo se o email não estiver confirmado

    // Atualizar tabela user_profiles diretamente
    console.log('Tentando atualizar perfil para usuário:', user.id);
    console.log('Dados do perfil:', profileData);
    
    try {
      const profileUpdate = {
        id: user.id,
        full_name: profileData.name,
        phone: profileData.phone,
        company_name: profileData.company,
        position: profileData.position,
        city: profileData.city,
        state: profileData.state,
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Dados para upsert na tabela user_profiles:', profileUpdate);
      
      let data, error;
      
      if (hasValidSession) {
        // Se temos sessão válida, usar upsert normal
        console.log('📝 Usando upsert com sessão válida');
        const result = await supabase
          .from('user_profiles')
          .upsert(profileUpdate)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Se não temos sessão válida, usar função RPC que bypassa RLS
        console.log('📝 Usando função RPC para bypass RLS');
        const result = await supabase.rpc('upsert_user_profile', {
          _id: user.id,
          _full_name: profileData.name,
          _phone: profileData.phone,
          _company_name: profileData.company,
          _position: profileData.position,
          _city: profileData.city,
          _state: profileData.state
        });
        data = result.data;
        error = result.error;
      }
      
      console.log('✅ Resultado final:', { data, error });

      if (error) {
        console.error('❌ Erro Supabase ao atualizar perfil:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Diagnóstico específico por tipo de erro
        if (error.code === '42501') {
          console.error('🚫 Erro de permissão - verificar políticas RLS');
        } else if (error.code === '23505') {
          console.error('🔄 Erro de dados duplicados');
        } else if (error.code === '42P01') {
          console.error('🗃️ Tabela user_profiles não encontrada');
        } else if (error.code === '42703') {
          console.error('📋 Coluna não encontrada na tabela');
        }
        
        // Mensagem de erro mais amigável baseada no código do erro
        let friendlyMessage = 'Erro ao salvar informações';
        if (error.code === '42501') {
          friendlyMessage = 'Permissão insuficiente para salvar dados';
        } else if (error.code === '23505') {
          friendlyMessage = 'Dados duplicados encontrados';
        } else if (error.message) {
          friendlyMessage = error.message;
        }
        
        return { data: null, error: { message: friendlyMessage } };
      }

      console.log('✅ Perfil atualizado com sucesso:', data);
      console.log('=== FIM DEBUG updateProfile ===');
      return { data, error: null };
    } catch (err) {
      console.error('Erro inesperado ao atualizar perfil:', err);
      return { 
        data: null, 
        error: { message: 'Erro inesperado ao salvar informações: ' + err.message } 
      };
    }
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
    },

    // Atualizar orçamento
    update: async (id, budgetData) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Supabase não configurado' } 
        };
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .update({
          budget_request: budgetData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      return { data, error };
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