import React from 'react';
import { Button } from './ui/button';

// Responsive Form Container
export const ResponsiveForm = ({ children, onSubmit, className = '' }) => {
  return (
    <form 
      onSubmit={onSubmit} 
      className={`space-y-4 sm:space-y-6 ${className}`}
    >
      {children}
    </form>
  );
};

// Responsive Input Field
export const ResponsiveInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  helpText,
  icon,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 text-sm sm:text-base
            ${icon ? 'pl-10' : ''}
            border rounded-md transition-all duration-200
            focus:ring-2 focus:ring-primary focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${type === 'number' || type === 'tel' || type === 'email' ? 'text-base' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

// Responsive Select Field
export const ResponsiveSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  placeholder = 'Selecione...', 
  required = false,
  error,
  helpText 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-3 py-2 text-sm sm:text-base
          border rounded-md transition-all duration-200
          focus:ring-2 focus:ring-primary focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          appearance-none bg-white
        `}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

// Responsive Textarea
export const ResponsiveTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 4, 
  required = false,
  error,
  helpText 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`
          w-full px-3 py-2 text-sm sm:text-base
          border rounded-md transition-all duration-200
          focus:ring-2 focus:ring-primary focus:border-transparent
          resize-none
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

// Responsive Checkbox
export const ResponsiveCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  helpText 
}) => {
  return (
    <div className="space-y-1">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="mt-1 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
        />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {helpText && (
            <p className="text-xs text-gray-500 mt-0.5">{helpText}</p>
          )}
        </div>
      </label>
    </div>
  );
};

// Responsive Radio Group
export const ResponsiveRadioGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false,
  error 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className="space-y-2">
        {options.map(option => (
          <label 
            key={option.value} 
            className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                {option.label}
              </span>
              {option.description && (
                <p className="text-xs text-gray-500">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

// Responsive Form Actions
export const ResponsiveFormActions = ({ 
  primaryLabel = 'Salvar', 
  onPrimary, 
  secondaryLabel = 'Cancelar', 
  onSecondary,
  isLoading = false,
  align = 'right' 
}) => {
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${alignmentClass} pt-6 border-t`}>
      {onSecondary && (
        <Button
          type="button"
          variant="outline"
          onClick={onSecondary}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          {secondaryLabel}
        </Button>
      )}
      <Button
        type="submit"
        onClick={onPrimary}
        disabled={isLoading}
        className="w-full sm:w-auto order-1 sm:order-2"
      >
        {isLoading ? 'Processando...' : primaryLabel}
      </Button>
    </div>
  );
};

// Responsive File Upload
export const ResponsiveFileUpload = ({ 
  label, 
  name, 
  onChange, 
  accept, 
  multiple = false,
  dragActive = false,
  onDragEnter,
  onDragLeave,
  onDrop,
  helpText,
  error 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 sm:p-8
          transition-all duration-200 cursor-pointer
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          name={name}
          onChange={onChange}
          accept={accept}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <span className="text-3xl sm:text-4xl mb-3 block">📁</span>
          <p className="text-sm text-gray-600">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          {helpText && (
            <p className="text-xs text-gray-500 mt-2">{helpText}</p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};