import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import BudgetItemsManager from './BudgetItemsManager';

const BudgetHub = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'view', 'resubmit'
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [successTimeout, setSuccessTimeout] = useState(null);
  const [errorTimeout, setErrorTimeout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const [newLinkValue, setNewLinkValue] = useState('');
  const [showItemsManager, setShowItemsManager] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  
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

  // Função para mostrar mensagem de sucesso com auto-dismiss
  const showSuccess = (message, duration = 4000) => {
    // Limpar timeout anterior se existir
    if (successTimeout) {
      clearTimeout(successTimeout);
    }
    
    setSuccess(message);
    const timeout = setTimeout(() => {
      setSuccess(null);
    }, duration);
    setSuccessTimeout(timeout);
  };

  // Função para mostrar mensagem de erro com auto-dismiss
  const showError = (message, duration = 6000) => {
    // Limpar timeout anterior se existir
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    
    setError(message);
    const timeout = setTimeout(() => {
      setError(null);
    }, duration);
    setErrorTimeout(timeout);
  };

  // Cleanup dos timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (successTimeout) clearTimeout(successTimeout);
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [successTimeout, errorTimeout]);

  useEffect(() => {
    if (activeView === 'list') {
      loadBudgets();
    }
    if (activeView === 'create') {
      loadClients();
      // Reset form when switching to create view
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
    }
    if (activeView === 'edit') {
      loadClients();
    }
  }, [activeView]);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('BudgetHub: Carregando orçamentos...');
      const { data, error: dbError } = await db.budgets.list();
      
      console.log('BudgetHub: Resultado da consulta de orçamentos:', { data, error: dbError });
      
      if (dbError) {
        console.error('BudgetHub: Erro ao carregar orçamentos:', dbError);
        showError('Erro ao carregar orçamentos: ' + dbError.message);
      } else {
        console.log('BudgetHub: Orçamentos carregados:', data || []);
        
        // Carregar contagem de itens para cada orçamento
        if (data && data.length > 0) {
          const budgetsWithItemCount = await Promise.all(
            data.map(async (budget) => {
              const { count } = await supabase
                .from('budget_items')
                .select('*', { count: 'exact', head: true })
                .eq('budget_id', budget.id);
              
              return {
                ...budget,
                items_count: count || 0
              };
            })
          );
          setBudgets(budgetsWithItemCount);
        } else {
          setBudgets(data || []);
        }
      }
    } catch (err) {
      console.error('BudgetHub: Erro de conexão:', err);
      showError('Erro de conexão ao carregar orçamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      console.log('Carregando clientes...');
      const { data, error: dbError } = await db.clients.list();
      
      if (dbError) {
        console.error('Erro ao carregar clientes:', dbError);
        showError('Erro ao carregar clientes: ' + dbError.message);
      } else {
        console.log('Clientes carregados:', data);
        setClients(data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      showError('Erro de conexão ao carregar clientes');
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
      const { data, error: dbError } = await db.clients.create(newClientData);
      
      if (dbError) {
        throw new Error(dbError.message || 'Erro ao criar cliente');
      }
      
      if (data && data.length > 0) {
        await loadClients();
        handleClientSelection(data[0].id);
        setUseExistingClient(true);
        setShowClientForm(false);
        showSuccess('✅ Cliente criado com sucesso!');
        
        // Reset new client form
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
      } else {
        throw new Error('Erro ao criar cliente - dados não retornados');
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
    console.log('BudgetHub: handleCreateBudget CHAMADA!');
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validação adicional
    if (!isFormValid()) {
      console.log('BudgetHub: Formulário inválido, parando aqui');
      showError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    try {
      console.log('BudgetHub: Iniciando criação de orçamento...');
      console.log('BudgetHub: Dados do formulário:', formData);
      
      // Primeiro calcula o orçamento
      console.log('BudgetHub: Calculando orçamento...');
      const calculateResponse = await fetch('/api/calculate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area)
        })
      });

      console.log('BudgetHub: Resposta do cálculo:', calculateResponse);

      if (!calculateResponse.ok) {
        const errorData = await calculateResponse.json();
        console.error('BudgetHub: Erro no cálculo:', errorData);
        throw new Error(errorData.detail || `Erro HTTP: ${calculateResponse.status}`);
      }

      const budgetResult = await calculateResponse.json();
      console.log('BudgetHub: Resultado do cálculo:', budgetResult);

      if (!budgetResult.success) {
        console.error('BudgetHub: Cálculo falhou:', budgetResult);
        throw new Error(budgetResult.message || 'Erro ao calcular orçamento');
      }

      // Se não tem client_id (cliente novo), criar cliente primeiro
      let clientId = formData.client_id;
      let isNewClient = false;
      
      if (!clientId && !useExistingClient) {
        console.log('BudgetHub: Criando novo cliente automaticamente...');
        
        const newClientData = {
          name: formData.client_name,
          email: formData.client_email,
          phone: formData.client_phone,
          client_type: formData.client_type,
          total_budgets: 0, // Inicializar com 0 para evitar duplicação
          total_spent: 0
        };
        
        const { data: createdClient, error: clientError } = await db.clients.create(newClientData);
        
        if (clientError) {
          console.error('BudgetHub: Erro ao criar cliente:', clientError);
          // Continua sem client_id se falhar
        } else if (createdClient && createdClient.length > 0) {
          clientId = createdClient[0].id;
          isNewClient = true;
          console.log('BudgetHub: Cliente criado com sucesso, ID:', clientId);
        }
      }

      // Depois salva o orçamento no Supabase
      const budgetData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        property_name: formData.property_name,
        state: formData.state,
        city: formData.city,
        vertices_count: parseInt(formData.vertices_count),
        property_area: parseFloat(formData.property_area),
        client_type: formData.client_type,
        is_urgent: formData.is_urgent,
        includes_topography: formData.includes_topography,
        includes_environmental: formData.includes_environmental,
        additional_notes: formData.additional_notes,
        total: budgetResult.total_price || budgetResult.total_cost,
        budget_request: {
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area)
        },
        budget_result: budgetResult,
        custom_link: `orcamento-${Date.now()}`, // Gerar link único
        status: 'active'
      };
      
      // Se tem client_id (existente ou recém criado), incluir no orçamento
      if (clientId) {
        budgetData.client_id = clientId;
      }
      
      console.log('BudgetHub: Salvando orçamento no Supabase:', budgetData);
      
      const { data: savedBudget, error: saveError } = await db.budgets.create(budgetData);
      
      if (saveError) {
        console.error('BudgetHub: Erro ao salvar orçamento:', saveError);
        throw new Error(saveError.message || 'Erro ao salvar orçamento');
      }
      
      console.log('BudgetHub: Orçamento salvo com sucesso:', savedBudget);
      
      // Se tem client_id, atualizar o total_spent do cliente
      if (clientId && savedBudget && savedBudget[0]) {
        console.log('BudgetHub: Atualizando total gasto do cliente...');
        
        // Para clientes novos, não precisamos buscar dados atuais
        if (isNewClient) {
          const budgetTotal = parseFloat(budgetData.total || 0);
          
          // Para cliente novo, total_budgets = 1 e total_spent = valor do primeiro orçamento
          const { error: updateError } = await db.clients.update(clientId, {
            total_spent: budgetTotal,
            total_budgets: 1,
            last_budget_date: new Date().toISOString()
          });
          
          if (updateError) {
            console.error('BudgetHub: Erro ao atualizar totais do cliente novo:', updateError);
          } else {
            console.log('BudgetHub: Totais do cliente novo atualizados com sucesso');
          }
        } else {
          // Para cliente existente, buscar dados atuais
          const { data: currentClient, error: getClientError } = await db.clients.getById(clientId);
          
          if (!getClientError && currentClient) {
            const currentTotal = parseFloat(currentClient.total_spent || 0);
            const budgetTotal = parseFloat(budgetData.total || 0);
            const newTotal = currentTotal + budgetTotal;
            
            // Atualizar o cliente com o novo total e incrementar total_budgets
            const { error: updateError } = await db.clients.update(clientId, {
              total_spent: newTotal,
              total_budgets: (currentClient.total_budgets || 0) + 1,
              last_budget_date: new Date().toISOString()
            });
            
            if (updateError) {
              console.error('BudgetHub: Erro ao atualizar totais do cliente:', updateError);
            } else {
              console.log('BudgetHub: Totais do cliente atualizados com sucesso');
            }
          }
        }
      }
      
      const linkMessage = budgetData.custom_link ? 
        `Link automático: ${budgetData.custom_link}` : 
        `ID: ${savedBudget[0]?.id || 'novo'}`;
      showSuccess(`✅ Orçamento criado com sucesso! ${linkMessage}`);
      
      // Abrir o gerenciador de itens para o orçamento recém-criado
      if (savedBudget && savedBudget[0] && savedBudget[0].id) {
        setCurrentBudgetId(savedBudget[0].id);
        setShowItemsManager(true);
        resetForm();
        setActiveView('list');
        loadBudgets();
      } else {
        resetForm();
        setActiveView('list');
        loadBudgets();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBudget = async () => {
    if (!selectedBudget) return;

    setIsLoading(true);
    setError(null);

    try {
      // Preparar dados para atualização
      const budgetRequestData = {
        ...formData,
        vertices_count: parseInt(formData.vertices_count) || 4,
        property_area: parseFloat(formData.property_area) || 1.0
      };

      // Usar o método update do Supabase
      const { data, error } = await db.budgets.update(selectedBudget.id, budgetRequestData);

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar orçamento');
      }

      showSuccess('Orçamento atualizado com sucesso!');
      setActiveView('list');
      loadBudgets();
    } catch (err) {
      showError('Erro ao atualizar orçamento: ' + err.message);
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
        showSuccess('Orçamento excluído com sucesso!');
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
        showSuccess(`✅ Link atualizado e copiado: ${result.custom_link}`);
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
        showSuccess('✅ Orçamento reenviado com sucesso! O cliente receberá a nova proposta.');
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
    showSuccess(`📋 Link copiado: ${customLink}`, 3000); // 3 segundos
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
    budget.budget_request && budget.budget_request.client_name && 
    budget.budget_request.property_name &&
    (budget.budget_request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.budget_request.property_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug logs
  console.log('BudgetHub: Estado atual da lista:', {
    budgets,
    filteredBudgets,
    searchTerm,
    isLoading,
    activeView
  });

  const isFormValid = () => {
    const hasClientData = useExistingClient ? 
      formData.client_id : 
      (formData.client_name && formData.client_email);
      
    const isValid = hasClientData &&
           formData.property_name && 
           formData.state && 
           formData.city && 
           formData.vertices_count && 
           formData.property_area;
    
    console.log('BudgetHub: Validação do formulário:', {
      useExistingClient,
      hasClientData,
      client_id: formData.client_id,
      client_name: formData.client_name,
      client_email: formData.client_email,
      property_name: formData.property_name,
      state: formData.state,
      city: formData.city,
      vertices_count: formData.vertices_count,
      property_area: formData.property_area,
      isValid
    });
    
    return isValid;
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
            background: activeView === 'list' ? '#333' : 'transparent',
            color: activeView === 'list' ? 'white' : '#333',
            border: '1px solid #333',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
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
            background: activeView === 'create' ? '#333' : 'transparent',
            color: activeView === 'create' ? 'white' : '#333',
            border: '1px solid #333',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ➕ Criar Orçamento
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ 
          background: '#f5f5f5', 
          color: '#666', 
          padding: '1rem', 
          borderRadius: '4px', 
          marginBottom: '1rem',
          border: '1px solid #ddd'
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ 
          background: '#f9f9f9', 
          color: '#333', 
          padding: '1rem', 
          borderRadius: '4px', 
          marginBottom: '1rem',
          border: '1px solid #ccc'
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
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  navigate(`/app/budgets/${budget.id}`);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e9ecef';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
                        👤 {budget.budget_request.client_name}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        🏞️ {budget.budget_request.property_name} • {budget.budget_request.city}-{budget.budget_request.state}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745' }}>
                        💰 {formatCurrency(budget.total_price || budget.budget_result?.total_price || budget.budget_result?.total_cost || budget.total)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                        📅 {formatDate(budget.created_at)}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '15px', 
                        alignItems: 'center',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ fontSize: '0.8rem', color: '#007bff' }}>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveCustomLink(budget.id);
                              }}
                              disabled={isLoading}
                              style={{
                                background: '#333',
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
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditingLink();
                              }}
                              disabled={isLoading}
                              style={{
                                background: 'transparent',
                                color: '#666',
                                border: '1px solid #ddd',
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
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/budgets/${budget.id}`);
                        }}
                        style={{
                          background: '#333',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          minWidth: '120px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#555';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#333';
                        }}
                      >
                        📄 Ver Detalhes
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBudgetId(budget.id);
                          setShowItemsManager(true);
                        }}
                        style={{
                          background: '#1a5f3f',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease',
                          fontWeight: 'bold',
                          minWidth: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2a7f5f';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#1a5f3f';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        📋 Itens {budget.items_count > 0 && <span style={{
                          background: 'rgba(255,255,255,0.3)',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '11px'
                        }}>({budget.items_count})</span>}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBudget(budget);
                          setFormData(budget.budget_request);
                          setActiveView('edit');
                        }}
                        style={{
                          background: 'transparent',
                          color: '#666',
                          border: '1px solid #ddd',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f5f5f5';
                          e.target.style.borderColor = '#bbb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        ✏️ Editar
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(budget.custom_link);
                        }}
                        style={{
                          background: 'transparent',
                          color: '#666',
                          border: '1px solid #ddd',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f5f5f5';
                          e.target.style.borderColor = '#bbb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        📋 Copiar
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingLink(budget.id, budget.custom_link);
                        }}
                        disabled={editingLink === budget.id || isLoading}
                        style={{
                          background: 'transparent',
                          color: '#666',
                          border: '1px solid #ddd',
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
                            background: 'transparent',
                            color: '#666',
                            border: '1px solid #ddd',
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBudget(budget.id);
                        }}
                        style={{
                          background: 'transparent',
                          color: '#999',
                          border: '1px solid #ddd',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f5f5f5';
                          e.target.style.color = '#666';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#999';
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
              background: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
                📋 Reenvio de Orçamento
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Você está reenviando um orçamento rejeitado. Faça os ajustes necessários nos dados abaixo 
                e clique em "Reenviar Orçamento" para submeter uma nova versão ao cliente.
              </div>
              {selectedBudget?.rejection_comment && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#666'
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
              background: '#fafafa', 
              padding: '1rem', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
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
                      background: '#f5f5f5', 
                      padding: '0.75rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      border: '1px solid #ddd'
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
                      background: '#333',
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
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
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
                  background: '#333',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '4px',
                  cursor: isFormValid() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '500',
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
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '1rem 2rem',
                  borderRadius: '4px',
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

      {/* Modal para gerenciar itens do orçamento */}
      {showItemsManager && currentBudgetId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowItemsManager(false);
                setCurrentBudgetId(null);
                loadBudgets(); // Recarregar orçamentos para atualizar totais
              }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ color: '#1a5f3f', marginBottom: '1rem' }}>
              Detalhamento do Orçamento
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              Adicione itens detalhados como insumos, deslocamento, hospedagem e outros custos para criar um orçamento mais completo.
            </p>
            
            {budgets.find(b => b.id === currentBudgetId) && (
              <div style={{
                background: '#f9f9f9',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0' }}>
                  Cliente: {budgets.find(b => b.id === currentBudgetId).client_name}
                </h4>
                <p style={{ margin: 0, color: '#666' }}>
                  Propriedade: {budgets.find(b => b.id === currentBudgetId).property_name || 'Não informada'}
                </p>
              </div>
            )}
            
            <BudgetItemsManager 
              budgetId={currentBudgetId}
              onTotalChange={(total) => {
                // Atualizar o total no estado local se necessário
                console.log('Novo total:', total);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetHub;