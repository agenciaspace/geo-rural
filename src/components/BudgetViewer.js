import React, { useState, useEffect } from 'react';
import { db } from '../config/supabase';

const BudgetViewer = ({ customLink }) => {
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [success, setSuccess] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (customLink) {
      loadBudget();
    }
  }, [customLink]);

  const loadBudget = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 BudgetViewer: Iniciando debug completo');
      console.log('📋 Parâmetros:', { customLink, url: window.location.href });
      
      // Debug: verificar se o customLink está correto
      if (!customLink) {
        setError('Link inválido - customLink não fornecido');
        return;
      }
      
      console.log('🎯 Tentativa 1: Supabase direto via db.budgets.getByCustomLink');
      const { data, error } = await db.budgets.getByCustomLink(customLink);
      console.log('📊 Resultado Supabase:', { 
        success: !error && data, 
        data: data, 
        error: error,
        errorCode: error?.code,
        errorMessage: error?.message 
      });
      
      if (!error && data) {
        console.log('✅ Sucesso via Supabase!');
        setBudget(data);
        return;
      }
      
      console.log('🎯 Tentativa 2: BYPASS BACKEND - Produção usa apenas Supabase');
      // Em produção, não tentar backend pois Railway tem problemas de infraestrutura
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('💻 Desenvolvimento: Tentando backend local...');
        try {
          const response = await fetch(`/api/budgets/link/${customLink}`);
          if (response.ok) {
            const backendData = await response.json();
            if (backendData.success && backendData.budget) {
              console.log('✅ Sucesso via Backend local!');
              setBudget(backendData.budget);
              return;
            }
          }
        } catch (backendErr) {
          console.log('❌ Backend local falhou, continuando para Supabase...');
        }
      } else {
        console.log('🏗️ Produção: Backend bypassed devido a problemas de infraestrutura do Railway');
      }
      
      console.log('🎯 Tentativa 3: Teste direto com ID conhecido');
      try {
        // Testar com o ID conhecido do orçamento
        const { data: { supabase } } = await import('../config/supabase');
        const { data: directData, error: directError } = await supabase
          .from('budgets')
          .select('*')
          .eq('id', '502d6aa4-5549-41ab-b6de-d4f4138b506b')
          .single();
        
        console.log('📊 Teste direto por ID:', { directData, directError });
        
        if (!directError && directData && directData.custom_link === customLink) {
          console.log('✅ Encontrado via ID direto!');
          setBudget(directData);
          return;
        }
      } catch (directErr) {
        console.error('❌ Erro no teste direto:', directErr);
      }
      
      // Todas as tentativas falharam
      console.log('❌ Todas as tentativas falharam');
      console.log('🔍 Erro original do Supabase:', error);
      
      if (error) {
        if (error.code === 'PGRST116') {
          setError(`Link não encontrado: "${customLink}". Verifique o endereço.`);
        } else if (error.code === '42501') {
          setError('Erro de permissão. Execute: ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;');
        } else {
          setError(`Erro Supabase [${error.code}]: ${error.message}`);
        }
      } else {
        setError(`Orçamento "${customLink}" não encontrado. Verifique se existe no banco.`);
      }
      
    } catch (err) {
      console.error('💥 Erro geral:', err);
      setError('Erro fatal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generatePDF = async () => {
    try {
      const response = await fetch('/api/generate-proposal-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget.budget_request)
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proposta_${budget.budget_request.client_name.replace(' ', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Tem certeza que deseja aprovar este orçamento?')) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { data, error } = await db.budgets.approveByCustomLink(customLink);

      if (error) {
        setError('Erro ao aprovar orçamento: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        setSuccess('Orçamento aprovado com sucesso! O profissional será notificado.');
        setBudget(prev => ({ ...prev, status: 'approved', approval_date: new Date().toISOString() }));
      } else {
        setError('Erro ao aprovar orçamento');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      setError('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const { data, error } = await db.budgets.rejectByCustomLink(customLink, rejectComment);

      if (error) {
        setError('Erro ao rejeitar orçamento: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        setSuccess('Orçamento rejeitado. O profissional será notificado com seus comentários.');
        setBudget(prev => ({ 
          ...prev, 
          status: 'rejected', 
          rejection_date: new Date().toISOString(),
          rejection_comment: rejectComment 
        }));
        setShowRejectForm(false);
        setRejectComment('');
      } else {
        setError('Erro ao rejeitar orçamento');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLinkToClipboard = () => {
    const fullLink = `${window.location.origin}/budget/${customLink}`;
    navigator.clipboard.writeText(fullLink);
    alert('Link copiado para a área de transferência!');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem' 
      }}>
        Carregando orçamento...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Orçamento Não Encontrado</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: '#666',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      padding: isMobile ? '0' : '2rem 0'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: isMobile ? '0' : '0 auto', 
        background: 'white', 
        borderRadius: isMobile ? '0' : '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#333' }}>Proposta de Orçamento</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
            Georreferenciamento e Serviços Técnicos
          </p>
        </div>

        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
          
          {/* Messages */}
          {error && (
            <div style={{ 
              background: '#fff5f5', 
              color: '#666', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '2rem',
              textAlign: 'center',
              border: '1px solid #ffdddd'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              background: '#f5fff5', 
              color: '#666', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '2rem',
              textAlign: 'center',
              border: '1px solid #ddffdd'
            }}>
              {success}
            </div>
          )}

          {/* Status do Orçamento */}
          {budget.status && budget.status !== 'active' && (
            <div style={{
              background: '#f8f8f8',
              border: `2px solid ${budget.status === 'approved' ? '#28a745' : '#dc3545'}`,
              color: '#333',
              padding: '1.5rem',
              borderRadius: '4px',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {budget.status === 'approved' ? 'ORÇAMENTO APROVADO' : 'ORÇAMENTO REJEITADO'}
              </div>
              {budget.approval_date && (
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  em {new Date(budget.approval_date).toLocaleDateString('pt-BR')}
                </div>
              )}
              {budget.rejection_date && (
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  em {new Date(budget.rejection_date).toLocaleDateString('pt-BR')}
                  {budget.rejection_comment && (
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                      Motivo: "{budget.rejection_comment}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Informações do Cliente */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#333', 
              borderBottom: '1px solid #e5e5e5', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              fontSize: '1.25rem'
            }}>
              Informações do Cliente
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: isMobile ? '0.5rem' : '1rem',
              background: '#fafafa',
              padding: isMobile ? '0.75rem' : '1rem',
              borderRadius: '4px',
              border: '1px solid #e5e5e5'
            }}>
              <div>
                <strong>Nome:</strong> {budget.budget_request.client_name}
              </div>
              <div>
                <strong>Email:</strong> {budget.budget_request.client_email}
              </div>
              <div>
                <strong>Telefone:</strong> {budget.budget_request.client_phone}
              </div>
              <div>
                <strong>Tipo:</strong> {budget.budget_request.client_type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </div>
            </div>
          </section>

          {/* Dados da Propriedade */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#333', 
              borderBottom: '1px solid #e5e5e5', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              fontSize: '1.25rem'
            }}>
              Dados da Propriedade
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: isMobile ? '0.5rem' : '1rem',
              background: '#fafafa',
              padding: isMobile ? '0.75rem' : '1rem',
              borderRadius: '4px',
              border: '1px solid #e5e5e5'
            }}>
              <div>
                <strong>Nome:</strong> {budget.budget_request.property_name}
              </div>
              <div>
                <strong>Localização:</strong> {budget.budget_request.city} - {budget.budget_request.state}
              </div>
              <div>
                <strong>Área:</strong> {budget.budget_request.property_area} hectares
              </div>
              <div>
                <strong>Vértices:</strong> {budget.budget_request.vertices_count}
              </div>
            </div>
          </section>

          {/* Serviços Inclusos */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#333', 
              borderBottom: '1px solid #e5e5e5', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              fontSize: '1.25rem'
            }}>
              Serviços Inclusos
            </h3>
            <div style={{ 
              background: '#fafafa',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #e5e5e5'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                ✅ Georreferenciamento conforme Lei 10.267/2001
              </div>
              {budget.budget_request.includes_topography && (
                <div style={{ marginBottom: '0.5rem' }}>
                  ✅ Levantamento topográfico
                </div>
              )}
              {budget.budget_request.includes_environmental && (
                <div style={{ marginBottom: '0.5rem' }}>
                  ✅ Estudo ambiental básico
                </div>
              )}
              {budget.budget_request.is_urgent && (
                <div style={{ marginBottom: '0.5rem' }}>
                  ⚡ Processamento em regime de urgência
                </div>
              )}
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                • Inclui ART/TRT do responsável técnico<br/>
                • Documentação entregue em formato digital e físico<br/>
                • Suporte técnico durante todo o processo
              </div>
            </div>
          </section>

          {/* Detalhamento de Custos */}
          {budget.budget_result.breakdown && (
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: '#333', 
                borderBottom: '1px solid #e5e5e5', 
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.25rem'
              }}>
                Detalhamento de Custos
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  background: 'white',
                  border: '1px solid #e5e5e5',
                  minWidth: isMobile ? '300px' : 'auto'
                }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #e5e5e5' }}>
                      <th style={{ 
                        padding: isMobile ? '0.75rem' : '1rem', 
                        textAlign: 'left', 
                        color: '#333',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}>Item</th>
                      <th style={{ 
                        padding: isMobile ? '0.75rem' : '1rem', 
                        textAlign: 'right', 
                        color: '#333',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.budget_result.breakdown.map((item, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #e5e5e5'
                      }}>
                        <td style={{ 
                          padding: isMobile ? '0.75rem' : '1rem', 
                          color: '#555',
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>{item.item}</td>
                        <td style={{ 
                          padding: isMobile ? '0.75rem' : '1rem', 
                          textAlign: 'right', 
                          color: '#555',
                          fontSize: isMobile ? '0.9rem' : '1rem',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.value < 0 ? '-' : ''}
                          {formatCurrency(Math.abs(item.value))}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ 
                      borderTop: '2px solid #333',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '1rem' : '1.1rem'
                    }}>
                      <td style={{ 
                        padding: isMobile ? '0.75rem' : '1rem', 
                        color: '#333'
                      }}>TOTAL</td>
                      <td style={{ 
                        padding: isMobile ? '0.75rem' : '1rem', 
                        textAlign: 'right', 
                        color: '#333',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Valor Total Destacado */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{
              background: '#f8f8f8',
              border: '2px solid #333',
              padding: '2rem',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#666' }}>
                Valor Total do Investimento:
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#666' }}>
                Prazo estimado: {budget.budget_result.estimated_days || 15} dias úteis
              </div>
            </div>
          </section>

          {/* Observações */}
          {budget.budget_request.additional_notes && (
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: '#333', 
                borderBottom: '1px solid #e5e5e5', 
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.25rem'
              }}>
                Observações Adicionais
              </h3>
              <div style={{ 
                background: '#fafafa',
                border: '1px solid #e5e5e5',
                padding: '1rem',
                borderRadius: '4px',
                color: '#555'
              }}>
                {budget.budget_request.additional_notes}
              </div>
            </section>
          )}

          {/* Condições Comerciais */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#333', 
              borderBottom: '1px solid #e5e5e5', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              fontSize: '1.25rem'
            }}>
              Condições Comerciais
            </h3>
            <div style={{ 
              background: '#fafafa',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #e5e5e5'
            }}>
              <div style={{ marginBottom: '0.5rem', color: '#555' }}>
                <strong>Pagamento:</strong> 50% no início + 50% na entrega
              </div>
              <div style={{ marginBottom: '0.5rem', color: '#555' }}>
                <strong>Validade da proposta:</strong> 30 dias
              </div>
              <div style={{ marginBottom: '0.5rem', color: '#555' }}>
                <strong>Inclui:</strong> ART/TRT do responsável técnico
              </div>
              <div style={{ color: '#555' }}>
                <strong>Entrega:</strong> Documentação em formato digital e físico
              </div>
            </div>
          </section>

          {/* Informações da Empresa */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{
              background: '#fafafa',
              border: '1px solid #e5e5e5',
              padding: '1.5rem',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>
                OnGeo
              </h4>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                Assistente IA para profissionais de georreferenciamento
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>
                Sistema homologado para georreferenciamento rural
              </p>
            </div>
          </section>

          {/* Ações de Aprovação/Rejeição */}
          {(!budget.status || budget.status === 'active') && (
            <section style={{ marginBottom: '2rem' }}>
              <div style={{
                background: '#fafafa',
                padding: '2rem',
                borderRadius: '4px',
                border: '1px solid #e5e5e5'
              }}>
                <h3 style={{ 
                  color: '#333', 
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  fontSize: '1.25rem'
                }}>
                  Sua Decisão sobre a Proposta
                </h3>
                
                {!showRejectForm ? (
                  <div style={{ 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '1rem',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: isMobile ? '1rem' : '1rem 2rem',
                        borderRadius: '4px',
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        fontWeight: '600',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        width: isMobile ? '100%' : 'auto',
                        minWidth: isMobile ? '100%' : '200px',
                        opacity: isSubmitting ? 0.6 : 1,
                        transition: 'all 0.2s',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      {isSubmitting ? 'Processando...' : 'Aprovar Orçamento'}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isSubmitting}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: isMobile ? '1rem' : '1rem 2rem',
                        borderRadius: '4px',
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        fontWeight: '600',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        width: isMobile ? '100%' : 'auto',
                        minWidth: isMobile ? '100%' : '200px',
                        opacity: isSubmitting ? 0.6 : 1,
                        transition: 'all 0.2s',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      Rejeitar Orçamento
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: '#333', marginBottom: '1rem' }}>
                      Motivo da Rejeição
                    </h4>
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Por favor, informe o motivo da rejeição para que possamos melhorar nossa proposta..."
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #d0d0d0',
                        fontSize: '16px', // Prevents zoom on iOS
                        marginBottom: '1rem',
                        resize: 'vertical',
                        WebkitAppearance: 'none'
                      }}
                    />
                    <div style={{ 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '1rem',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={handleReject}
                        disabled={isSubmitting || !rejectComment.trim()}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: isMobile ? '1rem' : '0.8rem 1.5rem',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: (isSubmitting || !rejectComment.trim()) ? 'not-allowed' : 'pointer',
                          width: isMobile ? '100%' : 'auto',
                          minWidth: isMobile ? '100%' : '160px',
                          opacity: (isSubmitting || !rejectComment.trim()) ? 0.6 : 1,
                          transition: 'all 0.2s',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Rejeição'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectComment('');
                          setError(null);
                        }}
                        disabled={isSubmitting}
                        style={{
                          background: 'transparent',
                          color: '#666',
                          border: '1px solid #d0d0d0',
                          padding: isMobile ? '1rem' : '0.8rem 1.5rem',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          width: isMobile ? '100%' : 'auto',
                          minWidth: isMobile ? '100%' : '160px',
                          opacity: isSubmitting ? 0.6 : 1,
                          transition: 'all 0.2s',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Ações Gerais */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={generatePDF}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: isMobile ? '1rem' : '0.8rem 1.5rem',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? '100%' : '200px',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              Baixar Proposta em PDF
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'transparent',
                color: '#666',
                border: '1px solid #d0d0d0',
                padding: isMobile ? '1rem' : '0.8rem 1.5rem',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? '100%' : '200px',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              Conhecer a Plataforma
            </button>
            <button
              onClick={() => window.location.href = '/#budgets'}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: isMobile ? '1rem' : '0.8rem 1.5rem',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? '100%' : '200px',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              Central de Orçamentos
            </button>
          </div>

          {/* Footer com data */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            paddingTop: '2rem',
            borderTop: '1px solid #e5e5e5',
            color: '#888',
            fontSize: '0.9rem'
          }}>
            Orçamento gerado em {formatDate(budget.created_at)}<br/>
            {budget.updated_at !== budget.created_at && (
              <>Atualizado em {formatDate(budget.updated_at)}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetViewer;