import React, { useState, useEffect } from 'react';

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customLink, setCustomLink] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para o formulário de edição
  const [editForm, setEditForm] = useState({
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

  useEffect(() => {
    loadBudgets();
  }, []);

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

  const handleSelectBudget = (budget) => {
    setSelectedBudget(budget);
    setEditForm(budget.budget_request);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleEditBudget = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleSaveBudget = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/${selectedBudget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Orçamento atualizado com sucesso!');
        setIsEditing(false);
        await loadBudgets();
        
        // Atualiza o orçamento selecionado
        const updatedBudget = { ...selectedBudget };
        updatedBudget.budget_request = editForm;
        updatedBudget.budget_result = data.budget_result;
        setSelectedBudget(updatedBudget);
      } else {
        setError('Erro ao atualizar orçamento');
      }
    } catch (err) {
      setError('Erro de conexão ao salvar orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Orçamento excluído com sucesso!');
        await loadBudgets();
        if (selectedBudget && selectedBudget.id === budgetId) {
          setSelectedBudget(null);
        }
      } else {
        setError('Erro ao excluir orçamento');
      }
    } catch (err) {
      setError('Erro de conexão ao excluir orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCustomLink = async () => {
    if (!customLink.trim()) {
      setError('Digite um link personalizado');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/budgets/${selectedBudget.id}/link?custom_link=${encodeURIComponent(customLink)}`, {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Link personalizado criado: ${data.custom_link}`);
        setShowLinkModal(false);
        setCustomLink('');
        
        // Atualiza o orçamento selecionado
        const updatedBudget = { ...selectedBudget };
        updatedBudget.custom_link = data.custom_link;
        setSelectedBudget(updatedBudget);
        
        await loadBudgets();
      } else {
        setError(data.detail || 'Erro ao criar link personalizado');
      }
    } catch (err) {
      setError('Erro de conexão ao criar link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
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

  const copyLinkToClipboard = (link) => {
    const fullUrl = `${window.location.origin}/budget/${link}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setSuccess('Link copiado para a área de transferência!');
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gerenciador de Orçamentos</h2>
      
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '1rem' 
        }}>
          {error}
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
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Lista de Orçamentos */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Orçamentos Salvos</h3>
            <button
              onClick={loadBudgets}
              disabled={isLoading}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? '⏳ Carregando...' : '🔄 Atualizar'}
            </button>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {budgets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhum orçamento salvo</p>
            ) : (
              budgets.map((budget) => (
                <div
                  key={budget.id}
                  onClick={() => handleSelectBudget(budget)}
                  style={{
                    border: selectedBudget?.id === budget.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    background: selectedBudget?.id === budget.id ? '#f8f9fa' : 'white'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    {budget.budget_request.client_name} - {budget.budget_request.property_name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {formatCurrency(budget.budget_result.total_price || budget.budget_result.total_cost)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    Criado: {formatDate(budget.created_at)}
                  </div>
                  {budget.custom_link && (
                    <div style={{ fontSize: '0.8rem', color: '#007bff' }}>
                      🔗 Link: {budget.custom_link}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detalhes do Orçamento */}
        <div>
          {!selectedBudget ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
              <h3>Selecione um orçamento para visualizar</h3>
              <p>Clique em um orçamento da lista ao lado para ver os detalhes e opções de edição.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Detalhes do Orçamento</h3>
                <div>
                  <button
                    onClick={handleEditBudget}
                    disabled={isLoading || isEditing}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => setShowLinkModal(true)}
                    disabled={isLoading}
                    style={{
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    🔗 Link
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(selectedBudget.id)}
                    disabled={isLoading}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>

              {/* Link personalizado */}
              {selectedBudget.custom_link && (
                <div style={{
                  background: '#e3f2fd',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <strong>Link Personalizado:</strong>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                    <code style={{ background: 'white', padding: '0.5rem', borderRadius: '4px', flex: 1 }}>
                      {window.location.origin}/budget/{selectedBudget.custom_link}
                    </code>
                    <button
                      onClick={() => copyLinkToClipboard(selectedBudget.custom_link)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginLeft: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* Formulário de edição */}
              {isEditing ? (
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
                  <h4>Editando Orçamento</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label>Nome do Cliente:</label>
                      <input
                        type="text"
                        name="client_name"
                        value={editForm.client_name}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Email:</label>
                      <input
                        type="email"
                        name="client_email"
                        value={editForm.client_email}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Telefone:</label>
                      <input
                        type="text"
                        name="client_phone"
                        value={editForm.client_phone}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Nome da Propriedade:</label>
                      <input
                        type="text"
                        name="property_name"
                        value={editForm.property_name}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Estado:</label>
                      <input
                        type="text"
                        name="state"
                        value={editForm.state}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Cidade:</label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.city}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Número de Vértices:</label>
                      <input
                        type="number"
                        name="vertices_count"
                        value={editForm.vertices_count}
                        onChange={handleInputChange}
                        min="3"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label>Área (hectares):</label>
                      <input
                        type="number"
                        name="property_area"
                        value={editForm.property_area}
                        onChange={handleInputChange}
                        min="0.1"
                        step="0.1"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Tipo de Cliente:</label>
                    <select
                      name="client_type"
                      value={editForm.client_type}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="pessoa_fisica">Pessoa Física</option>
                      <option value="pessoa_juridica">Pessoa Jurídica</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                    <label>
                      <input
                        type="checkbox"
                        name="is_urgent"
                        checked={editForm.is_urgent}
                        onChange={handleInputChange}
                      />
                      {' '}Urgente
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="includes_topography"
                        checked={editForm.includes_topography}
                        onChange={handleInputChange}
                      />
                      {' '}Inclui Topografia
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="includes_environmental"
                        checked={editForm.includes_environmental}
                        onChange={handleInputChange}
                      />
                      {' '}Inclui Estudo Ambiental
                    </label>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Observações Adicionais:</label>
                    <textarea
                      name="additional_notes"
                      value={editForm.additional_notes}
                      onChange={handleInputChange}
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>

                  <div>
                    <button
                      onClick={handleSaveBudget}
                      disabled={isLoading}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      {isLoading ? '⏳ Salvando...' : '💾 Salvar Alterações'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(selectedBudget.budget_request);
                      }}
                      disabled={isLoading}
                      style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Visualização dos dados */
                <div>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h4>Informações do Cliente</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><strong>Nome:</strong> {selectedBudget.budget_request.client_name}</div>
                      <div><strong>Email:</strong> {selectedBudget.budget_request.client_email}</div>
                      <div><strong>Telefone:</strong> {selectedBudget.budget_request.client_phone}</div>
                      <div><strong>Tipo:</strong> {selectedBudget.budget_request.client_type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</div>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '1rem' }}>
                    <h4>Dados da Propriedade</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><strong>Nome:</strong> {selectedBudget.budget_request.property_name}</div>
                      <div><strong>Localização:</strong> {selectedBudget.budget_request.city} - {selectedBudget.budget_request.state}</div>
                      <div><strong>Área:</strong> {selectedBudget.budget_request.property_area} hectares</div>
                      <div><strong>Vértices:</strong> {selectedBudget.budget_request.vertices_count}</div>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '1rem' }}>
                    <h4>Orçamento</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                      {formatCurrency(selectedBudget.budget_result.total_price || selectedBudget.budget_result.total_cost)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      Atualizado: {formatDate(selectedBudget.updated_at)}
                    </div>
                  </div>

                  {selectedBudget.budget_request.additional_notes && (
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '1rem' }}>
                      <h4>Observações</h4>
                      <p>{selectedBudget.budget_request.additional_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Link Personalizado */}
      {showLinkModal && (
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
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Criar Link Personalizado</h3>
            <p>Digite um nome para o link personalizado (apenas letras, números, - e _):</p>
            <input
              type="text"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              placeholder="meu-orcamento-2024"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '1rem'
              }}
            />
            <div>
              <button
                onClick={handleSetCustomLink}
                disabled={isLoading || !customLink.trim()}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginRight: '0.5rem'
                }}
              >
                {isLoading ? '⏳ Criando...' : '🔗 Criar Link'}
              </button>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setCustomLink('');
                }}
                disabled={isLoading}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
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
    </div>
  );
};

export default BudgetManager;