import React, { useState, useEffect } from 'react';

const BudgetHub = () => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form data para criação/edição
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    property_name: '',
    state: '',
    city: '',
    vertices_count: 4,
    property_area: 1.0,
    client_type: 'pessoa_fisica',
    is_urgent: false,
    includes_topography: false,
    includes_environmental: false,
    additional_notes: ''
  });

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    if (activeView === 'list') {
      loadBudgets();
    }
  }, [activeView]);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/budgets');
      const data = await response.json();
      
      if (data.success) {
        setBudgets(data.budgets);
      } else {
        setError('Erro ao carregar orçamentos');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar orçamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      property_name: '',
      state: '',
      city: '',
      vertices_count: 4,
      property_area: 1.0,
      client_type: 'pessoa_fisica',
      is_urgent: false,
      includes_topography: false,
      includes_environmental: false,
      additional_notes: ''
    });
  };

  const handleCreateBudget = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validação adicional
    if (!isFormValid()) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

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
        const errorData = await calculateResponse.json();
        throw new Error(errorData.detail || `Erro HTTP: ${calculateResponse.status}`);
      }

      const budgetResult = await calculateResponse.json();

      if (!budgetResult.success) {
        throw new Error(budgetResult.message || 'Erro ao calcular orçamento');
      }

      // Depois salva o orçamento
      const saveResponse = await fetch('/api/budgets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area)
        })
      });

      const saveResult = await saveResponse.json();

      if (saveResult.success) {
        const linkMessage = saveResult.custom_link ? 
          `Link automático: ${saveResult.custom_link}` : 
          `ID: ${saveResult.budget_id}`;
        setSuccess(`✅ Orçamento criado com sucesso! ${linkMessage}`);
        resetForm();
        setActiveView('list');
        loadBudgets();
      } else {
        throw new Error(saveResult.detail || 'Erro ao salvar orçamento');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBudget = async () => {
    if (!selectedBudget) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/budgets/${selectedBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Orçamento atualizado com sucesso!');
        setActiveView('list');
        loadBudgets();
      } else {
        throw new Error(result.detail || 'Erro ao atualizar orçamento');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Orçamento excluído com sucesso!');
        loadBudgets();
      } else {
        throw new Error(result.detail || 'Erro ao excluir orçamento');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomLink = async (budgetId, currentLink) => {
    const newCustomLink = prompt(
      `Link atual: ${currentLink}\n\nDigite um novo nome para o link personalizado (apenas letras, números, - e _):`,
      currentLink
    );
    if (!newCustomLink || newCustomLink === currentLink) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/${budgetId}/link`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_link: newCustomLink })
      });

      const result = await response.json();

      if (result.success) {
        const fullLink = `${window.location.origin}/budget/${result.custom_link}`;
        navigator.clipboard.writeText(fullLink);
        setSuccess(`Link atualizado e copiado: ${result.custom_link}`);
        loadBudgets();
      } else {
        throw new Error(result.detail || 'Erro ao atualizar link');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (customLink) => {
    const fullLink = `${window.location.origin}/budget/${customLink}`;
    navigator.clipboard.writeText(fullLink);
    setSuccess(`Link copiado: ${customLink}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.budget_request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.budget_request.property_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="card">
      <div style={{ marginBottom: '2rem' }}>
        <h2>🏢 Central de Orçamentos</h2>
        <p>Crie, edite e gerencie todos os seus orçamentos em um só lugar</p>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #e9ecef',
        paddingBottom: '1rem'
      }}>
        <button
          onClick={() => setActiveView('list')}
          style={{
            background: activeView === 'list' ? '#007bff' : 'transparent',
            color: activeView === 'list' ? 'white' : '#007bff',
            border: '2px solid #007bff',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          📋 Listar Orçamentos
        </button>
        <button
          onClick={() => {
            setActiveView('create');
            resetForm();
            setSelectedBudget(null);
          }}
          style={{
            background: activeView === 'create' ? '#28a745' : 'transparent',
            color: activeView === 'create' ? 'white' : '#28a745',
            border: '2px solid #28a745',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ➕ Criar Orçamento
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '1rem' 
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '1rem' 
        }}>
          ✅ {success}
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por cliente ou propriedade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              ⏳ Carregando orçamentos...
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              {searchTerm ? '🔍 Nenhum orçamento encontrado com esse termo' : '📝 Nenhum orçamento criado ainda'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredBudgets.map((budget) => (
                <div key={budget.id} style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
                        👤 {budget.budget_request.client_name}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        🏞️ {budget.budget_request.property_name} • {budget.budget_request.city}-{budget.budget_request.state}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745' }}>
                        💰 {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                        📅 {formatDate(budget.created_at)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#007bff', marginTop: '0.5rem' }}>
                        🔗 Link: {budget.custom_link || 'Não disponível'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedBudget(budget);
                          setFormData(budget.budget_request);
                          setActiveView('edit');
                        }}
                        style={{
                          background: '#ffc107',
                          color: 'black',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      
                      <button
                        onClick={() => handleCopyLink(budget.custom_link)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        📋 Copiar
                      </button>
                      
                      <button
                        onClick={() => handleEditCustomLink(budget.id, budget.custom_link)}
                        style={{
                          background: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        🔗 Editar Link
                      </button>
                      
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(activeView === 'create' || activeView === 'edit') && (
        <div>
          <h3>{activeView === 'create' ? '➕ Criar Novo Orçamento' : '✏️ Editar Orçamento'}</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <h4>👤 Dados do Cliente</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  placeholder="João Silva"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleInputChange}
                  placeholder="joao@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tipo de Cliente *</label>
                <select
                  name="client_type"
                  value={formData.client_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pessoa_fisica">Pessoa Física</option>
                  <option value="pessoa_juridica">Pessoa Jurídica</option>
                </select>
              </div>
            </div>

            <h4>🏞️ Dados da Propriedade</h4>
            <div className="form-group">
              <label>Nome da Propriedade *</label>
              <input
                type="text"
                name="property_name"
                value={formData.property_name}
                onChange={handleInputChange}
                placeholder="Fazenda São José"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Estado *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {brazilianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Cidade *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Número de Vértices *</label>
                <input
                  type="number"
                  name="vertices_count"
                  value={formData.vertices_count}
                  onChange={handleInputChange}
                  placeholder="4"
                  min="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Área Total (hectares) *</label>
                <input
                  type="number"
                  name="property_area"
                  value={formData.property_area}
                  onChange={handleInputChange}
                  placeholder="100.5"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>

            <h4>⚙️ Serviços Adicionais</h4>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="is_urgent"
                name="is_urgent"
                checked={formData.is_urgent}
                onChange={handleInputChange}
              />
              <label htmlFor="is_urgent">Serviço urgente (+R$ 300)</label>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="includes_topography"
                name="includes_topography"
                checked={formData.includes_topography}
                onChange={handleInputChange}
              />
              <label htmlFor="includes_topography">Levantamento topográfico (+R$ 800)</label>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="includes_environmental"
                name="includes_environmental"
                checked={formData.includes_environmental}
                onChange={handleInputChange}
              />
              <label htmlFor="includes_environmental">Estudo ambiental básico (+R$ 600)</label>
            </div>

            <div className="form-group">
              <label>Observações Adicionais</label>
              <textarea
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleInputChange}
                placeholder="Informações relevantes sobre o projeto..."
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={activeView === 'create' ? handleCreateBudget : handleEditBudget}
                disabled={!isFormValid() || isLoading}
                style={{
                  background: activeView === 'create' ? '#28a745' : '#ffc107',
                  color: activeView === 'create' ? 'white' : 'black',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '6px',
                  cursor: isFormValid() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: isFormValid() && !isLoading ? 1 : 0.6
                }}
              >
                {isLoading ? '⏳ Processando...' : (activeView === 'create' ? '💾 Criar Orçamento' : '💾 Salvar Alterações')}
              </button>
              
              <button
                onClick={() => setActiveView('list')}
                style={{
                  background: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #6c757d',
                  padding: '1rem 2rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetHub;