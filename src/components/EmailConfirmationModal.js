import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const EmailConfirmationModal = () => {
  const { user, resendConfirmation } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Verificar se o usuário existe e se o email não foi confirmado
    // Funciona tanto com Supabase real quanto modo demo
    if (user && !user.email_confirmed_at && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await resendConfirmation(user.email);
      
      if (error) {
        alert('Erro ao reenviar email: ' + error.message);
      } else {
        alert('Email de confirmação reenviado! Verifique sua caixa de entrada.');
      }
    } catch (error) {
      alert('Erro inesperado ao reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="email-confirmation-modal">
      <style jsx>{`
        .email-confirmation-modal {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e9ecef;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 600;
          color: #2c5aa0;
          margin: 0;
        }

        .modal-icon {
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f8f9fa;
          color: #333;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-message {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .user-email {
          font-weight: 600;
          color: #2c5aa0;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
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
          transform: translateY(-1px);
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
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn:disabled:hover {
          background: inherit;
          transform: none;
        }

        .warning-badge {
          background: #fff3cd;
          color: #856404;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        @media (max-width: 768px) {
          .email-confirmation-modal {
            top: 10px;
            right: 10px;
            left: 10px;
            width: auto;
          }

          .modal-header {
            padding: 0.75rem 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="modal-header">
        <h3 className="modal-title">
          <span className="modal-icon">📧</span>
          Confirme seu e-mail
          <span className="warning-badge">Não confirmado</span>
        </h3>
        <button className="close-button" onClick={handleDismiss}>
          ×
        </button>
      </div>

      <div className="modal-body">
        <p className="modal-message">
          Para continuar usando a aplicação, confirme seu email{' '}
          <span className="user-email">{user?.email}</span>. 
          Verifique sua caixa de entrada e clique no link de confirmação 
          que foi enviado para ativar completamente sua conta.
        </p>

        <div className="modal-actions">
          <button 
            className="btn btn-primary"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? '⏳ Enviando...' : '📤 Reenviar email'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleDismiss}
            disabled={isResending}
          >
            ⏰ Lembrar depois
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;