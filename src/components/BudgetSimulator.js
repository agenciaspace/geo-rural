import React, { useState } from 'react';
import axios from '../config/axios';
import API_ENDPOINTS from '../config/api';
import { db } from '../config/supabase';

const BudgetSimulator = () => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    property_name: '',
    state: '',
    city: '',
    vertices_count: '',
    property_area: '',
    client_type: 'pessoa_fisica',
    is_urgent: false,
    includes_topography: false,
    includes_environmental: false,
    additional_notes: ''
  });
  
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateBudget = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(API_ENDPOINTS.calculateBudget, {
        ...formData,
        vertices_count: parseInt(formData.vertices_count),
        property_area: parseFloat(formData.property_area)
      });
      
      setBudget(response.data);
      
      // Salvar orçamento no Supabase
      if (response.data.success) {
        const budgetData = {
          ...formData,
          vertices_count: parseInt(formData.vertices_count),
          property_area: parseFloat(formData.property_area),
          subtotal: response.data.budget.subtotal,
          discount_percentage: response.data.budget.discount_percentage,
          discount_amount: response.data.budget.discount_amount,
          urgency_fee: response.data.budget.urgency_fee,
          total: response.data.budget.total,
          status: 'draft'
        };

        const { error: dbError } = await db.budgets.create(budgetData);
        
        if (dbError) {
          console.error('Erro ao salvar orçamento no banco:', dbError);
        } else {
          console.log('Orçamento salvo com sucesso no Supabase');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao calcular orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.generatePdf, {
        ...formData,
        vertices_count: parseInt(formData.vertices_count),
        property_area: parseFloat(formData.property_area)
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proposta_${formData.client_name.replace(' ', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao gerar PDF');
    }
  };

  const saveBudget = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/budgets/save', {
        ...formData,
        vertices_count: parseInt(formData.vertices_count),
        property_area: parseFloat(formData.property_area)
      });
      
      if (response.data.success) {
        alert(`Orçamento salvo com sucesso! ID: ${response.data.budget_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar orçamento');
    } finally {
      setIsLoading(false);
    }
  };

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
      <h2>📊 Simulador de Orçamento</h2>
      <p>Preencha os dados abaixo para calcular o orçamento do serviço de georreferenciamento</p>
      
      <form onSubmit={(e) => { e.preventDefault(); calculateBudget(); }}>
        <h3>Dados do Cliente</h3>
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

        <h3>Dados do Imóvel</h3>
        <div className="form-group">
          <label>Nome do Imóvel *</label>
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

        <h3>Serviços Adicionais</h3>
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

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Calculando...' : 'Calcular Orçamento'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {budget && (
        <div className="budget-summary">
          <h3>💰 Orçamento Calculado</h3>
          
          <div className="price-display">
            R$ {budget.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <strong>Prazo estimado: {budget.estimated_days} dias úteis</strong>
          </div>

          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {budget.breakdown.map((item, index) => (
                <tr key={index}>
                  <td>{item.item}</td>
                  <td style={{ textAlign: 'right' }}>
                    {item.value < 0 ? '-' : ''}R$ {Math.abs(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>TOTAL</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <strong>R$ {budget.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="btn btn-primary"
              onClick={generatePDF}
              style={{ marginRight: '1rem' }}
            >
              📄 Gerar Proposta em PDF
            </button>
            <button 
              className="btn btn-primary"
              onClick={saveBudget}
              disabled={isLoading}
              style={{ background: '#28a745', borderColor: '#28a745' }}
            >
              {isLoading ? '💾 Salvando...' : '💾 Salvar Orçamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSimulator;