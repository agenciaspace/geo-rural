import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const BudgetItemsManager = ({ budgetId, onTotalChange }) => {
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    item_type: 'servico_geo',
    description: '',
    quantity: 1,
    unit: '',
    unit_price: 0,
    notes: ''
  });

  const itemTypeLabels = {
    'servico_geo': 'Serviço de Georreferenciamento',
    'insumo': 'Insumo/Material',
    'deslocamento': 'Deslocamento',
    'hospedagem': 'Hospedagem',
    'alimentacao': 'Alimentação',
    'outros': 'Outros'
  };

  const itemTypeColors = {
    'servico_geo': '#1a5f3f',
    'insumo': '#ff6b35',
    'deslocamento': '#4ecdc4',
    'hospedagem': '#45b7d1',
    'alimentacao': '#f9ca24',
    'outros': '#95a5a6'
  };

  useEffect(() => {
    if (budgetId) {
      loadItems();
      loadTemplates();
    }
  }, [budgetId]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
      
      // Calcular e notificar o total
      const total = (data || []).reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
      if (onTotalChange) onTotalChange(total);
    } catch (err) {
      setError('Erro ao carregar itens: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_item_templates')
        .select('*')
        .eq('is_active', true)
        .order('item_type, description');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      item_type: template.item_type,
      description: template.description,
      quantity: 1,
      unit: template.unit || '',
      unit_price: template.unit_price || 0,
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        budget_id: budgetId
      };

      if (editingItem) {
        const { error } = await supabase
          .from('budget_items')
          .update(dataToSave)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budget_items')
          .insert([dataToSave]);

        if (error) throw error;
      }

      resetForm();
      loadItems();
    } catch (err) {
      setError('Erro ao salvar item: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_type: item.item_type,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || '',
      unit_price: item.unit_price,
      notes: item.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Deseja realmente excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      loadItems();
    } catch (err) {
      setError('Erro ao excluir item: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      item_type: 'servico_geo',
      description: '',
      quantity: 1,
      unit: '',
      unit_price: 0,
      notes: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {});

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  };

  if (isLoading) return <div>Carregando itens...</div>;

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#1a5f3f', margin: 0 }}>Itens do Orçamento</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '8px 16px',
            background: '#1a5f3f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Item'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {showAddForm && (
        <div style={{
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginTop: 0 }}>
            {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
          </h4>

          {/* Templates rápidos */}
          {!editingItem && templates.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Templates Rápidos:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    style={{
                      padding: '6px 12px',
                      background: itemTypeColors[template.item_type] + '20',
                      color: itemTypeColors[template.item_type],
                      border: `1px solid ${itemTypeColors[template.item_type]}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {template.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo
                </label>
                <select
                  name="item_type"
                  value={formData.item_type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  {Object.entries(itemTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Descrição
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Quantidade
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Unidade
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="ex: ha, km, diária"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Valor Unitário (R$)
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Total
                </label>
                <div style={{
                  padding: '8px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {formatCurrency(formData.quantity * formData.unit_price)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#1a5f3f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 20px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de itens agrupados por tipo */}
      {Object.keys(itemTypeLabels).map(type => {
        const typeItems = groupedItems[type] || [];
        if (typeItems.length === 0) return null;

        const typeTotal = typeItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

        return (
          <div key={type} style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
              padding: '10px',
              background: itemTypeColors[type] + '10',
              borderRadius: '6px'
            }}>
              <h4 style={{ 
                margin: 0, 
                color: itemTypeColors[type],
                flex: 1
              }}>
                {itemTypeLabels[type]}
              </h4>
              <span style={{ 
                fontWeight: 'bold',
                color: itemTypeColors[type]
              }}>
                {formatCurrency(typeTotal)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {typeItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    gap: '15px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {item.quantity} {item.unit} × {formatCurrency(item.unit_price)} = {' '}
                      <strong>{formatCurrency(item.total_price)}</strong>
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                        {item.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: '5px 10px',
                        background: '#e0e0e0',
                        color: '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: '5px 10px',
                        background: '#fee',
                        color: '#c33',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Total geral */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#1a5f3f',
        color: 'white',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0 }}>Total Geral</h3>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {formatCurrency(calculateTotal())}
        </span>
      </div>
    </div>
  );
};

export default BudgetItemsManager;