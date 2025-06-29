import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onAccessApp, onConversionLanding }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const problemsData = [
    {
      icon: '⏰',
      title: 'Processo Demorado',
      description: 'Levantamento topográfico tradicional pode levar semanas entre campo e escritório',
      impact: '8-15 dias por projeto'
    },
    {
      icon: '💸',
      title: 'Custos Elevados',
      description: 'Equipamentos caros, deslocamentos constantes e retrabalho aumentam os custos',
      impact: 'R$ 15.000+ por projeto'
    },
    {
      icon: '📐',
      title: 'Complexidade Técnica',
      description: 'Cálculos geodésicos, normas do INCRA e desenhos técnicos exigem expertise',
      impact: '90% erro humano'
    },
    {
      icon: '📋',
      title: 'Burocracia Extensa',
      description: 'Documentação, memorial descritivo e aprovações seguem processos rigorosos',
      impact: '50+ documentos'
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Upload dos Dados GNSS',
      description: 'Faça upload dos arquivos do seu receptor GPS/GNSS (RINEX, OBS, NAV)',
      icon: '📡',
      time: '2 min'
    },
    {
      step: '02', 
      title: 'Processamento com IA',
      description: 'Nossa inteligência artificial processa os dados seguindo normas do INCRA',
      icon: '🤖',
      time: '3-5 min'
    },
    {
      step: '03',
      title: 'Geração Automática',
      description: 'Desenho técnico, memorial descritivo e orçamento são gerados automaticamente',
      icon: '📄',
      time: '1 min'
    },
    {
      step: '04',
      title: 'Revisão e Entrega',
      description: 'Revise os documentos e entregue ao cliente com padrão profissional',
      icon: '✅',
      time: '5 min'
    }
  ];

  const educationalContent = [
    {
      title: 'O que é Georreferenciamento Rural?',
      content: 'É o processo de determinação das coordenadas precisas dos vértices de um imóvel rural, obrigatório por lei para propriedades acima de 100 hectares. Envolve levantamento topográfico, cálculos geodésicos e documentação técnica.',
      icon: '🎯'
    },
    {
      title: 'Por que é Obrigatório?',
      content: 'Lei 10.267/2001 exige georreferenciamento para regularização fundiária, prevenção de conflitos de terra e controle ambiental. Sem ele, não é possível vender, dividir ou financiar a propriedade.',
      icon: '⚖️'
    },
    {
      title: 'Desafios do Processo Tradicional',
      content: 'Requer equipamentos caros, conhecimento técnico avançado, cálculos complexos e domínio das normas do INCRA. Um único erro pode invalidar todo o trabalho.',
      icon: '🎯'
    },
    {
      title: 'Como a IA Resolve?',
      content: 'Nossa tecnologia automatiza cálculos geodésicos, aplica normas do INCRA automaticamente e gera toda documentação técnica, reduzindo tempo de semanas para minutos.',
      icon: '🚀'
    }
  ];

  const comparisonData = [
    { 
      aspect: 'Tempo de Execução', 
      traditional: '2-4 semanas', 
      withAi: '10-15 minutos',
      improvement: '99% mais rápido'
    },
    { 
      aspect: 'Custo por Projeto', 
      traditional: 'R$ 8.000 - R$ 25.000', 
      withAi: 'R$ 97/mês ilimitado',
      improvement: '90% mais barato'
    },
    { 
      aspect: 'Risco de Erro', 
      traditional: 'Alto (retrabalho comum)', 
      withAi: 'Quase zero (IA + validação)',
      improvement: '95% menos erros'
    },
    { 
      aspect: 'Conhecimento Técnico', 
      traditional: 'Expert obrigatório', 
      withAi: 'Interface simples',
      improvement: 'Democratiza acesso'
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
      question: 'O que é georreferenciamento e quando é obrigatório?',
      answer: 'Georreferenciamento é determinar coordenadas precisas dos limites de uma propriedade rural. É obrigatório por lei (10.267/2001) para imóveis rurais acima de 100 hectares, mas recomendado para todos os tamanhos para evitar conflitos de terra.'
    },
    {
      question: 'Como funciona o processamento com IA?',
      answer: 'Você faz upload dos dados do seu receptor GNSS, nossa IA processa as coordenadas aplicando correções geodésicas e normas do INCRA, gerando automaticamente plantas, memorial descritivo e documentação técnica completa.'
    },
    {
      question: 'Preciso ser engenheiro ou agrimensor para usar?',
      answer: 'Não! Nossa plataforma foi criada para ser simples. Qualquer pessoa pode usar, mas para assinatura de documentos oficiais você precisará de um profissional habilitado (engenheiro/agrimensor).'
    },
    {
      question: 'Os documentos são aceitos pelo INCRA e cartórios?',
      answer: 'Sim! Todos os documentos seguem rigorosamente as normas técnicas do INCRA. Já temos milhares de processos aprovados em cartórios e órgãos oficiais em todo Brasil.'
    },
    {
      question: 'E se eu já tenho os dados mas não sei como processar?',
      answer: 'Perfeito! Nossa IA foi feita exatamente para isso. Você só precisa fazer upload dos arquivos do seu levantamento GNSS e nós processamos tudo automaticamente.'
    },
    {
      question: 'Quanto tempo realmente demora um projeto completo?',
      answer: 'Do upload dos dados até ter todos os documentos prontos: 10-15 minutos. Compare com 2-4 semanas do processo tradicional. É literalmente centenas de vezes mais rápido.'
    }
  ];

  return (
    <div className="landing-page educational">
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="nav-brand">
            <span className="brand-icon">🌱</span>
            <span className="brand-name">PRECIZU</span>
          </div>
          <div className="nav-links">
            <a href="#como-funciona">Como Funciona</a>
            <a href="#casos-reais">Casos Reais</a>
            <a href="#conhecimento">Aprenda</a>
            <button className="btn-access" onClick={onAccessApp}>
              Teste Grátis
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
              <span className="badge-icon">🎓</span>
              <span>Entenda como revolucionar seu georreferenciamento</span>
            </div>
            
            <h1>
              Como a <span className="highlight">Inteligência Artificial</span> está 
              transformando o georreferenciamento rural no Brasil
            </h1>
            
            <p className="hero-subtitle">
              Descubra como profissionais estão automatizando 90% do trabalho técnico, 
              reduzindo projetos de semanas para minutos e aumentando lucros em até 500%.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">16.000+</div>
                <div className="stat-label">Profissionais usando</div>
              </div>
              <div className="stat">
                <div className="stat-number">99%</div>
                <div className="stat-label">Mais rápido</div>
              </div>
              <div className="stat">
                <div className="stat-number">R$ 2Mi+</div>
                <div className="stat-label">Economizados por clientes</div>
              </div>
            </div>
            
            <div className="hero-cta">
              <button className="btn-primary-large" onClick={onAccessApp}>
                🚀 Descobrir Como Funciona
              </button>
              <button className="btn-secondary-large" onClick={onConversionLanding}>
                💰 Ver Oferta Especial (50% OFF)
              </button>
            </div>
          </div>
          
          <div className="hero-visual educational">
            <div className="educational-preview">
              <div className="preview-header">
                <span>🤖 IA Processando Dados GNSS</span>
              </div>
              <div className="process-animation">
                <div className="process-step active">
                  <div className="step-icon">📡</div>
                  <div className="step-text">Upload RINEX</div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step processing">
                  <div className="step-icon">🧠</div>
                  <div className="step-text">IA Processando</div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-icon">📄</div>
                  <div className="step-text">Documentos Prontos</div>
                </div>
              </div>
              <div className="time-indicator">
                <span className="time-badge">⏱️ 10-15 minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Educacional: O que é Georreferenciamento */}
      <section id="conhecimento" className="education-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Entenda o Georreferenciamento Rural</h2>
            <p>Tudo que você precisa saber sobre este processo obrigatório</p>
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
            <h2>Os Desafios do Georreferenciamento Tradicional</h2>
            <p>Por que o processo atual é caro, demorado e propenso a erros</p>
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
            <h2>Como Nossa IA Resolve Estes Problemas</h2>
            <p>Processo simples e automatizado em 4 passos</p>
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
              <p>De <strong>2-4 semanas</strong> para <strong>10-15 minutos</strong></p>
              <p>De <strong>R$ 8.000-25.000</strong> para <strong>R$ 97/mês ilimitado</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação Tradicional vs IA */}
      <section className="comparison-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Método Tradicional vs Inteligência Artificial</h2>
            <p>Veja a diferença na prática</p>
          </div>
          
          <div className="comparison-table">
            <div className="table-header">
              <div className="header-cell">Aspecto</div>
              <div className="header-cell traditional">Método Tradicional</div>
              <div className="header-cell ai">Com Nossa IA</div>
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
            <p>Tire todas suas dúvidas sobre georreferenciamento e nossa solução</p>
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
            <h2>Pronto para Revolucionar seu Georreferenciamento?</h2>
            <p>Junte-se a mais de 16.000 profissionais que já automatizaram seus projetos</p>
            
            <div className="cta-options">
              <div className="cta-option">
                <h3>🆓 Teste Gratuito</h3>
                <p>Experimente todas as funcionalidades por 7 dias</p>
                <button className="btn-primary" onClick={onAccessApp}>
                  Começar Teste Gratuito
                </button>
              </div>
              
              <div className="cta-option highlighted">
                <h3>💥 Oferta Especial</h3>
                <p>50% OFF no primeiro mês + bônus exclusivos</p>
                <button className="btn-special" onClick={onConversionLanding}>
                  Ver Oferta Especial
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
              <span className="brand-name">PRECIZU</span>
            </div>
            <p>Transformando o georreferenciamento rural com inteligência artificial</p>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>Aprenda</h4>
              <a href="#conhecimento">O que é Georreferenciamento</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#casos-reais">Casos de Sucesso</a>
            </div>
            
            <div className="link-group">
              <h4>Produto</h4>
              <a href="#" onClick={onAccessApp}>Teste Grátis</a>
              <a href="#" onClick={onConversionLanding}>Oferta Especial</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Precizu. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;