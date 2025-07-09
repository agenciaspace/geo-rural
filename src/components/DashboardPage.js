import React, { useState, useEffect } from 'react';
import { db } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBudgets();
    }
  }, [isAuthenticated]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await db.budgets.list();
      
      if (dbError) {
        setError('Erro ao carregar orçamentos: ' + dbError.message);
        console.error('Erro ao carregar orçamentos:', dbError);
      } else {
        setBudgets(data || []);
      }
    } catch (error) {
      setError('Erro inesperado ao carregar orçamentos');
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
    // Try to get client info from multiple sources
    const clientName = budget.budget_request?.client_name || 
                      budget.client_name || 
                      budget.clients?.name || '';
                      
    const propertyName = budget.budget_request?.property_name || 
                        budget.property_name || '';
                        
    const city = budget.budget_request?.city || 
                 budget.city || '';
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase());

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
    const totalRevenue = budgets.reduce((sum, budget) => {
      const value = budget.budget_result?.total_price || 
                   budget.budget_result?.total_cost || 
                   budget.total || 
                   0;
      return sum + parseFloat(value);
    }, 0);
    
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
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadBudgets();
            }}
            className="btn btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <style jsx>{`
        .dashboard-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 1rem;
          }
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .page-subtitle {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        .search-input {
          flex: 1;
          min-width: 300px;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .search-input {
            min-width: auto;
            width: 100%;
          }
        }

        .search-input:focus {
          outline: none;
          border-color: #2c5aa0;
          box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-secondary {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .stat-card.primary .stat-label,
        .stat-card.primary .stat-secondary {
          opacity: 0.9;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .status-item {
          text-align: center;
          padding: 0.5rem;
        }

        .status-number {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 0.2rem;
        }

        .status-label {
          font-size: 0.7rem;
          color: #666;
        }

        .budgets-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .section-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .budgets-list {
          padding: 1.5rem;
        }

        .budget-item {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          background: #f8f9fa;
          transition: all 0.2s ease;
        }

        .budget-item:hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .budget-info {
          flex: 1;
        }

        .budget-client {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
        }

        .budget-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .budget-status {
          text-align: right;
          margin-left: 1rem;
        }

        .budget-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #28a745;
          margin-bottom: 0.5rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 1rem;
          }
          
          .controls {
            flex-direction: column;
          }
          
          .search-input {
            min-width: auto;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .budget-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .budget-status {
            text-align: left;
            margin-left: 0;
            margin-top: 1rem;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          📊 Dashboard
        </h1>
        <p className="page-subtitle">
          Visão geral do desempenho dos seus orçamentos e métricas
        </p>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Buscar por cliente, propriedade ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos os períodos</option>
          <option value="today">Hoje</option>
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">💰 Receita Total</div>
          <div className="stat-value">{formatCurrency(analytics.totalRevenue)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">📊 Total de Orçamentos</div>
          <div className="stat-value">{budgets.length}</div>
          <div className="stat-secondary">
            Média: {formatCurrency(analytics.avgBudgetValue)}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">✅ Taxa de Aprovação</div>
          <div className="stat-value">{analytics.approvalRate}%</div>
          <div className="stat-secondary">
            {analytics.approvedCount} de {budgets.length} orçamentos
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">📈 Status dos Orçamentos</div>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-number" style={{color: '#007bff'}}>
                {analytics.activeCount}
              </div>
              <div className="status-label">Ativos</div>
            </div>
            <div className="status-item">
              <div className="status-number" style={{color: '#28a745'}}>
                {analytics.approvedCount}
              </div>
              <div className="status-label">Aprovados</div>
            </div>
            <div className="status-item">
              <div className="status-number" style={{color: '#dc3545'}}>
                {analytics.rejectedCount}
              </div>
              <div className="status-label">Rejeitados</div>
            </div>
            <div className="status-item">
              <div className="status-number" style={{color: '#ffc107'}}>
                {analytics.resubmittedCount}
              </div>
              <div className="status-label">Reenviados</div>
            </div>
          </div>
        </div>
      </div>

      <div className="budgets-section">
        <div className="section-header">
          <h2 className="section-title">
            📋 Orçamentos Recentes ({filteredBudgets.length})
          </h2>
          <p className="section-subtitle">
            Acompanhe o status e desempenho dos seus orçamentos
          </p>
        </div>
        
        <div className="budgets-list">
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map((budget) => (
              <div key={budget.id} className="budget-item">
                <div className="budget-header">
                  <div className="budget-info">
                    <div className="budget-client">
                      👤 {budget.budget_request?.client_name || budget.client_name || budget.clients?.name || 'Cliente'}
                    </div>
                    <div style={{ color: '#666', marginBottom: '0.5rem' }}>
                      🏞️ {budget.budget_request?.property_name || budget.property_name || 'Propriedade'} • {budget.budget_request?.city || budget.city || 'Cidade'}-{budget.budget_request?.state || budget.state || 'UF'}
                    </div>
                    <div className="budget-details">
                      <div><strong>Vértices:</strong> {budget.budget_request?.vertices_count || budget.vertices_count || 'N/A'}</div>
                      <div><strong>Área:</strong> {budget.budget_request?.property_area || budget.property_area || 'N/A'} ha</div>
                      <div><strong>Tipo:</strong> {(budget.budget_request?.client_type || budget.client_type || budget.clients?.client_type) === 'pessoa_fisica' ? 'PF' : 'PJ'}</div>
                      <div><strong>Data:</strong> {formatDate(budget.created_at)}</div>
                    </div>
                  </div>
                  
                  <div className="budget-status">
                    <div className="budget-value">
                      {formatCurrency(budget.budget_result?.total_price || budget.budget_result?.total_cost || budget.total || 0)}
                    </div>
                    <div
                      className="status-badge"
                      style={{ background: getStatusColor(budget.status || 'active') }}
                    >
                      {getStatusLabel(budget.status || 'active')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
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

export default DashboardPage;