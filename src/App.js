import React, { useState } from 'react';
import BudgetSimulator from './components/BudgetSimulator';
import BudgetManager from './components/BudgetManager';
import GnssUploader from './components/GnssUploader';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ConversionLanding from './components/ConversionLanding';
import Login from './components/Login';
import { AuthProvider } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState('educational'); // 'educational', 'conversion', 'login', 'app'
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAccessApp = () => {
    setCurrentView('login');
  };

  const handleGoToConversion = () => {
    setCurrentView('conversion');
  };

  const handleBackToEducational = () => {
    setCurrentView('educational');
  };

  const handleLoginSuccess = (userData) => {
    setCurrentView('app');
  };

  const handleLogout = () => {
    setCurrentView('educational');
  };

  const handleBackToLanding = () => {
    setCurrentView('educational');
  };

  // Página Educacional (Landing Principal)
  if (currentView === 'educational') {
    return (
      <LandingPage 
        onAccessApp={handleAccessApp}
        onConversionLanding={handleGoToConversion}
      />
    );
  }

  // Página de Conversão
  if (currentView === 'conversion') {
    return (
      <ConversionLanding 
        onAccessApp={handleAccessApp}
        onBackToEducational={handleBackToEducational}
      />
    );
  }

  // Página de Login
  if (currentView === 'login') {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  // Aplicação Principal
  return (
    <AuthProvider>
      <div className="App">
      <div className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>PRECIZU</h1>
            <p>Plataforma de Georreferenciamento e Análise GNSS</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sair
          </button>
        </div>
      </div>
      
      <div className="container">
        <div style={{
          background: 'linear-gradient(135deg, #e8f5e8, #f0f8ff)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
            🎉 Bem-vindo ao Demo do PRECIZU!
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            Explore todas as funcionalidades. Esta é uma versão de demonstração com dados fictícios.
          </p>
        </div>

        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            💰 Simulador de Orçamento
          </button>
          <button 
            className={`nav-tab ${activeTab === 'budgetManager' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgetManager')}
          >
            📋 Gerenciar Orçamentos
          </button>
          <button 
            className={`nav-tab ${activeTab === 'gnss' ? 'active' : ''}`}
            onClick={() => setActiveTab('gnss')}
          >
            📡 Análise GNSS
          </button>
        </div>
        
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'budget' && <BudgetSimulator />}
        {activeTab === 'budgetManager' && <BudgetManager />}
        {activeTab === 'gnss' && <GnssUploader />}
      </div>
    </div>
    </AuthProvider>
  );
}

export default App;