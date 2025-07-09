import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onAccessApp, onConversionLanding }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const problemsData = [
    {
      icon: '⏰',
      title: 'Tempo Perdido em Cálculos',
      description: 'Horas calculando orçamentos manualmente, sujeito a erros e retrabalho',
      impact: '4-6 horas por orçamento'
    },
    {
      icon: '💸',
      title: 'Erros de Estimativa',
      description: 'Dificuldade em precificar corretamente leva a prejuízos ou perda de clientes',
      impact: '30% erro na precificação'
    },
    {
      icon: '📐',
      title: 'Processamento Manual',
      description: 'Análise de dados GNSS complexa e demorada, limitando produtividade',
      impact: '2-3 análises por dia'
    },
    {
      icon: '📋',
      title: 'Documentação Inconsistente',
      description: 'Relatórios e propostas variam em qualidade, afetando imagem profissional',
      impact: 'Perda de credibilidade'
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Inserir Dados do Cliente',
      description: 'Preencha informações básicas da propriedade e tipo de serviço',
      icon: '📝',
      time: '2 min'
    },
    {
      step: '02', 
      title: 'IA Calcula Orçamento',
      description: 'Nossa inteligência artificial analisa e gera orçamento personalizado',
      icon: '🤖',
      time: 'Instantâneo'
    },
    {
      step: '03',
      title: 'Análise GNSS (Opcional)',
      description: 'Upload de dados RINEX para análise técnica e relatório profissional',
      icon: '📡',
      time: '5 min'
    },
    {
      step: '04',
      title: 'Documentos Prontos',
      description: 'Propostas e relatórios técnicos gerados automaticamente',
      icon: '📄',
      time: 'Instantâneo'
    }
  ];

  const educationalContent = [
    {
      title: 'Cálculo Inteligente de Orçamentos',
      content: 'Nossa IA analisa propriedades, localização, complexidade e dados técnicos para gerar orçamentos precisos automaticamente, eliminando erros de estimativa.',
      icon: '💰'
    },
    {
      title: 'Processamento de Dados GNSS',
      content: 'Upload de arquivos RINEX e geração automática de relatórios técnicos profissionais com análise geodésica completa e conformidade INCRA.',
      icon: '📡'
    },
    {
      title: 'Documentação Automática',
      content: 'Gera propostas comerciais, relatórios técnicos e documentação profissional automaticamente, padronizando seu trabalho e economizando horas.',
      icon: '📊'
    },
    {
      title: 'Gestão Profissional',
      content: 'Dashboard completo para acompanhar projetos, histórico de análises e métricas de performance, facilitando a gestão do seu negócio.',
      icon: '📈'
    }
  ];

  const comparisonData = [
    { 
      aspect: 'Cálculo de Orçamentos', 
      traditional: '4-6 horas por projeto', 
      withAi: '2 minutos automático',
      improvement: '95% mais rápido'
    },
    { 
      aspect: 'Análise GNSS', 
      traditional: 'Processo manual complexo', 
      withAi: 'Upload + relatório automático',
      improvement: 'Completamente automatizado'
    },
    { 
      aspect: 'Precisão de Cálculos', 
      traditional: 'Sujeito a erro humano', 
      withAi: 'Algoritmos validados',
      improvement: '100% precisão'
    },
    { 
      aspect: 'Documentação', 
      traditional: 'Criação manual variável', 
      withAi: 'Templates profissionais',
      improvement: 'Padronização total'
    }
  ];

  const realCases = [
    {
      title: 'Fazenda São João - 450 hectares',
      challenge: 'Georreferenciamento urgente para financiamento agrícola',
      solution: 'Processamento completo em 12 minutos com nossa IA',
      result: 'Cliente conseguiu financiamento 3 semanas antes do previsto',
      savings: 'Economizou R$ 18.000 vs método tradicional'
    },
    {
      title: 'Sítio Vale Verde - 180 hectares', 
      challenge: 'Regularização para venda com prazo apertado',
      solution: 'Upload de dados GNSS às 14h, documentos prontos às 14h15',
      result: 'Venda concretizada no prazo',
      savings: 'Economizou 25 dias de trabalho'
    },
    {
      title: 'Agrimensor João Silva',
      challenge: 'Aumentar produtividade e reduzir custos operacionais',
      solution: 'Automatizou 90% dos projetos com nossa plataforma',
      result: 'Aumentou de 2 para 12 projetos por mês',
      savings: 'Faturamento aumentou 500%'
    }
  ];

  const expertiseAreas = [
    {
      title: 'Normas Técnicas do INCRA',
      description: 'Nossa IA domina completamente as normas técnicas INCRA, incluindo precisões geodésicas, sistemas de referência e padrões de documentação.',
      features: ['Precisão geodésica automática', 'Sistema SIRGAS 2000', 'Memorial descritivo padrão INCRA']
    },
    {
      title: 'Processamento de Dados GNSS',
      description: 'Suporte completo a receptores GPS/GNSS, processamento PPP (Posicionamento por Ponto Preciso) e correção de coordenadas.',
      features: ['Arquivos RINEX, OBS, NAV', 'Integração PPP/IBGE', 'Correção atmosférica automática']
    },
    {
      title: 'Geração de Documentos',
      description: 'Criação automática de toda documentação técnica necessária para aprovação no INCRA e cartórios.',
      features: ['Plantas topográficas', 'Memorial descritivo', 'Planilha de coordenadas', 'ART/RRT automático']
    }
  ];

  const faqs = [
    {
      question: 'Como a IA ajuda no cálculo de orçamentos?',
      answer: 'Nossa IA analisa automaticamente dados da propriedade, localização, complexidade técnica e tipo de serviço para gerar orçamentos precisos em segundos, eliminando erros de estimativa.'
    },
    {
      question: 'O que acontece quando faço upload de dados GNSS?',
      answer: 'Você faz upload dos arquivos RINEX e nossa IA processa automaticamente, gerando relatórios técnicos profissionais com análise geodésica completa, DOP, precisão e conformidade INCRA.'
    },
    {
      question: 'Preciso ser especialista para usar a ferramenta?',
      answer: 'Não! O assistente IA foi desenvolvido para ser intuitivo. Qualquer profissional da área pode usar facilmente, mas você continua sendo o responsável técnico pelos projetos.'
    },
    {
      question: 'Os relatórios seguem padrões profissionais?',
      answer: 'Sim! Todos os documentos seguem rigorosamente as normas técnicas do INCRA e padrões profissionais. Os relatórios incluem análise DOP, precisão geodésica e parecer técnico.'
    },
    {
      question: 'Posso usar para otimizar meu processo atual?',
      answer: 'Exato! A ferramenta foi criada para complementar seu trabalho, automatizando tarefas repetitivas como cálculos e documentação, permitindo que você foque no que realmente importa.'
    },
    {
      question: 'Quanto tempo economizo usando o assistente?',
      answer: 'Em orçamentos: de 6 horas para 2 minutos. Em análise GNSS: de processamento manual para relatório automático. Isso significa mais tempo para prospectar clientes e crescer seu negócio.'
    }
  ];

  return (
    <div className="landing-page educational">
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="nav-brand">
            <span className="brand-icon">🌱</span>
            <span className="brand-name">OnGeo</span>
          </div>
          <div className="nav-links">
            <a href="#como-funciona">Como Funciona</a>
            <a href="#casos-reais">Casos Reais</a>
            <a href="#conhecimento">Aprenda</a>
            <button className="btn-access" onClick={onAccessApp}>
              Acessar Sistema
            </button>
            <button className="btn-conversion" onClick={onConversionLanding}>
              Ver Oferta Especial
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section - Educacional */}
      <section className="hero educational">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-icon">🤖</span>
              <span>Suporte IA para profissionais</span>
            </div>
            
            <h1>
              <span className="highlight">Assistente IA</span> para 
              Profissionais de Georreferenciamento
            </h1>
            
            <p className="hero-subtitle">
              Ferramenta inteligente que ajuda profissionais da área a gerenciar orçamentos, 
              processar dados GNSS e criar documentação técnica de forma mais eficiente.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">90%</div>
                <div className="stat-label">Menos tempo em cálculos</div>
              </div>
              <div className="stat">
                <div className="stat-number">100%</div>
                <div className="stat-label">Precisão técnica</div>
              </div>
              <div className="stat">
                <div className="stat-number">15min</div>
                <div className="stat-label">Para gerar orçamentos</div>
              </div>
            </div>
            
            <div className="hero-cta">
              <button className="btn-primary-large" onClick={onAccessApp}>
                🤖 Acessar Assistente IA
              </button>
              <button className="btn-secondary-large" onClick={onConversionLanding}>
                📊 Ver Demonstração
              </button>
            </div>
          </div>
          
          <div className="hero-visual educational">
            <div className="educational-preview">
              <div className="preview-header">
                <span>🤖 Assistente IA em Ação</span>
              </div>
              <div className="process-animation">
                <div className="process-step active">
                  <div className="step-icon">💰</div>
                  <div className="step-text">Dados do Cliente</div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step processing">
                  <div className="step-icon">🧠</div>
                  <div className="step-text">IA Calculando</div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-icon">📊</div>
                  <div className="step-text">Orçamento + PDF</div>
                </div>
              </div>
              <div className="time-indicator">
                <span className="time-badge">⏱️ Instantâneo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Educacional: O que é Georreferenciamento */}
      <section id="conhecimento" className="education-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Suporte Inteligente para Profissionais</h2>
            <p>Como nossa IA ajuda você a ser mais eficiente e preciso</p>
          </div>
          
          <div className="education-grid">
            {educationalContent.map((item, index) => (
              <div key={index} className="education-card">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problemas do Método Tradicional */}
      <section className="problems-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Desafios dos Profissionais da Área</h2>
            <p>Problemas comuns que nossa IA ajuda a resolver</p>
          </div>
          
          <div className="problems-grid">
            {problemsData.map((problem, index) => (
              <div key={index} className="problem-card">
                <div className="problem-icon">{problem.icon}</div>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
                <div className="impact-badge">{problem.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona Nossa Solução */}
      <section id="como-funciona" className="process-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Como Nosso Assistente IA Funciona</h2>
            <p>Ferramenta simples que otimiza seu trabalho diário</p>
          </div>
          
          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <div className="step-header">
                    <h3>{step.title}</h3>
                    <div className="step-time">{step.time}</div>
                  </div>
                  <p>{step.description}</p>
                  <div className="step-icon">{step.icon}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="process-summary">
            <div className="summary-card">
              <h4>Resultado Final:</h4>
              <p>De <strong>6 horas</strong> para <strong>15 minutos</strong> por orçamento</p>
              <p>De <strong>análise manual</strong> para <strong>relatórios automáticos</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação Tradicional vs IA */}
      <section className="comparison-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Trabalho Manual vs Assistente IA</h2>
            <p>Compare a eficiência na prática</p>
          </div>
          
          <div className="comparison-table">
            <div className="table-header">
              <div className="header-cell">Aspecto</div>
              <div className="header-cell traditional">Método Manual</div>
              <div className="header-cell ai">Com Assistente IA</div>
              <div className="header-cell improvement">Melhoria</div>
            </div>
            
            {comparisonData.map((row, index) => (
              <div key={index} className="table-row">
                <div className="cell aspect">{row.aspect}</div>
                <div className="cell traditional">{row.traditional}</div>
                <div className="cell ai">{row.withAi}</div>
                <div className="cell improvement">{row.improvement}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Casos Reais */}
      <section id="casos-reais" className="cases-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Casos Reais de Sucesso</h2>
            <p>Veja como nossos clientes transformaram seus resultados</p>
          </div>
          
          <div className="cases-grid">
            {realCases.map((case_item, index) => (
              <div key={index} className="case-card">
                <h3>{case_item.title}</h3>
                <div className="case-challenge">
                  <strong>Desafio:</strong> {case_item.challenge}
                </div>
                <div className="case-solution">
                  <strong>Solução:</strong> {case_item.solution}
                </div>
                <div className="case-result">
                  <strong>Resultado:</strong> {case_item.result}
                </div>
                <div className="case-savings">
                  💰 {case_item.savings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Técnica */}
      <section className="expertise-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Nossa Expertise Técnica</h2>
            <p>Tecnologia avançada que você pode confiar</p>
          </div>
          
          <div className="expertise-grid">
            {expertiseAreas.map((area, index) => (
              <div key={index} className="expertise-card">
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <ul className="features-list">
                  {area.features.map((feature, fIndex) => (
                    <li key={fIndex}>✅ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Educacional */}
      <section className="faq-section educational">
        <div className="section-content">
          <div className="section-header">
            <h2>Perguntas Frequentes</h2>
            <p>Tire suas dúvidas sobre como nosso assistente IA pode ajudar você</p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}>
                <button 
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-toggle">{expandedFaq === index ? '−' : '+'}</span>
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="final-cta">
        <div className="section-content">
          <div className="cta-content">
            <h2>Pronto para Otimizar seu Trabalho?</h2>
            <p>Experimente nosso assistente IA e transforme sua produtividade</p>
            
            <div className="cta-options">
              <div className="cta-option">
                <h3>🤖 Acessar Ferramenta</h3>
                <p>Comece a usar o assistente IA agora mesmo</p>
                <button className="btn-primary" onClick={onAccessApp}>
                  Acessar Sistema
                </button>
              </div>
              
              <div className="cta-option highlighted">
                <h3>📊 Ver Demonstração</h3>
                <p>Veja como a ferramenta funciona na prática</p>
                <button className="btn-special" onClick={onConversionLanding}>
                  Ver Demo Completa
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-icon">🌱</span>
              <span className="brand-name">OnGeo</span>
            </div>
            <p>Assistente IA para profissionais de georreferenciamento</p>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>Recursos</h4>
              <a href="#conhecimento">Funcionalidades</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#casos-reais">Casos de Sucesso</a>
            </div>
            
            <div className="link-group">
              <h4>Acesso</h4>
              <a href="#" onClick={onAccessApp}>Entrar / Cadastrar</a>
              <a href="#" onClick={onConversionLanding}>Ver Demonstração</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 OnGeo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;