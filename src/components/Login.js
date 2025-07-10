import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { auth } from '../config/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';

const Login = ({ onLoginSuccess, onBackToLanding, onEmailConfirmationRequired }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await auth.signIn(formData.email, formData.password);
        if (error) throw error;
        onLoginSuccess(data.user);
      } else {
        const { data, error } = await auth.signUp(formData.email, formData.password, {
          name: formData.name
        });
        if (error) throw error;

        // Se usuário foi criado, sempre redirecionar para confirmação de email
        // (mesmo que email confirmations estejam desabilitadas, para consistência)
        if (data.user) {
          onEmailConfirmationRequired(formData.email);
          return;
        }
      }
    } catch (error) {
      setError(error.message);
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

  const confirmModal = (
    <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirme seu email</DialogTitle>
          <DialogDescription>
            Enviamos um link de confirmação para <strong>{pendingEmail}</strong>.<br/>
            Clique no link para ativar sua conta.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 mt-4">
          <Button
            type="button"
            onClick={async () => {
              await auth.resendConfirmation(pendingEmail);
              alert('Novo email de confirmação enviado!');
            }}
          >Reenviar email</Button>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-800">
              OnGeo
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Faça login em sua conta' : 'Crie sua conta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                className="w-full"
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
      {confirmModal}
    </div>
  );
};

export default Login;