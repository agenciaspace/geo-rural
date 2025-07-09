import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/budgets');
      const data = await response.json();
      
      if (data.success) {
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'active': return '#007bff';
      case 'resubmitted': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'active': return 'Ativo';
      case 'resubmitted': return 'Reenviado';
      default: return 'Desconhecido';
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = 
      budget.budget_request.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.budget_request.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.budget_request.city?.toLowerCase().includes(searchTerm.toLowerCase());

    if (dateFilter === 'all') return matchesSearch;
    
    const itemDate = new Date(budget.created_at);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return matchesSearch && itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return matchesSearch && itemDate >= monthAgo;
      default:
        return matchesSearch;
    }
  });

  const getAnalyticsData = () => {
    const totalRevenue = budgets.reduce((sum, budget) => 
      sum + (budget.budget_result?.total_price || budget.budget_result?.total_cost || 0), 0);
    const avgBudgetValue = budgets.length > 0 ? totalRevenue / budgets.length : 0;
    
    const activeCount = budgets.filter(b => b.status === 'active').length;
    const approvedCount = budgets.filter(b => b.status === 'approved').length;
    const rejectedCount = budgets.filter(b => b.status === 'rejected').length;
    const resubmittedCount = budgets.filter(b => b.status === 'resubmitted').length;
    
    return {
      totalRevenue,
      avgBudgetValue,
      activeCount,
      approvedCount,
      rejectedCount,
      resubmittedCount,
      approvalRate: budgets.length > 0 ? ((approvedCount / budgets.length) * 100).toFixed(1) : 0
    };
  };

  const analytics = getAnalyticsData();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        fontSize: '1.2rem'
      }}>
        ⏳ Carregando dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>📊 Dashboard OnGeo</h2>
        <p>Acompanhe o desempenho dos seus orçamentos</p>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Buscar por cliente, propriedade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        />
        <select 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value="all">Todos os períodos</option>
          <option value="today">Hoje</option>
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
        </select>
      </div>

      {/* Estatísticas Principais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #28a745, #20c997)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            💰 Receita Total
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {formatCurrency(analytics.totalRevenue)}
          </div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            📊 Total de Orçamentos
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c5aa0' }}>
            {budgets.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
            Média: {formatCurrency(analytics.avgBudgetValue)}
          </div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            ✅ Aprovados
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {analytics.approvedCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
            Taxa: {analytics.approvalRate}%
          </div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            📈 Status dos Orçamentos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#007bff' }}>
                {analytics.activeCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#999' }}>Ativos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#dc3545' }}>
                {analytics.rejectedCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#999' }}>Rejeitados</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffc107' }}>
                {analytics.resubmittedCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#999' }}>Reenviados</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6c757d' }}>
                {budgets.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#999' }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div style={{
        background: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
            📋 Orçamentos ({filteredBudgets.length})
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Acompanhe o status e desempenho de todos os orçamentos
          </p>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {filteredBudgets.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredBudgets.map((budget) => (
                <div key={budget.id} style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
                        👤 {budget.budget_request.client_name}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        🏞️ {budget.budget_request.property_name} • {budget.budget_request.city}-{budget.budget_request.state}
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '0.5rem', 
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div><strong>Vértices:</strong> {budget.budget_request.vertices_count}</div>
                        <div><strong>Área:</strong> {budget.budget_request.property_area} ha</div>
                        <div><strong>Tipo:</strong> {budget.budget_request.client_type === 'pessoa_fisica' ? 'PF' : 'PJ'}</div>
                        <div><strong>Data:</strong> {formatDate(budget.created_at)}</div>
                      </div>
                      {budget.custom_link && (
                        <div style={{ fontSize: '0.8rem', color: '#007bff', marginBottom: '0.5rem' }}>
                          🔗 Link: {budget.custom_link}
                        </div>
                      )}
                      {budget.rejection_comment && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#dc3545', 
                          marginTop: '0.5rem',
                          fontStyle: 'italic',
                          background: '#ffe6e6',
                          padding: '0.5rem',
                          borderRadius: '4px'
                        }}>
                          💬 Motivo da rejeição: "{budget.rejection_comment}"
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
                        {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: getStatusColor(budget.status || 'active'),
                        color: 'white'
                      }}>
                        {getStatusLabel(budget.status || 'active')}
                      </div>
                      {budget.approval_date && (
                        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
                          Aprovado em {formatDate(budget.approval_date)}
                        </div>
                      )}
                      {budget.rejection_date && (
                        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
                          Rejeitado em {formatDate(budget.rejection_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#666'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p>
                {searchTerm || dateFilter !== 'all' 
                  ? 'Nenhum orçamento encontrado com os filtros aplicados.' 
                  : 'Nenhum orçamento criado ainda.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;