# OnGeo 🌱

Plataforma completa de georreferenciamento rural com IA, simulador de orçamentos e análise GNSS.

## 🚀 Desenvolvimento Local (Início Rápido)

Para rodar o projeto localmente para testes e desenvolvimento:

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- npm

### Setup Automatizado
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/ongeo.git
cd ongeo

# 2. Configure o ambiente
./dev-setup.sh

# 3. Inicie o projeto  
./dev-start.sh
```

**Acesse**: http://localhost:3000 (Frontend) | http://localhost:8000 (Backend)

📖 **Guia Completo**: [DEV-LOCAL-GUIDE.md](./DEV-LOCAL-GUIDE.md)

## ✨ Funcionalidades

- 🎯 **Landing Page Otimizada**: Captura de leads com timer de urgência
- 📊 **Simulador de Orçamento**: Cálculo automático de preços por região
- 📡 **Análise GNSS**: Upload e análise de arquivos RINEX
- 🔐 **Autenticação**: Sistema completo com Supabase Auth
- 📱 **Dashboard**: Controle de orçamentos e análises
- ☁️ **Storage**: Upload seguro de arquivos

## 🚀 Deploy Rápido

### 1. Clone e Configure
```bash
git clone https://github.com/seu-usuario/ongeo.git
cd ongeo
```

### 2. Configure o Supabase
1. Crie um projeto em https://supabase.com
2. Execute os scripts SQL em `supabase/`
3. Configure `.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
# Edite com suas chaves do Supabase
```

### 3. Deploy na Vercel
```bash
# Automático
./deploy.sh

# Ou manual
npm install -g vercel
vercel --prod
```

### 4. Configure Variáveis na Vercel
No painel da Vercel, adicione:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
cd frontend && npm install

# Iniciar desenvolvimento
npm start
```

## 📁 Estrutura do Projeto

```
ongeo/
├── api/                 # Vercel Functions (Python)
├── frontend/            # React App com shadcn/ui
├── supabase/           # Scripts SQL do banco
├── vercel.json         # Configuração Vercel
└── docs/               # Documentação
```

## 🔧 Solução de Problemas

### Erro 404 na Vercel
1. Verifique a configuração do projeto
2. Configure as variáveis de ambiente
3. Consulte `VERCEL-TROUBLESHOOTING.md`

### Erro de Autenticação
1. Verifique as chaves do Supabase
2. Configure URLs no painel do Supabase
3. Consulte `SUPABASE-SETUP.md`

## 📚 Documentação

- [Configuração Supabase](./SUPABASE-SETUP.md)
- [Deploy Vercel](./README-DEPLOY.md)
- [Solução de Problemas](./VERCEL-TROUBLESHOOTING.md)

## 🏗️ Tecnologias

- **Frontend**: React, shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel (Frontend + Serverless Functions)
- **Análise GNSS**: Python + georinex (simulado)

## 🌟 Características

### Landing Page
- Timer de urgência com contador regressivo
- Formulário otimizado para conversão
- Captura automática de leads no Supabase
- Design profissional com shadcn/ui

### Sistema de Orçamentos
- Cálculo automático com multiplicadores regionais
- Descontos por área e taxa de urgência
- Geração de propostas em PDF
- Histórico completo no dashboard

### Análise GNSS
- Upload de arquivos RINEX (.21o, .rnx, .zip)
- Análise automática de qualidade
- Relatório técnico detalhado
- Storage seguro no Supabase

### Dashboard
- Visão geral de orçamentos e análises
- Estatísticas de uso
- Histórico completo
- Gestão de perfil

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: suporte@ongeo.pro
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/ongeo/issues)
- 📖 Docs: [Documentação Completa](./docs/)

---

Desenvolvido com ❤️ para profissionais de georreferenciamento rural.