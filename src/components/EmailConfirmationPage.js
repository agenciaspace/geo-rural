import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { auth } from '../config/supabase';
import { Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const EmailConfirmationPage = ({ email, onBackToLogin, onConfirmationSuccess }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingConfirmation, setIsCheckingConfirmation] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError('');
    
    try {
      await auth.resendConfirmation(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setError('Erro ao reenviar email: ' + error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckConfirmation = async () => {
    // Simplesmente redirecionar para login - usuário deve fazer login manual
    // para garantir que o fluxo completo (incluindo onboarding) funcione corretamente
    onConfirmationSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Confirme seu Email
            </CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para seu email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Info */}
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-800 mb-2">
                Email enviado para:
              </p>
              <p className="font-semibold text-blue-900 break-all">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Verifique sua caixa de entrada e clique no link de confirmação
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Não esqueça de verificar a pasta de spam/lixo eletrônico
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Após confirmar, clique em "Continuar" para fazer login
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600">
                  ✓ Email reenviado com sucesso!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckConfirmation}
                disabled={isCheckingConfirmation}
                className="w-full"
              >
                Continuar para Login
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? 'Reenviando...' : 'Reenviar Email'}
              </Button>

              <Button
                onClick={onBackToLogin}
                variant="ghost"
                className="w-full"
              >
                ← Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmationPage; 