import React, { useState, useEffect } from 'react';
import { db } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const BudgetHub = () => {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'view', 'resubmit'
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const [newLinkValue, setNewLinkValue] = useState('');
  
  // Cliente management states
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [useExistingClient, setUseExistingClient] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);

  // Form data para criação/edição
  const [formData, setFormData] = useState({
    client_id: '',
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
  
  // Form data para novo cliente
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    client_type: 'pessoa_fisica',
    document: '',
    company_name: '',
    address: {
      street: '',
      number: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Brasil'
    },
    notes: ''
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
    if (activeView === 'create' || activeView === 'edit') {
      loadClients();
    }
  }, [activeView]);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: dbError } = await db.budgets.list();
      
      if (dbError) {
        setError('Erro ao carregar orçamentos: ' + dbError.message);
      } else {
        setBudgets(data || []);
      }
    } catch (err) {
      setError('Erro de conexão ao carregar orçamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error: dbError } = await db.clients.list();
      
      if (dbError) {
        console.error('Erro ao carregar clientes:', dbError);
      } else {
        setClients(data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setNewClientData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setNewClientData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleClientSelection = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setFormData(prev => ({
        ...prev,
        client_id: client.id,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone || '',
        client_type: client.client_type || 'pessoa_fisica'
      }));
    } else {
      setSelectedClient(null);
      setFormData(prev => ({
        ...prev,
        client_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        client_type: 'pessoa_fisica'
      }));
    }
  };

  const handleCreateNewClient = async () => {
    setIsLoading(true);
    setError(null);
    
    if (!newClientData.name || !newClientData.email) {
      setError('Nome e email do cliente são obrigatórios');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadClients();
        handleClientSelection(result.client.id);
        setUseExistingClient(true);
        setShowClientForm(false);
        setSuccess('✅ Cliente criado com sucesso!');
      } else {
        throw new Error(result.detail || 'Erro ao criar cliente');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
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
    setSelectedClient(null);
    setUseExistingClient(false);
    setShowClientForm(false);
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      client_type: 'pessoa_fisica',
      document: '',
      company_name: '',
      address: {
        street: '',
        number: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Brasil'
      },
      notes: ''
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
      const budgetData = {
        ...formData,
        vertices_count: parseInt(formData.vertices_count),
        property_area: parseFloat(formData.property_area)
      };
      
      // Se tem client_id, incluir no orçamento
      if (formData.client_id) {
        budgetData.client_id = formData.client_id;
      }
      
      const saveResponse = await fetch('/api/budgets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
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

  const startEditingLink = (budgetId, currentLink) => {
    setEditingLink(budgetId);
    setNewLinkValue(currentLink);
    setError(null);
  };

  const cancelEditingLink = () => {
    setEditingLink(null);
    setNewLinkValue('');
    setError(null);
  };

  const handleSaveCustomLink = async (budgetId) => {
    if (!newLinkValue.trim() || newLinkValue === budgets.find(b => b.id === budgetId)?.custom_link) {
      cancelEditingLink();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/${budgetId}/link`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_link: newLinkValue.trim() })
      });

      const result = await response.json();

      if (result.success) {
        const fullLink = `${window.location.origin}/budget/${result.custom_link}`;
        navigator.clipboard.writeText(fullLink);
        setSuccess(`✅ Link atualizado e copiado: ${result.custom_link}`);
        loadBudgets();
        cancelEditingLink();
      } else {
        throw new Error(result.detail || 'Erro ao atualizar link');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubmitBudget = async () => {
    if (!selectedBudget) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/budgets/link/${selectedBudget.custom_link}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area)
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Orçamento reenviado com sucesso! O cliente receberá a nova proposta.');
        setActiveView('list');
        loadBudgets();
      } else {
        throw new Error(result.detail || 'Erro ao reenviar orçamento');
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
    const hasClientData = useExistingClient ? 
      formData.client_id : 
      (formData.client_name && formData.client_email);
      
    return hasClientData &&
           formData.property_name && 
           formData.state && 
           formData.city && 
           formData.vertices_count && 
           formData.property_area;
  };

  const isNewClientFormValid = () => {
    return newClientData.name && newClientData.email;
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
                        {editingLink === budget.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span>🔗 Link:</span>
                            <input
                              type="text"
                              value={newLinkValue}
                              onChange={(e) => setNewLinkValue(e.target.value)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid #007bff',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                width: '200px'
                              }}
                              placeholder="orcamento-personalizado"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveCustomLink(budget.id)}
                              disabled={isLoading}
                              style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✅
                            </button>
                            <button
                              onClick={cancelEditingLink}
                              disabled={isLoading}
                              style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
                            >
                              ❌
                            </button>
                          </div>
                        ) : (
                          <span>🔗 Link: {budget.custom_link || 'Não disponível'}</span>
                        )}
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
                        onClick={() => startEditingLink(budget.id, budget.custom_link)}
                        disabled={editingLink === budget.id || isLoading}
                        style={{
                          background: editingLink === budget.id ? '#6c757d' : '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: (editingLink === budget.id || isLoading) ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          opacity: (editingLink === budget.id || isLoading) ? 0.6 : 1
                        }}
                      >
                        🔗 Editar Link
                      </button>
                      
                      {budget.status === 'rejected' && (
                        <button
                          onClick={() => {
                            setSelectedBudget(budget);
                            setFormData(budget.budget_request);
                            setActiveView('resubmit');
                          }}
                          style={{
                            background: '#fd7e14',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          🔄 Reenviar
                        </button>
                      )}
                      
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

      {/* Create/Edit/Resubmit Form */}
      {(activeView === 'create' || activeView === 'edit' || activeView === 'resubmit') && (
        <div>
          <h3>
            {activeView === 'create' ? '➕ Criar Novo Orçamento' : 
             activeView === 'edit' ? '✏️ Editar Orçamento' : 
             '🔄 Reenviar Orçamento Rejeitado'}
          </h3>
          
          {activeView === 'resubmit' && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '0.5rem' }}>
                📋 Reenvio de Orçamento
              </div>
              <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                Você está reenviando um orçamento rejeitado. Faça os ajustes necessários nos dados abaixo 
                e clique em "Reenviar Orçamento" para submeter uma nova versão ao cliente.
              </div>
              {selectedBudget?.rejection_comment && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#f8d7da',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#721c24'
                }}>
                  <strong>Motivo da rejeição anterior:</strong> "{selectedBudget.rejection_comment}"
                </div>
              )}
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <h4>👤 Seleção de Cliente</h4>
            
            {/* Client Selection Type */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Como deseja informar o cliente?
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={useExistingClient}
                      onChange={() => {
                        setUseExistingClient(true);
                        setShowClientForm(false);
                      }}
                      style={{ marginRight: '0.5rem' }}
                    />
                    👥 Selecionar cliente existente
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!useExistingClient}
                      onChange={() => {
                        setUseExistingClient(false);
                        setSelectedClient(null);
                        handleClientSelection('');
                      }}
                      style={{ marginRight: '0.5rem' }}
                    />
                    ✏️ Inserir dados manualmente
                  </label>
                </div>
              </div>
              
              {useExistingClient && (
                <div>
                  <div className="form-group">
                    <label>Selecionar Cliente *</label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => handleClientSelection(e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                    >
                      <option value="">Selecione um cliente...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedClient && (
                    <div style={{ 
                      background: '#e7f3ff', 
                      padding: '0.75rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem'
                    }}>
                      <strong>Cliente selecionado:</strong><br/>
                      📧 {selectedClient.email}<br/>
                      {selectedClient.phone && <span>📞 {selectedClient.phone}<br/></span>}
                      📊 {selectedClient.total_budgets || 0} orçamento(s) anteriores
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowClientForm(true)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ➕ Criar novo cliente
                  </button>
                </div>
              )}
              
              {!useExistingClient && (
                <div>
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
                      <label>Telefone</label>
                      <input
                        type="tel"
                        name="client_phone"
                        value={formData.client_phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Tipo de Cliente</label>
                      <select
                        name="client_type"
                        value={formData.client_type}
                        onChange={handleInputChange}
                      >
                        <option value="pessoa_fisica">Pessoa Física</option>
                        <option value="pessoa_juridica">Pessoa Jurídica</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* New Client Form Modal */}
            {showClientForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}>
                  <h3>➕ Criar Novo Cliente</h3>
                  
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nome Completo *</label>
                        <input
                          type="text"
                          name="name"
                          value={newClientData.name}
                          onChange={handleNewClientInputChange}
                          placeholder="João da Silva"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>E-mail *</label>
                        <input
                          type="email"
                          name="email"
                          value={newClientData.email}
                          onChange={handleNewClientInputChange}
                          placeholder="joao@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Telefone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={newClientData.phone}
                          onChange={handleNewClientInputChange}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Tipo de Cliente</label>
                        <select
                          name="client_type"
                          value={newClientData.client_type}
                          onChange={handleNewClientInputChange}
                        >
                          <option value="pessoa_fisica">Pessoa Física</option>
                          <option value="pessoa_juridica">Pessoa Jurídica</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Observações</label>
                      <textarea
                        name="notes"
                        value={newClientData.notes}
                        onChange={handleNewClientInputChange}
                        placeholder="Informações sobre o cliente..."
                        rows="2"
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                      onClick={handleCreateNewClient}
                      disabled={!isNewClientFormValid() || isLoading}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: isNewClientFormValid() && !isLoading ? 'pointer' : 'not-allowed',
                        opacity: isNewClientFormValid() && !isLoading ? 1 : 0.6
                      }}
                    >
                      {isLoading ? '⏳ Criando...' : '💾 Criar Cliente'}
                    </button>
                    
                    <button
                      onClick={() => setShowClientForm(false)}
                      style={{
                        background: 'transparent',
                        color: '#6c757d',
                        border: '2px solid #6c757d',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                onClick={
                  activeView === 'create' ? handleCreateBudget :
                  activeView === 'edit' ? handleEditBudget :
                  handleResubmitBudget
                }
                disabled={!isFormValid() || isLoading}
                style={{
                  background: 
                    activeView === 'create' ? '#28a745' :
                    activeView === 'edit' ? '#ffc107' :
                    '#fd7e14',
                  color: activeView === 'edit' ? 'black' : 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '6px',
                  cursor: isFormValid() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: isFormValid() && !isLoading ? 1 : 0.6
                }}
              >
                {isLoading ? '⏳ Processando...' : 
                 activeView === 'create' ? '💾 Criar Orçamento' :
                 activeView === 'edit' ? '💾 Salvar Alterações' :
                 '🔄 Reenviar Orçamento'}
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