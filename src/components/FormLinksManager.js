import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const FormLinksManager = () => {
  const { user } = useAuth();
  const [userLink, setUserLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '',
    title: 'Solicitar Orçamento',
    description: 'Preencha o formulário abaixo para solicitar um orçamento personalizado.',
    custom_message: '',
    primary_color: '#1a5f3f',
    is_active: true
  });

  useEffect(() => {
    if (user?.id) {
      loadUserLink();
    }
  }, [user]);

  const loadUserLink = async () => {
    try {
      setIsLoading(true);
      
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase não está configurado. Verifique as variáveis de ambiente.');
        return;
      }
      
      if (!user?.id) {
        setError('Usuário não identificado');
        return;
      }
      
      const { data, error } = await supabase
        .from('budget_form_links')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      setUserLink(data);
    } catch (err) {
      setError('Erro ao carregar link: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Gerar slug se não foi fornecido
      let finalSlug = formData.slug || generateSlug(formData.title);
      
      // Verificar se o slug já existe (exceto para o próprio link)
      const { data: existingLinks } = await supabase
        .from('budget_form_links')
        .select('id, slug')
        .eq('slug', finalSlug);
      
      if (existingLinks && existingLinks.length > 0) {
        // Se estamos editando e o slug é do próprio link, ok
        if (userLink && existingLinks[0].id === userLink.id) {
          // Slug é do próprio link sendo editado, ok
        } else {
          // Slug já existe, adicionar número
          finalSlug = `${finalSlug}-${Date.now()}`;
        }
      }
      
      const dataToSave = {
        ...formData,
        slug: finalSlug,
        user_id: user?.id
      };

      if (userLink) {
        // Atualizar link existente
        const { error } = await supabase
          .from('budget_form_links')
          .update(dataToSave)
          .eq('id', userLink.id);
        
        if (error) throw error;
        setSuccess('Link atualizado com sucesso!');
      } else {
        // Criar novo link
        const { error } = await supabase
          .from('budget_form_links')
          .insert([dataToSave]);
        
        if (error) {
          // Se ainda houver erro de duplicação, adicionar timestamp
          if (error.message?.includes('duplicate key')) {
            dataToSave.slug = `${finalSlug}-${Date.now()}`;
            const { error: retryError } = await supabase
              .from('budget_form_links')
              .insert([dataToSave]);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
        setSuccess('Link criado com sucesso!');
      }

      setIsEditing(false);
      loadUserLink();
    } catch (err) {
      setError('Erro ao salvar link: ' + err.message);
    }
  };

  const handleEdit = () => {
    if (userLink) {
      setFormData({
        slug: userLink.slug,
        title: userLink.title,
        description: userLink.description,
        custom_message: userLink.custom_message || '',
        primary_color: userLink.primary_color || '#1a5f3f',
        is_active: userLink.is_active
      });
      setIsEditing(true);
    }
  };

  const handleToggleActive = async () => {
    if (!userLink) return;
    
    try {
      const { error } = await supabase
        .from('budget_form_links')
        .update({ is_active: !userLink.is_active })
        .eq('id', userLink.id);
      
      if (error) throw error;
      loadUserLink();
      setSuccess(userLink.is_active ? 'Link desativado' : 'Link ativado');
    } catch (err) {
      setError('Erro ao atualizar status: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: 'Solicitar Orçamento',
      description: 'Preencha o formulário abaixo para solicitar um orçamento personalizado.',
      custom_message: '',
      primary_color: '#1a5f3f',
      is_active: true
    });
    setIsEditing(false);
  };

  const getFullUrl = (slug) => {
    return `${window.location.origin}/budgets/${slug}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Link copiado para a área de transferência!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#1a5f3f', marginBottom: '10px' }}>
          Seu Link de Formulário
        </h2>
        <p style={{ color: '#666' }}>
          Gerencie seu link personalizado para clientes solicitarem orçamentos.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#efe',
          color: '#3c3',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {!isEditing && userLink && (
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '10px', color: userLink.primary_color }}>
                    {userLink.title}
                  </h4>
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    {userLink.description}
                  </p>
                  {userLink.custom_message && (
                    <p style={{
                      padding: '10px',
                      background: '#f0f0f0',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      fontStyle: 'italic'
                    }}>
                      {userLink.custom_message}
                    </p>
                  )}
                  <div style={{ 
                    background: '#f0f0f0', 
                    padding: '10px', 
                    borderRadius: '8px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <code style={{ flex: 1, fontSize: '14px' }}>
                      {getFullUrl(userLink.slug)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(getFullUrl(userLink.slug))}
                      style={{
                        padding: '5px 10px',
                        background: '#1a5f3f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                    <span>📊 {userLink.views_count || 0} visualizações</span>
                    <span>📝 {userLink.submissions_count || 0} envios</span>
                    <span style={{ 
                      padding: '2px 8px', 
                      background: userLink.is_active ? '#efe' : '#fee',
                      color: userLink.is_active ? '#3c3' : '#c33',
                      borderRadius: '4px'
                    }}>
                      {userLink.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleEdit}
                    style={{
                      padding: '8px 16px',
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleToggleActive}
                    style={{
                      padding: '8px 16px',
                      background: userLink.is_active ? '#fee' : '#efe',
                      color: userLink.is_active ? '#c33' : '#3c3',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {userLink.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(!userLink || isEditing) && (
            <div style={{
              background: '#f9f9f9',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>
                {userLink ? 'Editar Link' : 'Criar Seu Link'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    URL do Link (slug)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#666', marginRight: '5px' }}>
                      {window.location.origin}/budgets/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="meu-link-personalizado"
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <small style={{ color: '#666' }}>
                    Deixe em branco para gerar automaticamente
                  </small>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Título do Formulário
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Mensagem Personalizada (opcional)
                  </label>
                  <textarea
                    name="custom_message"
                    value={formData.custom_message}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Ex: Oferecemos desconto especial para propriedades acima de 100 hectares!"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Cor Principal
                  </label>
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                    style={{
                      width: '100px',
                      height: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      style={{ marginRight: '10px' }}
                    />
                    Link ativo
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: '#1a5f3f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {userLink ? 'Salvar Alterações' : 'Criar Link'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        padding: '10px 20px',
                        background: '#e0e0e0',
                        color: '#333',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormLinksManager;