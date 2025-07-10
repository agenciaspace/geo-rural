import React from 'react';
import { Button } from './ui/button';

const ResponsiveLandingPage = ({ onAccessApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Mobile-optimized container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Header Section - Responsive */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl sm:text-5xl mr-2 sm:mr-3">🌱</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-800">
              OnGeo
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Plataforma de Georreferenciamento e Análise GNSS
          </p>
        </header>

        {/* Hero Section - Responsive */}
        <section className="text-center mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6 px-4">
            Assistente IA para Profissionais de Georreferenciamento
          </h2>
          
          {/* Features Grid - Fully Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <FeatureCard
              icon="💰"
              title="Cálculo Inteligente"
              description="IA analisa e gera orçamentos precisos automaticamente"
            />
            <FeatureCard
              icon="📡"
              title="Análise GNSS"
              description="Processamento automático de dados RINEX"
            />
            <FeatureCard
              icon="📊"
              title="Documentação"
              description="Relatórios técnicos gerados automaticamente"
            />
          </div>

          {/* Benefits Section - Responsive */}
          <div className="bg-green-50 rounded-xl p-4 sm:p-6 lg:p-8 mb-8 mx-auto max-w-4xl">
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-3">
              Transforme seu trabalho em minutos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-green-700">
              <BenefitItem
                title="6h → 15min"
                description="Por orçamento"
              />
              <BenefitItem
                title="90% menos"
                description="Tempo em cálculos"
              />
              <BenefitItem
                title="100%"
                description="Precisão técnica"
              />
            </div>
          </div>
        </section>

        {/* CTA Section - Responsive */}
        <section className="text-center space-y-4">
          <Button
            onClick={onAccessApp}
            size="fullWidth"
            className="bg-green-600 hover:bg-green-700 text-white max-w-md mx-auto"
          >
            <span className="mr-2">🚀</span>
            Entrar no Sistema
          </Button>
          
          <p className="text-sm text-gray-500">
            Acesse agora e otimize seu trabalho com nossa IA
          </p>
        </section>

        {/* Additional Features Section - Responsive */}
        <section className="mt-12 sm:mt-16 lg:mt-20">
          <h3 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-8">
            Por que escolher OnGeo?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <BenefitCard
              icon="🎯"
              title="Precisão Garantida"
              description="Algoritmos baseados nas normas técnicas do INCRA e legislação vigente"
            />
            <BenefitCard
              icon="⚡"
              title="Velocidade"
              description="Economize horas de trabalho com processamento instantâneo"
            />
            <BenefitCard
              icon="📱"
              title="Acesso em Qualquer Lugar"
              description="Plataforma 100% online, acesse de qualquer dispositivo"
            />
            <BenefitCard
              icon="🔒"
              title="Segurança Total"
              description="Seus dados protegidos com criptografia de ponta a ponta"
            />
          </div>
        </section>

        {/* Footer - Responsive */}
        <footer className="mt-12 sm:mt-16 text-center text-sm text-gray-500 pb-8">
          <p>© 2024 OnGeo - Transformando o Georreferenciamento Rural</p>
        </footer>
      </div>
    </div>
  );
};

// Responsive Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-3xl sm:text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">{title}</h3>
    <p className="text-gray-600 text-sm sm:text-base">{description}</p>
  </div>
);

// Benefit Item Component
const BenefitItem = ({ title, description }) => (
  <div className="text-center">
    <p className="text-xl sm:text-2xl font-bold">{title}</p>
    <p className="text-sm sm:text-base">{description}</p>
  </div>
);

// Benefit Card Component
const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
    <div className="flex items-start space-x-4">
      <span className="text-2xl sm:text-3xl flex-shrink-0">{icon}</span>
      <div className="text-left">
        <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

export default ResponsiveLandingPage;