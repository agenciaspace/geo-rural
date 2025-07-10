import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const SessionRecovery = ({ onRecoveryComplete }) => {
  const { forceUnconfirmedSession } = useAuth();
  
  useEffect(() => {
    console.log('🔥 SessionRecovery: Iniciando recuperação...');
    
    // Verificar localStorage
    const savedSession = localStorage.getItem('grace_period_user_session');
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        console.log('🔥 SessionRecovery: Dados encontrados:', parsed);
        
        if (parsed && parsed.user && parsed.session) {
          console.log('🔥 SessionRecovery: Forçando sessão no AuthContext...');
          
          // IMPORTANTE: Forçar a sessão no AuthContext primeiro
          forceUnconfirmedSession(parsed.user, parsed.session);
          
          console.log('🔥 SessionRecovery: Recuperação bem-sucedida, redirecionando...');
          
          // Dar tempo para os estados serem atualizados
          setTimeout(() => {
            onRecoveryComplete(parsed.user);
          }, 500);
          
          return;
        }
      } catch (error) {
        console.error('SessionRecovery: Erro ao processar dados:', error);
      }
    }
    
    console.log('🔥 SessionRecovery: Nenhuma sessão válida encontrada, voltando ao login');
    setTimeout(() => {
      onRecoveryComplete(null);
    }, 2000);
    
  }, [onRecoveryComplete, forceUnconfirmedSession]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <span className="text-3xl">🌱</span>
          <span className="text-2xl font-bold text-green-800 ml-2">OnGeo</span>
        </div>
        <div className="text-lg text-gray-700 mb-4">Finalizando configuração...</div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div className="text-sm text-gray-500 mt-4">Aguarde um momento</div>
      </div>
    </div>
  );
};

export default SessionRecovery;