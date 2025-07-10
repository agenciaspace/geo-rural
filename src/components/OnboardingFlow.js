import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const OnboardingFlow = ({ onComplete }) => {
  const authContext = useAuth();
  const { user, updateProfile } = authContext;
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    company: '',
    position: '',
    city: '',
    state: ''
  });

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    console.log('OnboardingFlow - User:', user);
    console.log('OnboardingFlow - FormData:', formData);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        console.error('OnboardingFlow - Erro:', error);
        setError('Erro ao salvar informações: ' + error.message);
      } else {
        console.log('🔥 OnboardingFlow: Sucesso! Versão simplificada');
        onComplete();
      }
    } catch (err) {
      console.error('OnboardingFlow - Erro inesperado:', err);
      setError('Erro inesperado ao salvar informações');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.phone.length >= 10;
      case 2:
        return formData.company.length >= 2 && formData.position.length >= 2;
      case 3:
        return formData.city.length >= 2 && formData.state.length >= 2;
      default:
        return false;
    }
  };

  return (
    <div className="onboarding-overlay">
      <style jsx>{`
        .onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .onboarding-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .onboarding-title {
          font-size: 1.8rem;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
        }

        .onboarding-subtitle {
          color: #666;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2c5aa0, #1e3a8a);
          border-radius: 2px;
          transition: width 0.3s ease;
          width: ${(currentStep / 3) * 100}%;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .step-dot.active {
          background: #2c5aa0;
          color: white;
        }

        .step-dot.completed {
          background: #28a745;
          color: white;
        }

        .step-dot.inactive {
          background: #e9ecef;
          color: #666;
        }

        .step-content {
          margin-bottom: 2rem;
        }

        .step-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
        }

        .step-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #2c5aa0;
        }

        .form-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          transition: border-color 0.2s ease;
        }

        .form-select:focus {
          outline: none;
          border-color: #2c5aa0;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #2c5aa0;
          color: white;
        }

        .btn-primary:hover {
          background: #1e3a8a;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #666;
          border: 1px solid #e9ecef;
        }

        .btn-secondary:hover {
          background: #e9ecef;
          color: #333;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn:disabled:hover {
          background: inherit;
          transform: none;
        }

        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .user-info {
          background: #e7f3ff;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .user-name {
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 0.25rem;
        }

        .user-email {
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .onboarding-container {
            padding: 1.5rem;
          }

          .button-group {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="onboarding-title">
            🎉 Bem-vindo ao OnGeo!
          </div>
          <div className="onboarding-subtitle">
            Vamos completar seu perfil para melhor atendê-lo
          </div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>

        <div className="step-indicator">
          <div className={`step-dot ${currentStep >= 1 ? 'active' : 'inactive'}`}>
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <div className={`step-dot ${currentStep >= 2 ? 'active' : currentStep > 2 ? 'completed' : 'inactive'}`}>
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <div className={`step-dot ${currentStep >= 3 ? 'active' : 'inactive'}`}>
            {currentStep > 3 ? '✓' : '3'}
          </div>
        </div>

        <div className="user-info">
          <div className="user-name">
            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
          </div>
          <div className="user-email">
            {user?.email}
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <div className="step-content">
          {currentStep === 1 && (
            <>
              <div className="step-title">📱 Informações de Contato</div>
              <div className="step-description">
                Precisamos do seu telefone para entrar em contato quando necessário
              </div>
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                  maxLength="15"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="step-title">🏢 Informações Profissionais</div>
              <div className="step-description">
                Conte-nos sobre sua empresa e cargo para personalizarmos sua experiência
              </div>
              <div className="form-group">
                <label className="form-label">Nome da Empresa *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="MinhaEmpresa Ltda"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Seu Cargo *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Engenheiro, Topógrafo, Gerente..."
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="step-title">📍 Localização</div>
              <div className="step-description">
                Sua localização nos ajuda a fornecer informações mais precisas
              </div>
              <div className="form-group">
                <label className="form-label">Sua Cidade *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="São Paulo"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Selecione seu estado</option>
                  {brazilianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={handleBack}
            className="btn btn-secondary"
            disabled={currentStep === 1}
          >
            ← Voltar
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              disabled={!isStepValid()}
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="btn btn-primary"
              disabled={!isStepValid() || isLoading}
            >
              {isLoading ? '⏳ Salvando...' : '🎉 Finalizar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;