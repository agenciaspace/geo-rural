import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const FormLinksManager = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  
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
      loadLinks();
    }
  }, [user]);

  const loadLinks = async () => {
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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLinks(data || []);
    } catch (err) {
      setError('Erro ao carregar links: ' + err.message);
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
      
      // Verificar se o slug já existe (exceto para o próprio link sendo editado)
      const { data: existingLinks } = await supabase
        .from('budget_form_links')
        .select('id, slug')
        .eq('slug', finalSlug);
      
      if (existingLinks && existingLinks.length > 0) {
        // Se estamos editando e o slug é do próprio link, ok
        if (editingLink && existingLinks[0].id === editingLink.id) {
          // Slug é do próprio link sendo editado, ok
        } else {
          // Slug já existe, gerar um novo
          let counter = 1;
          let newSlug = finalSlug;
          while (existingLinks.some(link => link.slug === newSlug)) {
            newSlug = `${finalSlug}-${counter}`;
            counter++;
          }
          finalSlug = newSlug;
        }
      }
      
      const dataToSave = {
        ...formData,
        slug: finalSlug,
        user_id: user?.id
      };

      if (editingLink) {
        const { error } = await supabase
          .from('budget_form_links')
          .update(dataToSave)
          .eq('id', editingLink.id);
        
        if (error) throw error;
        setSuccess('Link atualizado com sucesso!');
      } else {
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

      resetForm();
      loadLinks();
    } catch (err) {
      setError('Erro ao salvar link: ' + err.message);
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      slug: link.slug,
      title: link.title,
      description: link.description,
      custom_message: link.custom_message || '',
      primary_color: link.primary_color || '#1a5f3f',
      is_active: link.is_active
    });
    setShowCreateForm(true);
  };

  const handleToggleActive = async (link) => {
    try {
      const { error } = await supabase
        .from('budget_form_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);
      
      if (error) throw error;
      loadLinks();
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
    setEditingLink(null);
    setShowCreateForm(false);
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
          Gerenciar Links de Formulário
        </h2>
        <p style={{ color: '#666' }}>
          Crie e gerencie links personalizados para seus clientes solicitarem orçamentos.
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

      {!showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '12px 24px',
            background: '#1a5f3f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Criar Novo Link
        </button>
      )}

      {showCreateForm && (
        <div style={{
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px' }}>
            {editingLink ? 'Editar Link' : 'Criar Novo Link'}
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
                {editingLink ? 'Salvar Alterações' : 'Criar Link'}
              </button>
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
            </div>
          </form>
        </div>
      )}

      {/* Lista de Links */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Seus Links</h3>
        
        {isLoading ? (
          <p>Carregando...</p>
        ) : links.length === 0 ? (
          <p style={{ color: '#666' }}>
            Você ainda não criou nenhum link. Clique em "Criar Novo Link" para começar.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {links.map(link => (
              <div
                key={link.id}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '10px', color: link.primary_color }}>
                      {link.title}
                    </h4>
                    <p style={{ color: '#666', marginBottom: '10px' }}>
                      {link.description}
                    </p>
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
                        {getFullUrl(link.slug)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getFullUrl(link.slug))}
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
                      <span>📊 {link.views_count || 0} visualizações</span>
                      <span>📝 {link.submissions_count || 0} envios</span>
                      <span style={{ 
                        padding: '2px 8px', 
                        background: link.is_active ? '#efe' : '#fee',
                        color: link.is_active ? '#3c3' : '#c33',
                        borderRadius: '4px'
                      }}>
                        {link.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(link)}
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
                      onClick={() => handleToggleActive(link)}
                      style={{
                        padding: '8px 16px',
                        background: link.is_active ? '#fee' : '#efe',
                        color: link.is_active ? '#c33' : '#3c3',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {link.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLinksManager;