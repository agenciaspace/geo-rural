import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardPage from './DashboardPage';
import BudgetHub from './BudgetHub';
import BudgetDetails from './BudgetDetails';
import ClientManager from './ClientManager';
import GnssUploader from './GnssUploader';
import UserProfile from './UserProfile';

const DashboardLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;