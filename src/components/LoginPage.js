import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../hooks/useAuth';

const LoginPage = ({ onLoginSuccess, onBackToLanding }) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        
        // Se temos dados do usuário, fazer login mesmo com erro
        if (data?.user) {
          onLoginSuccess(data.user);
        } else if (error) {
          throw error;
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password, {
          name: formData.name
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        } else {
          setError('Verifique seu email para confirmar a conta');
        }
      }
    } catch (error) {
      setError(error.message || 'Erro ao fazer login/cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <style jsx>{`
        @media (max-width: 768px) {
          .login-container {
            padding: 1rem !important;
          }
          
          .brand-title {
            font-size: 1.5rem !important;
          }
          
          .card-content {
            padding: 1rem !important;
          }
        }
      `}</style>
      <div className="w-full max-w-md login-container">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-2">🌱</span>
              <span className="text-2xl font-bold text-green-800 brand-title">OnGeo</span>
            </div>
            <CardTitle className="text-xl">
              {isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Acesse sua conta para continuar' : 'Crie uma nova conta para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Seu nome completo"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Sua senha"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-sm text-gray-600 hover:underline"
              >
                ← Voltar ao site
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;