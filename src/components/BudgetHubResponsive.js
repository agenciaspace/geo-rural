import React from 'react';
import { Button } from './ui/button';

// Responsive wrapper component for BudgetHub buttons and layouts
export const ResponsiveBudgetActions = ({ 
  onEdit, 
  onCopy, 
  onEditLink, 
  onResubmit, 
  onDelete,
  isRejected,
  isLoading,
  editingLink,
  budgetId
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
      <Button
        onClick={onEdit}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        <span className="mr-2">✏️</span>
        <span className="sm:inline">Editar</span>
      </Button>
      
      <Button
        onClick={onCopy}
        variant="default"
        size="sm"
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
      >
        <span className="mr-2">📋</span>
        <span className="sm:inline">Copiar</span>
      </Button>
      
      <Button
        onClick={onEditLink}
        disabled={editingLink === budgetId || isLoading}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        <span className="mr-2">🔗</span>
        <span className="hidden sm:inline">Editar Link</span>
        <span className="sm:hidden">Link</span>
      </Button>
      
      {isRejected && (
        <Button
          onClick={onResubmit}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          <span className="mr-2">🔄</span>
          <span className="sm:inline">Reenviar</span>
        </Button>
      )}
      
      <Button
        onClick={onDelete}
        variant="destructive"
        size="sm"
        className="w-full sm:w-auto"
      >
        <span className="mr-2">🗑️</span>
        <span className="hidden sm:inline">Excluir</span>
        <span className="sm:hidden">Del</span>
      </Button>
    </div>
  );
};

// Responsive budget card component
export const ResponsiveBudgetCard = ({ budget, children }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return '✅ Aprovado';
      case 'rejected': return '❌ Rejeitado';
      case 'pending': return '⏳ Pendente';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header with responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="text-lg font-semibold text-gray-900">
            {budget.budget_request?.property_name || 'Propriedade sem nome'}
          </h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
            {getStatusText(budget.status)}
          </span>
        </div>

        {/* Info grid - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Cliente:</span>
            <span className="ml-2 font-medium">{budget.budget_request?.client_name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Área:</span>
            <span className="ml-2 font-medium">{budget.budget_request?.property_area || 0} ha</span>
          </div>
          <div>
            <span className="text-gray-500">Cidade:</span>
            <span className="ml-2 font-medium">{budget.budget_request?.city || 'N/A'} - {budget.budget_request?.state || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Vértices:</span>
            <span className="ml-2 font-medium">{budget.budget_request?.vertices_count || 0}</span>
          </div>
        </div>

        {/* Price display - responsive */}
        {budget.final_price && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Valor Total:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                R$ {budget.final_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Children (actions, etc.) */}
        {children}
      </div>
    </div>
  );
};

// Responsive form grid
export const ResponsiveFormGrid = ({ children, columns = 2 }) => {
  const gridClass = columns === 2 
    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  
  return <div className={gridClass}>{children}</div>;
};

// Responsive form field
export const ResponsiveFormField = ({ label, required, children, helpText }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

// Responsive header with mobile menu toggle
export const ResponsiveHeader = ({ title, subtitle, onMenuToggle, showMenu = false }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {showMenu && (
        <Button
          onClick={onMenuToggle}
          variant="ghost"
          size="icon"
          className="sm:hidden"
        >
          <span className="text-2xl">☰</span>
        </Button>
      )}
    </div>
  );
};

// Responsive empty state
export const ResponsiveEmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="text-4xl sm:text-5xl mb-4">📋</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="responsive">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};