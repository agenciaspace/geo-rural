import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardPage from './DashboardPage';
import BudgetHub from './BudgetHub';
import BudgetDetails from './BudgetDetails';
import ClientManager from './ClientManager';
import GnssUploader from './GnssUploader';
import UserProfile from './UserProfile';
import EmailConfirmationModal from './EmailConfirmationModal';
import FormLinksManager from './FormLinksManager';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = ({ onLogout }) => {
  const { user, resendConfirmation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isEmailExpired, setIsEmailExpired] = useState(false);

  // Verificar status de confirmação de email
  useEffect(() => {
    if (user) {
      const isEmailConfirmed = !!user.email_confirmed_at;
      
      if (!isEmailConfirmed) {
        // Calcular dias desde a criação da conta
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const daysPassed = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        console.log('🔥 Email check:', {
          isEmailConfirmed,
          daysPassed,
          createdAt: user.created_at,
          email: user.email
        });
        
        if (daysPassed >= 7) {
          // Conta expirada
          setIsEmailExpired(true);
        } else {
          // Mostrar modal periodicamente
          const lastModalShown = localStorage.getItem(`email_modal_${user.id}`);
          const now = Date.now();
          
          // Mostrar modal se:
          // - Nunca foi mostrado
          // - Última vez foi há mais de 24h
          // - É o primeiro dia (mostrar imediatamente)
          if (!lastModalShown || 
              (now - parseInt(lastModalShown)) > 86400000 || 
              daysPassed === 0) {
            setShowEmailModal(true);
            localStorage.setItem(`email_modal_${user.id}`, now.toString());
          }
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = (open) => {
    setSidebarOpen(typeof open === 'boolean' ? open : !sidebarOpen);
  };

  const handleResendEmail = async (email) => {
    try {
      await resendConfirmation(email);
      return true;
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      throw error;
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
  };

  // Se a conta expirou, mostrar tela de bloqueio
  if (isEmailExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Conta Bloqueada</h2>
          <p className="text-gray-600 mb-4">
            Seu prazo de 7 dias para confirmar o email expirou. 
            Entre em contato com o suporte para reativar sua conta.
          </p>
          <button
            onClick={onLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-layout">
      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .main-content {
          flex: 1;
          margin-left: ${isMobile ? '0' : '280px'};
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
        }

        .content-header {
          background: white;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          flex: 1;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .menu-toggle:hover {
          background: #f8f9fa;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          display: ${isMobile && sidebarOpen ? 'block' : 'none'};
          transition: opacity 0.3s ease;
        }

        .content-body {
          flex: 1;
          padding: 0;
          overflow-y: auto;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c5aa0;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .page-subtitle {
          font-size: 0.9rem;
          color: #666;
          margin: 0.25rem 0 0 0;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: #999;
          margin-bottom: 0.5rem;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
        }

        .breadcrumb-separator {
          margin: 0 0.5rem;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
          
          .content-header {
            padding: 1rem;
          }
          
          .page-title {
            font-size: 1.2rem;
          }

          .menu-toggle {
            display: block;
          }

          .breadcrumb {
            display: none;
          }
        }
      `}</style>

      {/* Overlay for mobile */}
      <div className="overlay" onClick={() => toggleSidebar(false)} />
      
      <Sidebar 
        onLogout={onLogout} 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
      />
      
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <div className="breadcrumb">
              <span className="breadcrumb-item">🏠 Início</span>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-item">Sistema</span>
            </div>
            <h1 className="page-title">
              OnGeo - Plataforma de Georreferenciamento
            </h1>
            <p className="page-subtitle">
              Gerencie orçamentos, clientes e análises GNSS de forma inteligente
            </p>
          </div>
          <div className="header-right">
            <button 
              className="menu-toggle"
              onClick={() => toggleSidebar()}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>
        
        <div className="content-body">
          <Routes>
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/budgets" element={<BudgetHub />} />
            <Route path="/budgets/:budgetId" element={<BudgetDetails />} />
            <Route path="/clients" element={<ClientManager />} />
            <Route path="/gnss" element={<GnssUploader />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/form-links" element={<FormLinksManager />} />
          </Routes>
        </div>
      </div>
      
      {/* Modal de confirmação de email */}
      {showEmailModal && user && !user.email_confirmed_at && (
        <EmailConfirmationModal
          user={user}
          onClose={handleCloseEmailModal}
          onResendEmail={handleResendEmail}
        />
      )}
    </div>
  );
};

export default DashboardLayout;