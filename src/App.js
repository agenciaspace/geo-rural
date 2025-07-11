import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import SimpleLandingPage from './components/SimpleLandingPage';
import LoginPage from './components/LoginPage';
import BudgetViewer from './components/BudgetViewer';
import DashboardLayout from './components/DashboardLayout';
import OnboardingFlow from './components/OnboardingFlow';
import { AuthProvider } from './hooks/useAuth';
import './styles/dashboard.css';
import EmailConfirmationPage from './components/EmailConfirmationPage';
import PublicBudgetRequest from './components/PublicBudgetRequest';

// Componente para visualização pública de orçamento
const PublicBudgetViewer = () => {
  const { customLink } = useParams();
  return <BudgetViewer customLink={customLink} />;
};

// Componente principal da aplicação interna
const MainApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Log sempre que currentView mudar
  React.useEffect(() => {
    console.log('🔥 App: currentView mudou para:', currentView);
  }, [currentView]);

  const handleAccessApp = () => {
    setCurrentView('login');
  };

  const handleEmailConfirmationRequired = (email) => {
    console.log('🔥 App: handleEmailConfirmationRequired chamado com email:', email);
    setIsSigningUp(true);
    setPendingConfirmationEmail(email);
    setCurrentView('email-confirmation');
  };

  const handleConfirmationSuccess = () => {
    setIsSigningUp(false);
    setCurrentView('login');
    setPendingConfirmationEmail('');
  };

  const handleBackToLoginFromConfirmation = () => {
    setIsSigningUp(false);
    setCurrentView('login');
    setPendingConfirmationEmail('');
  };

  const handleLoginSuccess = async (userData) => {
    console.log('🔥 App: handleLoginSuccess chamado, isSigningUp:', isSigningUp);
    
    // Se estamos em processo de signup, não fazer nada
    if (isSigningUp) {
      console.log('🔥 App: Ignorando handleLoginSuccess durante signup');
      return;
    }
    
    setCurrentUser(userData);
    
    // Buscar dados do perfil do usuário
    const { auth } = await import('./config/supabase');
    const { data: profile } = await auth.getUserProfile();
    
    // Verificar se o usuário precisa completar o onboarding
    const needsOnboarding = !profile || !profile.phone || !profile.company_name || !profile.position || !profile.city || !profile.state;
    
    if (needsOnboarding) {
      setShowOnboarding(true);
      setCurrentView('onboarding');
    } else {
      setCurrentView('app');
    }
  };

  const handleOnboardingComplete = () => {
    console.log('🔥 App: handleOnboardingComplete chamado - nova versão');
    setShowOnboarding(false);
    setCurrentView('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowOnboarding(false);
    setCurrentView('landing');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <AuthProvider>
      {currentView === 'landing' && (
        <SimpleLandingPage 
          onAccessApp={handleAccessApp}
        />
      )}

      {currentView === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={handleBackToLanding}
          onEmailConfirmationRequired={handleEmailConfirmationRequired}
        />
      )}

      {currentView === 'email-confirmation' && (
        <EmailConfirmationPage
          email={pendingConfirmationEmail}
          onBackToLogin={handleBackToLoginFromConfirmation}
          onConfirmationSuccess={handleConfirmationSuccess}
        />
      )}

      {currentView === 'onboarding' && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
        />
      )}

      {currentView === 'app' && (
        <DashboardLayout onLogout={handleLogout} />
      )}
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública para visualização de orçamentos */}
        <Route path="/budget/:customLink" element={<PublicBudgetViewer />} />
        
        {/* Rota pública para solicitação de orçamentos */}
        <Route path="/budgets/:slug" element={<PublicBudgetRequest />} />
        
        {/* Rotas da aplicação principal */}
        <Route path="/app/*" element={<MainApp />} />
        
        {/* Todas as outras rotas vão para a aplicação principal */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;