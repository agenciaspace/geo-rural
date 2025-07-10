import React from 'react';
import { Button } from './ui/button';

// Responsive client card component
export const ResponsiveClientCard = ({ client, onEdit, onView, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
            <p className="text-sm text-gray-600">{client.email}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            client.client_type === 'pessoa_juridica' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {client.client_type === 'pessoa_juridica' ? '🏢 Empresa' : '👤 Pessoa Física'}
          </span>
        </div>

        {/* Contact info - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">📱</span>
            <span className="truncate">{client.phone || 'Sem telefone'}</span>
          </div>
          {client.secondary_phone && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">📞</span>
              <span className="truncate">{client.secondary_phone}</span>
            </div>
          )}
          {client.document && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">📄</span>
              <span className="truncate">{client.document}</span>
            </div>
          )}
          {client.company_name && (
            <div className="flex items-center space-x-2 col-span-1 sm:col-span-2">
              <span className="text-gray-500">🏢</span>
              <span className="truncate">{client.company_name}</span>
            </div>
          )}
        </div>

        {/* Address - responsive */}
        {client.address && (client.address.street || client.address.city) && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              📍 {[
                client.address.street,
                client.address.number,
                client.address.city,
                client.address.state
              ].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {/* Actions - responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-100">
          <Button
            onClick={() => onView(client)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <span className="mr-2">👁️</span>
            Ver
          </Button>
          <Button
            onClick={() => onEdit(client)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <span className="mr-2">✏️</span>
            Editar
          </Button>
          <Button
            onClick={() => onDelete(client.id)}
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
          >
            <span className="mr-2">🗑️</span>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};

// Responsive search bar
export const ResponsiveSearchBar = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 pr-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </span>
    </div>
  );
};

// Responsive client form
export const ResponsiveClientForm = ({ formData, onChange, onSubmit, onCancel, isLoading, mode = 'create' }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      {/* Type selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Cliente
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              name="client_type"
              value="pessoa_fisica"
              checked={formData.client_type === 'pessoa_fisica'}
              onChange={onChange}
              className="mr-3"
            />
            <span>👤 Pessoa Física</span>
          </label>
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              name="client_type"
              value="pessoa_juridica"
              checked={formData.client_type === 'pessoa_juridica'}
              onChange={onChange}
              className="mr-3"
            />
            <span>🏢 Pessoa Jurídica</span>
          </label>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Principal
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.client_type === 'pessoa_juridica' ? 'CNPJ' : 'CPF'}
          </label>
          <input
            type="text"
            name="document"
            value={formData.document}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {formData.client_type === 'pessoa_juridica' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

// Responsive stats card
export const ResponsiveStatsCard = ({ icon, label, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};