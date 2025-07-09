import React from 'react';
import './LandingPage.css';

const SimpleLandingPage = ({ onAccessApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <style jsx>{`
          @media (max-width: 768px) {
            .features-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .main-title {
              font-size: 2rem !important;
            }
            
            .subtitle {
              font-size: 1rem !important;
            }
            
            .cta-button {
              padding: 0.75rem 1.5rem !important;
              font-size: 1rem !important;
            }
            
            .feature-card {
              padding: 1rem !important;
            }
            
            .feature-icon {
              font-size: 2rem !important;
            }
          }
        `}</style>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl mr-3">🌱</span>
            <h1 className="text-4xl font-bold text-green-800 main-title">OnGeo</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto subtitle">
            Plataforma de Georreferenciamento e Análise GNSS
          </p>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Assistente IA para Profissionais de Georreferenciamento
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 features-grid">
            <div className="bg-white rounded-lg p-6 shadow-sm feature-card">
              <div className="text-3xl mb-3 feature-icon">💰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Cálculo Inteligente</h3>
              <p className="text-gray-600 text-sm">
                IA analisa e gera orçamentos precisos automaticamente
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm feature-card">
              <div className="text-3xl mb-3 feature-icon">📡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Análise GNSS</h3>
              <p className="text-gray-600 text-sm">
                Processamento automático de dados RINEX
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm feature-card">
              <div className="text-3xl mb-3 feature-icon">📊</div>
              <h3 className="font-semibold text-gray-800 mb-2">Documentação</h3>
              <p className="text-gray-600 text-sm">
                Relatórios técnicos gerados automaticamente
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Transforme seu trabalho em minutos
            </h3>
            <p className="text-green-700">
              De 6 horas para 15 minutos por orçamento • 90% menos tempo em cálculos • 100% precisão técnica
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <button
            onClick={onAccessApp}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg cta-button"
          >
            🚀 Entrar no Sistema
          </button>
          
          <p className="text-sm text-gray-500">
            Acesse agora e otimize seu trabalho com nossa IA
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2024 OnGeo. Assistente IA para profissionais de georreferenciamento
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLandingPage;