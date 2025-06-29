import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { auth, db } from '../config/supabase';

const testimonials = [
  {
    name: "João Silva",
    role: "Eng. Agrimensor",
    text: "Automatizei 90% do meu trabalho. De 8 horas para 45 minutos por projeto!",
    result: "Aumentou faturamento em 300%",
    beforeAfter: "De R$ 8.000/mês para R$ 32.000/mês",
    avatar: "👨‍💼"
  },
  {
    name: "Maria Santos", 
    role: "Topógrafa",
    text: "Antes demorava 2 dias para fazer uma proposta. Agora faço em 10 minutos.",
    result: "Fechou 5x mais contratos",
    beforeAfter: "De 3 para 15 projetos/mês",
    avatar: "👩‍💼"
  },
  {
    name: "Carlos Oliveira",
    role: "Geógrafo",
    text: "O desenho automático é incrível. Meus clientes ficam impressionados.",
    result: "Cobrou 40% mais caro",
    beforeAfter: "De R$ 3.500 para R$ 5.000 por projeto",
    avatar: "👨‍🔬"
  },
  {
    name: "Ana Costa",
    role: "Consultora Rural",
    text: "Consegui atender 3x mais clientes com a mesma equipe. Revolucionou meu negócio!",
    result: "Triplicou o faturamento",
    beforeAfter: "De R$ 15.000/mês para R$ 45.000/mês",
    avatar: "👩‍🌾"
  }
];

const urgencyReasons = [
  {
    icon: "📈",
    title: "Concorrência Crescendo",
    description: "Cada dia mais profissionais descobrem a IA. Saia na frente!",
    stat: "+2.000 novos usuários/mês"
  },
  {
    icon: "💰",
    title: "Preço Subindo",
    description: "Última oportunidade com desconto de 50%. Depois volta ao preço normal.",
    stat: "Economia de R$ 582 no primeiro ano"
  },
  {
    icon: "🔒",
    title: "Vagas Limitadas",
    description: "Apenas 500 vagas disponíveis com suporte prioritário.",
    stat: "Restam 127 vagas"
  }
];

const socialProof = [
  { metric: "16.847", label: "Profissionais Usando", trend: "+2.341 esta semana" },
  { metric: "R$ 2.1Mi", label: "Economizados por Clientes", trend: "+R$ 450k este mês" },
  { metric: "99%", label: "Taxa de Aproveitamento", trend: "Projetos finalizados" },
  { metric: "4.9★", label: "Avaliação Média", trend: "1.247 avaliações" }
];

const benefits = [
  {
    icon: "⚡",
    title: "Resultados Imediatos",
    description: "Seu primeiro projeto automatizado em 15 minutos"
  },
  {
    icon: "🏆",
    title: "Vantagem Competitiva",
    description: "Seja o primeiro da sua região com IA"
  },
  {
    icon: "💎",
    title: "Qualidade Premium",
    description: "Documentos profissionais que impressionam"
  },
  {
    icon: "🚀",
    title: "Escalabilidade",
    description: "Atenda 10x mais clientes com a mesma equipe"
  }
];

