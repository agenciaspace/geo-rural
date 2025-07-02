import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BudgetViewer = () => {
  const { customLink } = useParams();
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customLink) {
      loadBudget();
    }
  }, [customLink]);

  const loadBudget = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/link/${customLink}`);
      
      if (response.status === 404) {
        setError('Link não encontrado. Verifique se o endereço está correto.');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setBudget(data.budget);
      } else {
        setError('Erro ao carregar orçamento');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente mais tarde.');
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
        ⏳ Carregando orçamento...
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Orçamento Não Encontrado</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          🏠 Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: 'white', 
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2c5aa0, #1e3a5f)',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>💰 Proposta de Orçamento</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Georreferenciamento e Serviços Técnicos
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          
          {/* Informações do Cliente */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#2c5aa0', 
              borderBottom: '2px solid #e9ecef', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>
              👤 Informações do Cliente
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem',
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px'
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
              color: '#2c5aa0', 
              borderBottom: '2px solid #e9ecef', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>
              🏞️ Dados da Propriedade
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem',
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px'
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
              color: '#2c5aa0', 
              borderBottom: '2px solid #e9ecef', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>
              ⚙️ Serviços Inclusos
            </h3>
            <div style={{ 
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px'
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
                color: '#2c5aa0', 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}>
                💳 Detalhamento de Custos
              </h3>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#2c5aa0', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.budget_result.breakdown.map((item, index) => (
                    <tr key={index} style={{ 
                      borderBottom: '1px solid #dee2e6',
                      background: index % 2 === 0 ? '#f8f9fa' : 'white'
                    }}>
                      <td style={{ padding: '1rem' }}>{item.item}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {item.value < 0 ? '-' : ''}
                        {formatCurrency(Math.abs(item.value))}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ 
                    background: '#28a745', 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    <td style={{ padding: '1rem' }}>TOTAL</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* Valor Total Destacado */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
            }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                Valor Total do Investimento:
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                Prazo estimado: {budget.budget_result.estimated_days || 15} dias úteis
              </div>
            </div>
          </section>

          {/* Observações */}
          {budget.budget_request.additional_notes && (
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: '#2c5aa0', 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}>
                📝 Observações Adicionais
              </h3>
              <div style={{ 
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                padding: '1.5rem',
                borderRadius: '8px',
                color: '#856404'
              }}>
                {budget.budget_request.additional_notes}
              </div>
            </section>
          )}

          {/* Condições Comerciais */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#2c5aa0', 
              borderBottom: '2px solid #e9ecef', 
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>
              📋 Condições Comerciais
            </h3>
            <div style={{ 
              background: '#e3f2fd',
              padding: '1.5rem',
              borderRadius: '8px'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                💰 <strong>Pagamento:</strong> 50% no início + 50% na entrega
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                ⏱️ <strong>Validade da proposta:</strong> 30 dias
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                📄 <strong>Inclui:</strong> ART/TRT do responsável técnico
              </div>
              <div>
                📦 <strong>Entrega:</strong> Documentação em formato digital e físico
              </div>
            </div>
          </section>

          {/* Informações da Empresa */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{
              background: '#f8f9fa',
              border: '2px solid #dee2e6',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#2c5aa0', marginBottom: '1rem' }}>
                🌱 PRECIZU
              </h4>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                Assistente IA para profissionais de georreferenciamento
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                Sistema homologado para georreferenciamento rural
              </p>
            </div>
          </section>

          {/* Ações */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={generatePDF}
              style={{
                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '1rem',
                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
              }}
            >
              📄 Baixar Proposta em PDF
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'transparent',
                color: '#2c5aa0',
                border: '2px solid #2c5aa0',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              🏠 Conhecer a Plataforma
            </button>
            <button
              onClick={() => window.location.href = '/#budgets'}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🏢 Central de Orçamentos
            </button>
          </div>

          {/* Footer com data */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            paddingTop: '2rem',
            borderTop: '1px solid #dee2e6',
            color: '#666',
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