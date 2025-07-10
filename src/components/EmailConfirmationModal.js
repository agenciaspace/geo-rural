import React, { useState, useEffect } from 'react';
import { X, Mail, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const EmailConfirmationModal = ({ user, onClose, onResendEmail }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(7);

  useEffect(() => {
    if (user?.created_at) {
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const daysPassed = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, 7 - daysPassed);
      setDaysRemaining(remaining);
    }
  }, [user]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await onResendEmail(user.email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const getStatusColor = () => {
    if (daysRemaining <= 1) return 'text-red-600';
    if (daysRemaining <= 3) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = () => {
    if (daysRemaining <= 1) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Confirme seu Email
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Alert */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            daysRemaining <= 1 ? 'bg-red-50' : 
            daysRemaining <= 3 ? 'bg-orange-50' : 'bg-yellow-50'
          }`}>
            {getStatusIcon()}
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {daysRemaining > 0 
                  ? `${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
                  : 'Prazo expirado'
                }
              </p>
              <p className="text-sm text-gray-600">
                {daysRemaining > 0 
                  ? 'para confirmar seu email'
                  : 'Sua conta será bloqueada'
                }
              </p>
            </div>
          </div>

          {/* Email Info */}
          <div>
            <p className="text-gray-700 mb-2">
              Enviamos um email de confirmação para:
            </p>
            <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded">
              {user?.email}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Você pode usar o sistema normalmente, mas precisa 
              confirmar seu email em até 7 dias para manter o acesso.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Reenviando...' : 'Reenviar Email de Confirmação'}
            </button>

            {resendSuccess && (
              <p className="text-sm text-green-600 text-center">
                ✓ Email reenviado com sucesso!
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg 
                       hover:bg-gray-300 transition-colors"
            >
              Continuar usando o sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;