const ConversionLanding = ({ onAccessApp, onBackToEducational }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hora
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showVideo, setShowVideo] = useState(false);
  const [currentSocialProof, setCurrentSocialProof] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 3600); // Reinicia quando chega a 0
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSocialProof(prev => (prev + 1) % socialProof.length);
    }, 3000);
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
    
    setIsSubmitted(true);
    
    // Simular envio para backend
    setTimeout(() => {
      onAccessApp();
    }, 2000);
  };

  const calculateSavings = () => {
    const traditionalCost = 15000; // Custo médio processo tradicional
    const ourCost = 97 * 12; // Nosso custo anual
    return traditionalCost - ourCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Barra de Urgência Ultra */}
      <div className="bg-red-600 text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="animate-pulse text-lg">🚨</span>
              <span>OFERTA ESPECIAL TERMINA EM:</span>
            </div>
            <div className="bg-white text-red-600 px-4 py-2 rounded-lg font-mono text-lg">
              {formatTime(timeLeft)}
            </div>
            <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 animate-bounce">
              50% OFF + BÔNUS EXCLUSIVOS!
            </Badge>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-green-600">PRECIZU</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBackToEducational}>
                ← Voltar para Educacional
              </Button>
              <Button variant="outline" onClick={() => setShowLoginModal(true)}>
                👤 Já sou cliente
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Social Proof Bar */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">🔥</span>
              <span><strong>{socialProof[currentSocialProof].metric}</strong> {socialProof[currentSocialProof].label}</span>
            </div>
            <div className="text-muted-foreground">
              {socialProof[currentSocialProof].trend}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Ultra Conversão */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-2">
                <Badge variant="destructive" className="w-fit animate-pulse">
                  <span className="mr-2">⚠️</span>
                  ÚLTIMA CHANCE - Oferta Expira Hoje!
                </Badge>
                
                <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="text-red-600">PARE</span> de Perder 
                  <span className="text-green-600"> R$ 10.000+</span> por Mês!
                </h1>
                
                <p className="text-2xl text-gray-700 font-medium">
                  Descubra como <strong className="text-green-600">16.847 profissionais</strong> estão 
                  faturando <strong className="text-red-600">300% mais</strong> automatizando georreferenciamento
                </p>
              </div>

              {/* Contador de Urgência */}
              <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">⏰</span>
                  <div>
                    <h3 className="font-bold text-red-700">ATENÇÃO: Oferta Limitada!</h3>
                    <p className="text-red-600">Apenas <strong>127 vagas restantes</strong> com desconto de 50%</p>
                  </div>
                </div>
              </div>

              {/* Benefícios Imediatos */}
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-2xl">{benefit.icon}</span>
                    <div>
                      <h4 className="font-bold text-green-700">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Principal */}
              <div className="bg-green-100 p-6 rounded-lg border-2 border-green-300">
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  🎁 OFERTA ESPECIAL: 50% OFF + BÔNUS!
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Plano Profissional (12 meses)</span>
                    <span className="line-through text-red-500">R$ 1.164</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Preço Promocional</span>
                    <span className="text-green-600">R$ 582</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <strong>Economia de R$ 582</strong> + Bônus Exclusivos!
                  </div>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 font-bold animate-pulse"
                  onClick={() => setShowVideo(true)}
                >
                  🚀 QUERO GARANTIR MINHA VAGA (50% OFF)
                </Button>
                <p className="text-center text-sm text-gray-600 mt-2">
                  ✅ Sem compromisso • ✅ Cancele quando quiser • ✅ Garantia de 30 dias
                </p>
              </div>
            </div>
            
            {/* Lado Direito - Vídeo/Demonstração */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-8 text-center">
                    <span className="text-4xl mb-4 block">🎥</span>
                    <h4 className="text-white font-bold mb-2">
                      Vídeo: Como Ganhar R$ 10.000+ por Mês
                    </h4>
                    <p className="text-gray-300 text-sm mb-4">
                      Demonstração real de como automatizar 90% do trabalho
                    </p>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                      onClick={() => setShowVideo(true)}
                    >
                      ▶️ ASSISTIR AGORA (Grátis)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Urgência Lateral */}
              <div className="space-y-4">
                {urgencyReasons.map((reason, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-400">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{reason.icon}</span>
                      <div>
                        <h4 className="font-bold text-orange-700">{reason.title}</h4>
                        <p className="text-sm text-gray-600">{reason.description}</p>
                        <p className="text-xs text-orange-600 font-medium mt-1">{reason.stat}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Testemunhos Melhorada */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Veja Como Eles <span className="text-green-600">Triplicaram</span> o Faturamento
            </h2>
            <p className="text-xl text-gray-600">
              Resultados reais de profissionais que saíram na frente
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <CardTitle className="text-green-800">{testimonial.name}</CardTitle>
                      <CardDescription className="font-medium">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <blockquote className="text-gray-700 italic border-l-4 border-green-500 pl-4">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="font-bold text-green-800">{testimonial.result}</div>
                    <div className="text-sm text-green-700">{testimonial.beforeAfter}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Captura Melhorado */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-2 border-blue-300 shadow-2xl">
            <CardHeader className="bg-blue-600 text-white text-center">
              <CardTitle className="text-3xl font-bold">
                🎁 GARANTIR VAGA COM 50% OFF
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Últimas <strong>127 vagas</strong> disponíveis hoje
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-lg font-semibold">Nome Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="text-lg p-4 border-2 border-blue-300"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-lg font-semibold">Email Profissional *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="text-lg p-4 border-2 border-blue-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-lg font-semibold">WhatsApp (Opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="text-lg p-4 border-2 border-blue-300"
                    />
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-800 mb-2">🎯 O que você recebe hoje:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>✅ Acesso completo por 7 dias GRÁTIS</li>
                      <li>✅ 50% OFF no primeiro ano (economia de R$ 582)</li>
                      <li>✅ Bônus: Curso de Georreferenciamento com IA (R$ 497)</li>
                      <li>✅ Suporte prioritário por WhatsApp</li>
                      <li>✅ Garantia de 30 dias ou dinheiro de volta</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xl py-6 font-bold"
                    disabled={!email || !name}
                  >
                    🚀 GARANTIR MINHA VAGA COM 50% OFF
                  </Button>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      🔒 Seus dados estão 100% seguros e protegidos
                    </p>
                    <p className="text-xs text-gray-500">
                      Sem compromisso • Cancele quando quiser • Garantia de 30 dias
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600">
                    Parabéns! Sua vaga foi garantida!
                  </h3>
                  <p className="text-gray-600">
                    Redirecionando você para a plataforma em instantes...
                  </p>
                  <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção de Garantia e Segurança */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Sua Satisfação é <span className="text-green-600">100% Garantida</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-bold text-lg mb-2">Garantia de 30 Dias</h3>
              <p className="text-gray-600">
                Não ficou satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold text-lg mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600">
                Seus dados estão protegidos com criptografia de nível bancário.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-bold text-lg mb-2">Suporte Premium</h3>
              <p className="text-gray-600">
                Suporte prioritário por WhatsApp, 7 dias por semana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Login */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar na sua conta</DialogTitle>
            <DialogDescription>
              Acesse sua conta para continuar usando o PRECIZU
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); onAccessApp(); }} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Sua senha"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold">PRECIZU</span>
          </div>
          <p className="text-gray-400 mb-4">
            Transformando o georreferenciamento rural com inteligência artificial
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Termos de Uso</a>
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConversionLanding;