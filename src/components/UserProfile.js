import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { user, loading, updateProfile, updatePassword, updateEmail } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Personal info form
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    city: '',
    state: ''
  });

  // Security form
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Email change form
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        company: user.user_metadata?.company || '',
        position: user.user_metadata?.position || '',
        city: user.user_metadata?.city || '',
        state: user.user_metadata?.state || ''
      });
      setEmailData({
        newEmail: user.email || '',
        password: ''
      });
    }
  }, [user]);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await updateProfile({
        name: personalData.name,
        phone: personalData.phone,
        company: personalData.company,
        position: personalData.position,
        city: personalData.city,
        state: personalData.state
      });

      if (error) {
        setError('Erro ao atualizar perfil: ' + error.message);
      } else {
        setSuccess('Perfil atualizado com sucesso!');
      }
    } catch (err) {
      setError('Erro inesperado ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (securityData.newPassword !== securityData.confirmPassword) {
      setError('As senhas não coincidem');
      setSaving(false);
      return;
    }

    if (securityData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      setSaving(false);
      return;
    }

    try {
      const { error } = await updatePassword(securityData.newPassword);

      if (error) {
        setError('Erro ao alterar senha: ' + error.message);
      } else {
        setSuccess('Senha alterada com sucesso!');
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError('Erro inesperado ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await updateEmail(emailData.newEmail);

      if (error) {
        setError('Erro ao alterar email: ' + error.message);
      } else {
        setSuccess('Email alterado com sucesso! Verifique sua caixa de entrada.');
      }
    } catch (err) {
      setError('Erro inesperado ao alterar email');
    } finally {
      setSaving(false);
    }
  };

  const handlePersonalChange = (e) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e) => {
    setSecurityData({
      ...securityData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <style jsx>{`
        .profile-page {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .page-subtitle {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .profile-tabs {
          display: flex;
          border-bottom: 2px solid #e9ecef;
          margin-bottom: 2rem;
          gap: 0;
        }

        .tab-button {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          color: #2c5aa0;
          background: #f8f9fa;
        }

        .tab-button.active {
          color: #2c5aa0;
          border-bottom-color: #2c5aa0;
          background: #f8f9fa;
        }

        .tab-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #2c5aa0;
          box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2c5aa0, #1e3a8a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          margin-bottom: 1rem;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .avatar-info {
          flex: 1;
        }

        .avatar-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 0.25rem;
        }

        .avatar-email {
          color: #666;
          font-size: 0.9rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #2c5aa0;
          color: white;
        }

        .btn-primary:hover {
          background: #1e3a8a;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(44, 90, 160, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .alert-error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .password-requirements {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 1rem;
          }

          .tab-content {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .profile-tabs {
            flex-direction: column;
          }

          .tab-button {
            border-bottom: none;
            border-left: 3px solid transparent;
          }

          .tab-button.active {
            border-left-color: #2c5aa0;
            border-bottom-color: transparent;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          👤 Meu Perfil
        </h1>
        <p className="page-subtitle">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          📝 Informações Pessoais
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Segurança
        </button>
        <button
          className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          📧 Alterar Email
        </button>
      </div>

      <div className="tab-content">
        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {activeTab === 'personal' && (
          <form onSubmit={handlePersonalSubmit}>
            <div className="avatar-section">
              <div className="user-avatar">
                {personalData.name ? personalData.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div className="avatar-info">
                <div className="avatar-name">
                  {personalData.name || 'Usuário'}
                </div>
                <div className="avatar-email">
                  {personalData.email}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Informações Básicas</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={personalData.name}
                    onChange={handlePersonalChange}
                    className="form-input"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={personalData.phone}
                    onChange={handlePersonalChange}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Informações Profissionais</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Empresa</label>
                  <input
                    type="text"
                    name="company"
                    value={personalData.company}
                    onChange={handlePersonalChange}
                    className="form-input"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input
                    type="text"
                    name="position"
                    value={personalData.position}
                    onChange={handlePersonalChange}
                    className="form-input"
                    placeholder="Seu cargo"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Localização</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={personalData.city}
                    onChange={handlePersonalChange}
                    className="form-input"
                    placeholder="Sua cidade"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <input
                    type="text"
                    name="state"
                    value={personalData.state}
                    onChange={handlePersonalChange}
                    className="form-input"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '⏳ Salvando...' : '💾 Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-section">
              <h3 className="section-title">Alterar Senha</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nova Senha</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    className="form-input"
                    placeholder="Digite sua nova senha"
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    className="form-input"
                    placeholder="Confirme sua nova senha"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div className="password-requirements">
                ℹ️ A senha deve ter pelo menos 6 caracteres
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '⏳ Alterando...' : '🔒 Alterar Senha'}
            </button>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-section">
              <h3 className="section-title">Alterar Email</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email Atual</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="form-input"
                    disabled
                    style={{ background: '#f8f9fa', color: '#666' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Novo Email</label>
                  <input
                    type="email"
                    name="newEmail"
                    value={emailData.newEmail}
                    onChange={handleEmailChange}
                    className="form-input"
                    placeholder="Digite seu novo email"
                    required
                  />
                </div>
              </div>
              <div className="password-requirements">
                ℹ️ Um email de confirmação será enviado para o novo endereço
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '⏳ Alterando...' : '📧 Alterar Email'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;