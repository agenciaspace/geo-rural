import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onAccessApp }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const painPoints = [
    {
      icon: '📝',
      title: 'Entrada repetitiva de dados',
      description: 'Horas perdidas digitando as mesmas informações'
    },
    {
      icon: '📐',
      title: 'Desenhos manuais em CAD',
      description: 'Processo demorado e sujeito a erros'
    },
    {
      icon: '💰',
      title: 'Orçamentos difíceis de simular',
      description: 'Cálculos complexos e pouco ágeis'
    },
    {
      icon: '🔗',
      title: 'Pouca integração com INCRA GEO',
      description: 'Dificuldade para adequar aos padrões'
    }
  ];

  const solutions = [
    {
      icon: '🚀',
      title: 'Orçamento automático',
      description: 'Calcule preços em segundos'
    },
    {
      icon: '📄',
      title: 'Propostas em PDF em segundos',
      description: 'Documentos profissionais instantâneos'
    },
    {
      icon: '🤖',
      title: 'Desenhos com IA',
      description: 'Inteligência artificial para desenho automático'
    },
    {
      icon: '📡',
      title: 'Suporte a arquivos GNSS e PPP/IBGE',
      description: 'Compatibilidade total com padrões'
    }
  ];

  const features = [
    'Simulador automático de orçamento',
    'Geração instantânea de propostas em PDF',
    'Processamento de arquivos GNSS com IA',
    'Desenho automatizado via inteligência artificial',
    'Integração com padrões INCRA GEO',
    'Funciona online e offline'
  ];

  const comparisonData = [
    { feature: 'Desenho automatizado com IA', us: true, others: false },
    { feature: 'Compatível com INCRA GEO', us: true, others: true },
    { feature: 'Propostas automáticas em PDF', us: true, others: false },
    { feature: 'Integração com arquivos GNSS', us: true, others: true },
    { feature: 'Funciona offline', us: true, others: false },
    { feature: 'Simulação de orçamento instantânea', us: true, others: false }
  ];

  const plans = {
    free: {
      name: 'Plano Gratuito',
      price: 'R$ 0',
      period: '',
      description: 'Comece agora mesmo',
      features: [
        '✅ Até 3 simulações por mês',
        '✅ Geração de PDF',
        '✅ Acesso à comunidade',
        '❌ Desenho automatizado',
        '❌ Suporte prioritário'
      ],
      highlight: false,
      cta: 'Começar Grátis'
    },
    professional: {
      name: 'Plano Profissional',
      price: 'R$ 97',
      period: '/mês',
      description: 'Para profissionais exigentes',
      features: [
        '✅ Simulações ilimitadas',
        '✅ Propostas ilimitadas em PDF',
        '✅ Desenho automatizado com IA',
        '✅ Suporte prioritário',
        '✅ Integração INCRA GEO',
        '✅ Funciona offline'
      ],
      highlight: true,
      cta: 'Assinar Agora'
    },
    perDraw: {
      name: 'Serviço Avulso',
      price: 'R$ 47',
      period: '/desenho',
      description: 'Sem assinatura',
      features: [
        '✅ Pague apenas quando usar',
        '✅ Desenho automatizado com IA',
        '✅ Arquivo compatível com INCRA',
        '✅ Entrega em até 24h',
        '❌ Simulador de orçamento',
        '❌ Suporte prioritário'
      ],
      highlight: false,
      cta: 'Comprar Desenho'
    }
  };

  const faqs = [
    {
      question: 'Quais formatos de arquivos são suportados?',
      answer: 'Suportamos RINEX (.21O, .rnx), .OBS, .NAV e diversos outros formatos GNSS padrão do mercado. Também aceitamos arquivos compactados em .ZIP.'
    },
    {
      question: 'O sistema funciona sem internet?',
      answer: 'Sim! Após o primeiro acesso, várias funcionalidades ficam disponíveis offline, incluindo simulação de orçamento e geração de propostas. A sincronização acontece quando você voltar a ter conexão.'
    },
    {
      question: 'É compatível com o PPP do IBGE?',
      answer: 'Totalmente! Nossa plataforma está integrada com os padrões PPP (Posicionamento por Ponto Preciso) do IBGE, garantindo precisão e conformidade com as normas brasileiras.'
    },
    {
      question: 'Como funciona o desenho automatizado com IA?',
      answer: 'Você faz upload dos dados do levantamento, nossa IA processa as coordenadas e gera automaticamente o desenho técnico seguindo os padrões do INCRA. Todo o processo leva menos de 5 minutos.'
    },
    {
      question: 'Posso personalizar as propostas?',
      answer: 'Sim! Você pode adicionar sua logo, ajustar valores, incluir observações específicas e personalizar completamente o layout das propostas antes de gerar o PDF.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="nav-brand">
            <span className="brand-icon">🌱</span>
            <span className="brand-name">GeoRural Pro</span>
          </div>
          <div className="nav-links">
            <a href="#why-change">Por que mudar</a>
            <a href="#features">Funcionalidades</a>
            <a href="#pricing">Preços</a>
            <button className="btn-access" onClick={onAccessApp}>
              Experimente Grátis
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Automatize seus projetos de <span className="highlight">geolocalização rural</span> com IA
            </h1>
            <p className="hero-subtitle">
              Soluções inteligentes para orçamento, proposta, desenho automatizado e compatibilidade com os padrões INCRA GEO.
            </p>
            
            <div className="hero-cta">
              <button className="btn-primary-large" onClick={onAccessApp}>
                Experimente Grátis
              </button>
              <p className="cta-note">
                Sem cartão de crédito • Comece em 2 minutos • Cancele quando quiser
              </p>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="app-preview modern">
              <div className="preview-badge">🤖 Powered by AI</div>
              <div className="preview-screen">
                <div className="ai-animation">
                  <div className="ai-circle"></div>
                  <div className="ai-circle"></div>
                  <div className="ai-circle"></div>
                </div>
                <div className="preview-features">
                  <div className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>Desenho automatizado</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>Compatível INCRA GEO</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>Propostas em PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por que mudar? Section */}
      <section id="why-change" className="why-change">
        <div className="container">
          <div className="section-header">
            <h2>Por que mudar?</h2>
            <p>Pare de perder tempo com processos manuais e repetitivos</p>
          </div>
          
          <div className="pain-solutions-grid">
            <div className="pain-points">
              <h3>Dores atuais</h3>
              <div className="points-list">
                {painPoints.map((pain, index) => (
                  <div key={index} className="pain-item">
                    <span className="pain-icon">{pain.icon}</span>
                    <div className="pain-content">
                      <h4>{pain.title}</h4>
                      <p>{pain.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="solutions">
              <h3>Nossas soluções</h3>
              <div className="points-list">
                {solutions.map((solution, index) => (
                  <div key={index} className="solution-item">
                    <span className="solution-icon">{solution.icon}</span>
                    <div className="solution-content">
                      <h4>{solution.title}</h4>
                      <p>{solution.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades principais Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Funcionalidades principais</h2>
            <p>Tudo que você precisa em uma única plataforma</p>
          </div>
          
          <div className="features-list">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-number">{index + 1}</span>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativo Section */}
      <section id="comparison" className="comparison">
        <div className="container">
          <div className="section-header">
            <h2>Comparativo</h2>
            <p>Veja como nos destacamos da concorrência</p>
          </div>
          
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Funcionalidade</th>
                  <th className="highlight-column">GeoRural Pro</th>
                  <th>Outros softwares</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.feature}</td>
                    <td className="highlight-column">
                      {row.us ? <span className="check">✅</span> : <span className="cross">❌</span>}
                    </td>
                    <td>
                      {row.others ? <span className="check">✅</span> : <span className="cross">❌</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Planos e preços Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Planos e preços</h2>
            <p>Escolha o melhor plano para sua necessidade</p>
          </div>

          <div className="pricing-cards">
            {Object.entries(plans).map(([key, plan]) => (
              <div key={key} className={`pricing-card ${plan.highlight ? 'featured' : ''}`}>
                {plan.highlight && <div className="featured-badge">Mais Popular</div>}
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index} className={feature.startsWith('✅') ? 'included' : 'not-included'}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className={`btn-plan ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={onAccessApp}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quem já usa? Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Quem já usa?</h2>
            <p>Veja o que nossos clientes dizem sobre o GeoRural Pro</p>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="testimonial-quote">
                "O GeoRural Pro transformou completamente meu trabalho. O que antes levava horas 
                agora faço em minutos. O desenho automatizado com IA é simplesmente incrível!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div className="author-info">
                  <div className="author-name">João Silva</div>
                  <div className="author-role">Engenheiro Agrimensor • SP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <h2>Perguntas frequentes</h2>
            <p>Tire suas dúvidas sobre o GeoRural Pro</p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-toggle">{expandedFaq === index ? '−' : '+'}</span>
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand">
                <span className="brand-icon">🌱</span>
                <span className="brand-name">GeoRural Pro</span>
              </div>
              <p>Automatize seus projetos de geolocalização rural com IA</p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Produto</h4>
                <a href="#features">Funcionalidades</a>
                <a href="#pricing">Preços</a>
                <a href="#comparison">Comparativo</a>
                <a href="#" onClick={onAccessApp}>Acessar App</a>
              </div>
              
              <div className="link-group">
                <h4>Suporte</h4>
                <a href="#faq">FAQ</a>
                <a href="#">Tutoriais</a>
                <a href="#">Contato</a>
              </div>
              
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#">Termos de Uso</a>
                <a href="#">Política de Privacidade</a>
                <a href="#">LGPD</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 GeoRural Pro. Todos os direitos reservados.</p>
            <p>Feito com 💚 para profissionais de georreferenciamento</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;