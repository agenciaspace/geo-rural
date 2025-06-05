import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { auth, db } from '../config/supabase';

const ConversionLanding = ({ onAccessApp }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) return;
    
    try {
      // Salvar lead no Supabase
      const { data, error } = await db.leads.create({
        name,
        email,
        source: 'landing_page',
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });
      
      if (error) {
        console.error('Erro ao salvar lead:', error);
      } else {
        console.log('Lead salvo com sucesso:', data);
      }
    } catch (error) {
      console.error('Erro ao processar lead:', error);
    }
    
    setIsSubmitted(true);
    
    setTimeout(() => {
      onAccessApp();
    }, 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return;
    
    try {
      const { data, error } = await auth.signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('Erro no login:', error.message);
        // Aqui você pode mostrar uma mensagem de erro ao usuário
        alert('Erro no login: ' + error.message);
        return;
      }
      
      console.log('Login realizado com sucesso:', data);
      setShowLoginModal(false);
      onAccessApp();
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      alert('Erro inesperado. Tente novamente.');
    }
  };

  const handleDialogChange = (open) => {
    setShowLoginModal(open);
    if (!open) {
      setLoginData({ email: '', password: '' });
    }
  };

  const testimonials = [
    {
      name: "João Silva",
      role: "Eng. Agrimensor",
      text: "Automatizei 90% do meu trabalho. De 8 horas para 45 minutos por projeto!",
      result: "Aumentou faturamento em 300%"
    },
    {
      name: "Maria Santos", 
      role: "Topógrafa",
      text: "Antes demorava 2 dias para fazer uma proposta. Agora faço em 10 minutos.",
      result: "Fechou 5x mais contratos"
    },
    {
      name: "Carlos Oliveira",
      role: "Geógrafo",
      text: "O desenho automático é incrível. Meus clientes ficam impressionados.",
      result: "Cobrou 40% mais caro"
    }
  ];

  const benefits = [
    "Desenhos automáticos com IA em 5 minutos",
    "Propostas profissionais em PDF instantâneo", 
    "Orçamentos precisos em 30 segundos",
    "100% compatível com INCRA GEO"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Barra de Urgência */}
      <div className="bg-destructive text-destructive-foreground py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <span>⏰</span>
            <span>
              <strong>OFERTA ESPECIAL</strong> termina em: <span className="font-mono">{formatTime(timeLeft)}</span>
            </span>
            <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
              50% OFF no primeiro mês!
            </Badge>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold">GeoRural Pro</span>
            </div>
            
            <Button variant="outline" onClick={() => setShowLoginModal(true)}>
              👤 Já sou cliente
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                <span className="mr-2">🚀</span>
                Mais de 16.000 profissionais já usam
              </Badge>
              
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Pare de Perder <span className="text-destructive">Dinheiro</span> com 
                  <span className="text-primary"> Processos Manuais</span>
                </h1>
                
                <p className="text-xl text-muted-foreground">
                  Automatize 90% do seu trabalho de georreferenciamento com IA. 
                  <strong className="text-foreground"> De 8 horas para 45 minutos por projeto.</strong>
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✅</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Formulário de Captura */}
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-center">🎁 Acesso GRATUITO por 7 dias</CardTitle>
                  <CardDescription className="text-center">
                    Sem cartão de crédito • Cancele quando quiser
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {!isSubmitted ? (
                    <form id="lead-form" onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome completo</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Seu melhor e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" size="lg" className="w-full">
                        🚀 QUERO TESTAR GRÁTIS AGORA
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        ✅ 7 dias grátis • ✅ Sem compromisso • ✅ Suporte incluído
                      </p>
                    </form>
                  ) : (
                    <div className="text-center space-y-4 py-8">
                      <div className="text-6xl">✅</div>
                      <h3 className="text-xl font-semibold">Sucesso! Preparando seu acesso...</h3>
                      <p className="text-muted-foreground">Redirecionando para a plataforma em instantes...</p>
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Proof */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">16K+</div>
                  <div className="text-sm text-muted-foreground">Usuários</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">500K+</div>
                  <div className="text-sm text-muted-foreground">Projetos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">4.9★</div>
                  <div className="text-sm text-muted-foreground">Avaliação</div>
                </div>
              </div>
            </div>

            {/* Demo Visual */}
            <div className="lg:pl-8">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">🤖 IA</Badge>
                    <CardTitle>Desenho Automático</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background rounded-lg p-4 space-y-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Processando coordenadas GNSS...<br/>
                      <strong>Tempo estimado: 2 minutos</strong>
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="text-green-500 text-xl">✅</div>
                    <div>
                      <p className="font-medium text-green-800">Desenho técnico gerado!</p>
                      <p className="text-sm text-green-600">Economia: 6h 30min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testemunho Rotativo */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <blockquote className="text-xl italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div>
                <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</p>
              </div>
              <Badge variant="outline" className="text-primary">
                🎯 Resultado: {testimonials[currentTestimonial].result}
              </Badge>
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problema vs Solução */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  ❌ Método Tradicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">🕐 8+ horas por projeto</li>
                  <li className="flex items-center gap-2 text-sm">💰 Orçamentos imprecisos</li>
                  <li className="flex items-center gap-2 text-sm">📐 Desenhos manuais lentos</li>
                  <li className="flex items-center gap-2 text-sm">😰 Stress e retrabalho</li>
                </ul>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-xl font-bold">
                VS
              </div>
            </div>
            
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  ✅ Com GeoRural Pro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">⚡ 45 minutos automatizado</li>
                  <li className="flex items-center gap-2 text-sm">🎯 Precisão de centavos</li>
                  <li className="flex items-center gap-2 text-sm">🤖 IA desenha sozinha</li>
                  <li className="flex items-center gap-2 text-sm">😌 Trabalho tranquilo</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">
              Comece <span className="text-primary">Grátis</span> Hoje
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Teste Grátis</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">R$ 0</div>
                  <div className="text-sm text-muted-foreground">por 7 dias</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">✅ Acesso completo</li>
                  <li className="flex items-center gap-2">✅ Desenhos ilimitados</li>
                  <li className="flex items-center gap-2">✅ Suporte incluído</li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => document.querySelector('#lead-form').scrollIntoView()}>
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                🔥 MAIS POPULAR
              </Badge>
              <CardHeader className="text-center pt-8">
                <CardTitle>Profissional</CardTitle>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground line-through">R$ 194</div>
                  <div className="text-3xl font-bold text-primary">R$ 97</div>
                  <div className="text-sm text-muted-foreground">/mês</div>
                  <Badge variant="secondary">Economize R$ 97</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">✅ Tudo do grátis</li>
                  <li className="flex items-center gap-2">✅ Desenhos com sua marca</li>
                  <li className="flex items-center gap-2">✅ Suporte prioritário</li>
                  <li className="flex items-center gap-2">✅ API integração</li>
                </ul>
                <Button className="w-full" onClick={() => document.querySelector('#lead-form').scrollIntoView()}>
                  Quero 50% OFF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Por Projeto</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">R$ 47</div>
                  <div className="text-sm text-muted-foreground">por desenho</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">✅ Sem mensalidade</li>
                  <li className="flex items-center gap-2">✅ Pague apenas quando usar</li>
                  <li className="flex items-center gap-2">✅ Entrega em 24h</li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => document.querySelector('#lead-form').scrollIntoView()}>
                  Testar Primeiro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Pare de Perder Tempo e Dinheiro</h2>
          <p className="text-xl opacity-90">Junte-se a 16.000+ profissionais que já automatizaram seu trabalho</p>
          
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => document.querySelector('#lead-form').scrollIntoView()}>
            🚀 COMEÇAR GRÁTIS AGORA
          </Button>
          
          <div className="flex justify-center gap-6 text-sm opacity-90">
            <span>✅ 7 dias grátis</span>
            <span>✅ Sem cartão</span>
            <span>✅ Cancele quando quiser</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 GeoRural Pro • Todos os direitos reservados
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Button variant="ghost" size="sm">Política de Privacidade</Button>
              <Button variant="ghost" size="sm">Termos de Uso</Button>
              <Button variant="ghost" size="sm">Contato</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                Área do Cliente
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Login */}
      <Dialog open={showLoginModal} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🔐 Área do Cliente
            </DialogTitle>
            <DialogDescription>
              Faça login para acessar sua conta
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              🚀 Acessar Plataforma
            </Button>
          </form>
          
          <Separator />
          
          <div className="space-y-2 text-center text-sm">
            <p>Esqueceu sua senha? <Button variant="link" className="p-0 h-auto">Clique aqui</Button></p>
            <p>Não tem conta ainda? <Button variant="link" className="p-0 h-auto" onClick={() => setShowLoginModal(false)}>Teste grátis</Button></p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversionLanding;