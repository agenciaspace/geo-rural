import React, { useState } from 'react';
import { Button } from './ui/button';

export const ResponsiveNavigation = ({ 
  user, 
  onLogout, 
  currentPage, 
  onNavigate 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'budgets', label: 'Orçamentos', icon: '💰' },
    { id: 'clients', label: 'Clientes', icon: '👥' },
    { id: 'gnss', label: 'GNSS', icon: '📡' },
    { id: 'profile', label: 'Perfil', icon: '👤' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden sm:block bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl mr-2">🌱</span>
              <h1 className="text-xl font-bold text-green-800">OnGeo</h1>
            </div>

            {/* Nav Items */}
            <div className="flex items-center space-x-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center space-x-1"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sm:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl mr-1">🌱</span>
              <h1 className="text-lg font-bold text-green-800">OnGeo</h1>
            </div>

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative"
            >
              <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
            <div className="px-2 py-2 space-y-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Button>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-600">
                  {user?.email}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

// Responsive Tab Navigation
export const ResponsiveTabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex space-x-1 sm:space-x-4 px-4 sm:px-0 min-w-max sm:min-w-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-2 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <span className="flex items-center space-x-1 sm:space-x-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`
                  ml-1 px-2 py-0.5 text-xs rounded-full
                  ${activeTab === tab.id 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'}
                `}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Responsive Breadcrumb
export const ResponsiveBreadcrumb = ({ items }) => {
  return (
    <nav className="flex mb-4 text-sm">
      <ol className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-1 sm:mx-2 text-gray-400">/</span>}
            {item.href ? (
              <a 
                href={item.href} 
                className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-gray-500 whitespace-nowrap">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Responsive Sidebar (for dashboard layouts)
export const ResponsiveSidebar = ({ 
  isOpen, 
  onClose, 
  menuItems, 
  activeItem, 
  onItemClick 
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed sm:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0
      `}>
        <div className="h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🌱</span>
              <h2 className="text-lg font-bold text-green-800">OnGeo</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="sm:hidden"
            >
              <span className="text-xl">✕</span>
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map(item => (
              <Button
                key={item.id}
                variant={activeItem === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onItemClick(item.id);
                  if (window.innerWidth < 640) onClose();
                }}
                className="w-full justify-start"
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};