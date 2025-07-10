import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/supabase';

const BudgetDetails = () => {
  const { budgetId } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (budgetId) {
      loadBudgetDetails();
    }
  }, [budgetId]);

  const loadBudgetDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await db.budgets.getById(budgetId);
      
      if (error) {
        setError('Erro ao carregar detalhes do orçamento: ' + error.message);
        return;
      }
      
      if (data) {
        setBudget(data);
      } else {
        setError('Orçamento não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar orçamento: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#e3f2fd', color: '#1976d2', text: 'Ativo' },
      approved: { bg: '#e8f5e9', color: '#388e3c', text: 'Aprovado' },
      rejected: { bg: '#ffebee', color: '#d32f2f', text: 'Rejeitado' },
      draft: { bg: '#f5f5f5', color: '#757575', text: 'Rascunho' }
    };
    
    const style = styles[status] || styles.draft;
    
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}>
        {style.text}
      </span>
    );
  };

  const handleViewPublicLink = () => {
    if (budget?.custom_link) {
      window.open(`/budget/${budget.custom_link}`, '_blank');
    }
  };

  const handleCopyLink = async () => {
    if (budget?.custom_link) {
      const fullLink = `${window.location.origin}/budget/${budget.custom_link}`;
      try {
        await navigator.clipboard.writeText(fullLink);
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        Carregando detalhes do orçamento...
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
          {error || 'Orçamento não encontrado'}
        </h2>
        <button
          onClick={() => navigate('/app/budgets')}
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Voltar aos Orçamentos
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '1rem' : '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? '1.5rem' : '2rem',
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            Detalhes do Orçamento
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {getStatusBadge(budget.status)}
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Criado em {formatDate(budget.created_at)}
            </span>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/app/budgets')}
            style={{
              background: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Voltar
          </button>
          <button
            onClick={handleViewPublicLink}
            style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Ver Link Público
          </button>
          <button
            onClick={handleCopyLink}
            style={{
              background: '#666',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Copiar Link
          </button>
        </div>
      </div>

      {/* Timeline de Status */}
      {(budget.approval_date || budget.rejection_date) && (
        <div style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Histórico do Orçamento
          </h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#e3f2fd',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                📄
              </div>
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                  Orçamento Criado
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {formatDate(budget.created_at)}
                </div>
              </div>
            </div>

            {budget.approval_date && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#e8f5e9',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  ✅
                </div>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem', color: '#388e3c' }}>
                    Orçamento Aprovado
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {formatDate(budget.approval_date)}
                  </div>
                </div>
              </div>
            )}

            {budget.rejection_date && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#ffebee',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  ❌
                </div>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem', color: '#d32f2f' }}>
                    Orçamento Rejeitado
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {formatDate(budget.rejection_date)}
                  </div>
                  {budget.rejection_comment && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      background: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #ffcdd2',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      <strong>Motivo:</strong> {budget.rejection_comment}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid de Informações */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Informações do Cliente */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Informações do Cliente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <strong style={{ color: '#666' }}>Nome:</strong><br/>
              {budget.budget_request?.client_name || 'N/A'}
            </div>
            <div>
              <strong style={{ color: '#666' }}>Email:</strong><br/>
              {budget.budget_request?.client_email || 'N/A'}
            </div>
            <div>
              <strong style={{ color: '#666' }}>Telefone:</strong><br/>
              {budget.budget_request?.client_phone || 'N/A'}
            </div>
            <div>
              <strong style={{ color: '#666' }}>Tipo:</strong><br/>
              {budget.budget_request?.client_type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </div>
          </div>
        </div>

        {/* Dados da Propriedade */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Dados da Propriedade
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <strong style={{ color: '#666' }}>Nome:</strong><br/>
              {budget.budget_request?.property_name || 'N/A'}
            </div>
            <div>
              <strong style={{ color: '#666' }}>Localização:</strong><br/>
              {budget.budget_request?.city} - {budget.budget_request?.state}
            </div>
            <div>
              <strong style={{ color: '#666' }}>Área:</strong><br/>
              {budget.budget_request?.property_area} hectares
            </div>
            <div>
              <strong style={{ color: '#666' }}>Vértices:</strong><br/>
              {budget.budget_request?.vertices_count}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>
          Resumo Financeiro
        </h3>
        
        {budget.budget_result?.breakdown && (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '1rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ 
                  padding: '0.75rem',
                  textAlign: 'left',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  Item
                </th>
                <th style={{ 
                  padding: '0.75rem',
                  textAlign: 'right',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {budget.budget_result.breakdown.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem', color: '#555' }}>
                    {item.item}
                  </td>
                  <td style={{ 
                    padding: '0.75rem', 
                    textAlign: 'right',
                    color: item.value < 0 ? '#d32f2f' : '#555'
                  }}>
                    {formatCurrency(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #e0e0e0' }}>
                <td style={{ 
                  padding: '0.75rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Total
                </td>
                <td style={{ 
                  padding: '0.75rem',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  color: '#333'
                }}>
                  {formatCurrency(budget.budget_result?.total_price)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '4px'
        }}>
          <span style={{ color: '#666' }}>Prazo estimado:</span>
          <span style={{ fontWeight: '500', color: '#333' }}>
            {budget.budget_result?.estimated_days || 15} dias úteis
          </span>
        </div>
      </div>

      {/* Serviços e Observações */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '2rem'
      }}>
        {/* Serviços Inclusos */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Serviços Inclusos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ color: '#555' }}>
              ✓ Georreferenciamento conforme Lei 10.267/2001
            </div>
            {budget.budget_request?.includes_topography && (
              <div style={{ color: '#555' }}>
                ✓ Levantamento topográfico
              </div>
            )}
            {budget.budget_request?.includes_environmental && (
              <div style={{ color: '#555' }}>
                ✓ Estudo ambiental básico
              </div>
            )}
            {budget.budget_request?.is_urgent && (
              <div style={{ color: '#ff9800' }}>
                ⚡ Processamento em regime de urgência
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
        {budget.budget_request?.additional_notes && (
          <div style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Observações Adicionais
            </h3>
            <p style={{ color: '#555', lineHeight: '1.6' }}>
              {budget.budget_request.additional_notes}
            </p>
          </div>
        )}
      </div>

      {/* Metadados */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>ID do Orçamento:</strong> {budget.id}
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Link Personalizado:</strong> {budget.custom_link || 'N/A'}
        </div>
        <div>
          <strong>Última Atualização:</strong> {formatDate(budget.updated_at)}
        </div>
      </div>
    </div>
  );
};

export default BudgetDetails;