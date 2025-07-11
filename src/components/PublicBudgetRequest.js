import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BRAZILIAN_STATES } from '../config/constants';
import { supabase } from '../config/supabase';

const PublicBudgetRequest = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formLink, setFormLink] = useState(null);
  const [loadingLink, setLoadingLink] = useState(true);
  // Carregar informações do link
  useEffect(() => {
    loadFormLink();
  }, [slug]);

  const loadFormLink = async () => {
    try {
      setLoadingLink(true);
      
      const { data, error } = await supabase
        .from('budget_form_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
        
      if (error || !data) {
        setError('Link inválido ou inativo');
        return;
      }
      
      setFormLink(data);
      
      // Incrementar contador de visualizações
      await supabase
        .from('budget_form_links')
        .update({ 
          views_count: data.views_count + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
    } catch (err) {
      setError('Erro ao carregar formulário');
    } finally {
      setLoadingLink(false);
    }
  };

  const [formData, setFormData] = useState({
    // Dados do cliente
    client_name: '',
    client_email: '',
    client_phone: '',
    client_type: 'pessoa_fisica',
    
    // Dados da propriedade
    property_name: '',
    state: '',
    city: '',
    vertices_count: '4',
    property_area: '',
    
    // Serviços adicionais
    is_urgent: false,
    includes_topography: false,
    includes_environmental: false,
    additional_notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isFormValid = () => {
    return formData.client_name && 
           formData.client_email && 
           formData.client_phone &&
           formData.property_name &&
           formData.state &&
           formData.city &&
           formData.vertices_count &&
           formData.property_area;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Primeiro calcula o orçamento
      const calculateResponse = await fetch('/api/calculate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area)
        })
      });

      if (!calculateResponse.ok) {
        throw new Error('Erro ao calcular orçamento');
      }

      const budgetResult = await calculateResponse.json();

      if (!budgetResult.success) {
        throw new Error(budgetResult.message || 'Erro ao calcular orçamento');
      }

      // Criar solicitação pública de orçamento
      const response = await fetch('/api/public-budget-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget_result: budgetResult,
          total: budgetResult.total_price || budgetResult.total_cost,
          form_link_id: formLink?.id,
          user_id: formLink?.user_id // Vincular ao dono do link
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erro ao criar solicitação');
      }

      setSuccess('Solicitação enviada com sucesso! Em breve entraremos em contato.');
      
      // Redirecionar para página de visualização se houver link
      if (result.data && result.data.custom_link) {
        setTimeout(() => {
          navigate(`/view/${result.data.custom_link}`);
        }, 2000);
      }
      
      // Limpar formulário
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_type: 'pessoa_fisica',
        property_name: '',
        state: '',
        city: '',
        vertices_count: '4',
        property_area: '',
        is_urgent: false,
        includes_topography: false,
        includes_environmental: false,
        additional_notes: ''
      });
    } catch (err) {
      setError(err.message || 'Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingLink) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a57 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Carregando formulário...</div>
      </div>
    );
  }

  if (!formLink) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a57 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#c33', marginBottom: '20px' }}>Link Inválido</h2>
          <p>Este link de formulário não existe ou foi desativado.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#1a5f3f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: formLink.primary_color ? 
        `linear-gradient(135deg, ${formLink.primary_color} 0%, ${formLink.primary_color}dd 100%)` :
        'linear-gradient(135deg, #1a5f3f 0%, #2d7a57 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        width: '100%',
        padding: '40px'
      }}>
        {formLink.company_logo_url && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src={formLink.company_logo_url} 
              alt="Logo" 
              style={{ maxHeight: '80px', maxWidth: '200px' }}
            />
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: formLink.primary_color || '#1a5f3f', marginBottom: '10px' }}>
            {formLink.title || 'Solicitar Orçamento'}
          </h1>
          <p style={{ color: '#666' }}>
            {formLink.description || 'Preencha o formulário abaixo para receber um orçamento personalizado'}
          </p>
          {formLink.custom_message && (
            <p style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: '#f0f0f0', 
              borderRadius: '8px',
              fontStyle: 'italic'
            }}>
              {formLink.custom_message}
            </p>
          )}
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

        <form onSubmit={handleSubmit}>
          {/* Dados do Cliente */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#1a5f3f', marginBottom: '20px' }}>Seus Dados</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo de Cliente *
                </label>
                <select
                  name="client_type"
                  value={formData.client_type}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="pessoa_fisica">Pessoa Física</option>
                  <option value="pessoa_juridica">Pessoa Jurídica</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados da Propriedade */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#1a5f3f', marginBottom: '20px' }}>Dados da Propriedade</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome da Propriedade *
                </label>
                <input
                  type="text"
                  name="property_name"
                  value={formData.property_name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Estado *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                >
                  <option value="">Selecione o estado</option>
                  {BRAZILIAN_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Número de Vértices *
                </label>
                <input
                  type="number"
                  name="vertices_count"
                  value={formData.vertices_count}
                  onChange={handleInputChange}
                  min="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Área da Propriedade (hectares) *
                </label>
                <input
                  type="number"
                  name="property_area"
                  value={formData.property_area}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Serviços Adicionais */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#1a5f3f', marginBottom: '20px' }}>Serviços Adicionais</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_urgent"
                  checked={formData.is_urgent}
                  onChange={handleInputChange}
                  style={{ marginRight: '10px' }}
                />
                <span>Serviço Urgente (+R$ 300,00)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="includes_topography"
                  checked={formData.includes_topography}
                  onChange={handleInputChange}
                  style={{ marginRight: '10px' }}
                />
                <span>Levantamento Topográfico (+R$ 800,00)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="includes_environmental"
                  checked={formData.includes_environmental}
                  onChange={handleInputChange}
                  style={{ marginRight: '10px' }}
                />
                <span>Estudo Ambiental Básico (+R$ 600,00)</span>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Observações Adicionais
            </label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleInputChange}
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
              placeholder="Descreva aqui qualquer informação adicional sobre sua propriedade ou necessidades específicas..."
            />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: '12px 30px',
                background: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              style={{
                padding: '12px 40px',
                background: isLoading || !isFormValid() ? '#ccc' : '#1a5f3f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading || !isFormValid() ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Enviando...' : 'Solicitar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicBudgetRequest;