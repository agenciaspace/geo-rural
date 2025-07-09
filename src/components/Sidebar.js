import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ onLogout, isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      path: '/app/dashboard',
      description: 'Visão geral e métricas'
    },
    {
      id: 'budgets',
      icon: '🏢',
      label: 'Central de Orçamentos',
      path: '/app/budgets',
      description: 'Criar e gerenciar orçamentos'
    },
    {
      id: 'clients',
      icon: '👥',
      label: 'Gestão de Clientes',
      path: '/app/clients',
      description: 'Cadastro e acompanhamento'
    },
    {
      id: 'gnss',
      icon: '📡',
      label: 'Análise GNSS',
      path: '/app/gnss',
      description: 'Processamento de dados'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile && onToggle) {
      onToggle(false);
    }
  };

  return (
    <div className={`sidebar ${isMobile ? 'mobile' : 'desktop'}`}>
      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .sidebar.mobile {
          transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
        }

        .sidebar.desktop {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .brand {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .brand-icon {
          font-size: 1.8rem;
          margin-right: 0.5rem;
        }

        .brand-name {
          font-size: 1.4rem;
          font-weight: bold;
        }

        .brand-subtitle {
          font-size: 0.8rem;
          opacity: 0.8;
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          margin: 0.25rem 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: white;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          cursor: pointer;
          position: relative;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.1);
          border-left-color: rgba(255,255,255,0.5);
        }

        .nav-link.active {
          background: rgba(255,255,255,0.15);
          border-left-color: #10b981;
        }

        .nav-icon {
          font-size: 1.2rem;
          margin-right: 0.75rem;
          width: 1.5rem;
          text-align: center;
        }

        .nav-text {
          flex: 1;
        }

        .nav-label {
          font-weight: 500;
          margin-bottom: 0.1rem;
        }

        .nav-description {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          position: relative;
        }

        .user-info:hover {
          background: rgba(255,255,255,0.1);
        }

        .profile-arrow {
          margin-left: auto;
          font-size: 1.2rem;
          opacity: 0.7;
          transition: transform 0.2s ease;
        }

        .user-info:hover .profile-arrow {
          transform: translateX(2px);
          opacity: 1;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          font-size: 1rem;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0;
        }

        .user-role {
          font-size: 0.7rem;
          opacity: 0.8;
          margin: 0;
        }

        .logout-btn {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }

        .status-indicator {
          position: absolute;
          top: 0.5rem;
          right: 1rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            max-width: 300px;
            height: 100vh;
            position: fixed;
            z-index: 1001;
          }
          
          .nav-description {
            display: none;
          }
        }
      `}</style>

      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-icon">🌱</span>
          <span className="brand-name">OnGeo</span>
        </div>
        <p className="brand-subtitle">Plataforma de Georreferenciamento</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <div key={item.id} className="nav-item">
            <div
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-text">
                <div className="nav-label">{item.label}</div>
                <div className="nav-description">{item.description}</div>
              </div>
              {location.pathname === item.path && <div className="status-indicator" />}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" onClick={() => handleNavigation('/app/profile')}>
          <div className="user-avatar">
            {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="user-details">
            <div className="user-name">
              {user?.user_metadata?.name || user?.email || 'Usuário'}
            </div>
            <div className="user-role">Profissional</div>
          </div>
          <div className="profile-arrow">›</div>
        </div>
        <button 
          className="logout-btn" 
          onClick={async () => {
            await signOut();
            onLogout();
          }}
        >
          🚪 Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;