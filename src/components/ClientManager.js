import React, { useState, useEffect } from 'react';
import { db } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const ClientManager = () => {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form data para criação/edição
  const [formData, setFormData] = useState({
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
    notes: '',
    secondary_phone: '',
    website: ''
  });

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    if (activeView === 'list') {
      loadClients();
    }
  }, [activeView]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('ClientManager: Carregando clientes...');
      const { data, error: dbError } = await db.clients.list();
      
      console.log('ClientManager: Resultado da consulta:', { data, error: dbError });
      
      if (dbError) {
        console.error('ClientManager: Erro ao carregar clientes:', dbError);
        setError('Erro ao carregar clientes: ' + dbError.message);
      } else {
        console.log('ClientManager: Clientes carregados:', data || []);
        setClients(data || []);
      }
    } catch (err) {
      console.error('ClientManager: Erro de conexão:', err);
      setError('Erro de conexão ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
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
      notes: '',
      secondary_phone: '',
      website: ''
    });
  };

  const handleCreateClient = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validação básica
    if (!formData.name || !formData.email) {
      setError('Nome e email são obrigatórios');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await db.clients.create(formData);
      
      if (dbError) {
        throw new Error(dbError.message || 'Erro ao criar cliente');
      }
      
      if (data && data.length > 0) {
        setSuccess('✅ Cliente criado com sucesso!');
        resetForm();
        setActiveView('list');
        loadClients();
      } else {
        throw new Error('Erro ao criar cliente - dados não retornados');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await db.clients.update(selectedClient.id, formData);
      
      if (dbError) {
        throw new Error(dbError.message || 'Erro ao atualizar cliente');
      }
      
      setSuccess('Cliente atualizado com sucesso!');
      setActiveView('list');
      loadClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja remover este cliente?')) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Para deletar, vamos marcar como inativo em vez de deletar fisicamente
      const { data, error: dbError } = await db.clients.update(clientId, { is_active: false });
      
      if (dbError) {
        throw new Error(dbError.message || 'Erro ao remover cliente');
      }
      
      setSuccess('Cliente removido com sucesso!');
      loadClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditClient = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      client_type: client.client_type || 'pessoa_fisica',
      document: client.document || '',
      company_name: client.company_name || '',
      address: client.address || {
        street: '',
        number: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Brasil'
      },
      notes: client.notes || '',
      secondary_phone: client.secondary_phone || '',
      website: client.website || ''
    });
    setActiveView('edit');
  };

  const formatClientType = (type) => {
    return type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug logs
  console.log('ClientManager: Estado atual:', {
    clients,
    filteredClients,
    searchTerm,
    isLoading,
    activeView
  });

  const isFormValid = () => {
    return formData.name && formData.email;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '2rem' }}>
        <h2>👥 Gestão de Clientes</h2>
        <p>Gerencie sua base de clientes de forma centralizada</p>
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
          📋 Listar Clientes
        </button>
        <button
          onClick={() => {
            setActiveView('create');
            resetForm();
            setSelectedClient(null);
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
          ➕ Novo Cliente
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
              placeholder="🔍 Buscar por nome, email ou empresa..."
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
              ⏳ Carregando clientes...
            </div>
          ) : filteredClients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              {searchTerm ? '🔍 Nenhum cliente encontrado com esse termo' : '👥 Nenhum cliente cadastrado ainda'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredClients.map((client) => (
                <div key={client.id} style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
                        👤 {client.name}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        📧 {client.email}
                      </div>
                      {client.phone && (
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          📞 {client.phone}
                        </div>
                      )}
                      {client.company_name && (
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          🏢 {client.company_name}
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                        📅 Cadastrado em {formatDate(client.created_at)} • {formatClientType(client.client_type)}
                      </div>
                      {client.total_budgets > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.5rem' }}>
                          💰 {client.total_budgets} orçamento(s) • Total: R$ {client.total_spent?.toFixed(2) || '0.00'}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => startEditClient(client)}
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
                        onClick={() => handleDeleteClient(client.id)}
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
                        🗑️ Remover
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
          <h3>{activeView === 'create' ? '➕ Novo Cliente' : '✏️ Editar Cliente'}</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <h4>👤 Dados Básicos</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João da Silva"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="joao@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Telefone Principal</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="form-group">
                <label>Telefone Secundário</label>
                <input
                  type="tel"
                  name="secondary_phone"
                  value={formData.secondary_phone}
                  onChange={handleInputChange}
                  placeholder="(11) 88888-8888"
                />
              </div>
            </div>

            <div className="form-row">
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
              
              <div className="form-group">
                <label>{formData.client_type === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</label>
                <input
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={handleInputChange}
                  placeholder={formData.client_type === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </div>
            </div>

            {formData.client_type === 'pessoa_juridica' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Nome da Empresa</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Empresa Ltda"
                  />
                </div>
                
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.empresa.com.br"
                  />
                </div>
              </div>
            )}

            <h4>📍 Endereço</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Logradouro</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Rua das Flores"
                />
              </div>
              
              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  name="address.number"
                  value={formData.address.number}
                  onChange={handleInputChange}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                />
              </div>
              
              <div className="form-group">
                <label>Estado</label>
                <select
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione...</option>
                  {brazilianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  name="address.zip_code"
                  value={formData.address.zip_code}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <h4>📝 Observações</h4>
            <div className="form-group">
              <label>Notas sobre o cliente</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Informações relevantes sobre o cliente..."
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={activeView === 'create' ? handleCreateClient : handleEditClient}
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
                {isLoading ? '⏳ Processando...' : (activeView === 'create' ? '💾 Criar Cliente' : '💾 Salvar Alterações')}
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

export default ClientManager;