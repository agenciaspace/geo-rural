# 🚀 Guia Completo de Deploy - GeoRural Pro

## 📋 Visão Geral

O projeto agora conta com scripts automatizados para deploy tanto local quanto em produção, tudo centralizado em **uma única porta** para simplificar o desenvolvimento.

## 🎯 Configuração Local (Porta Única)

### Antes vs Agora

**❌ Antes (2 portas):**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

**✅ Agora (1 porta):**
- Aplicação Completa: http://localhost:8000

### Como Funciona

O backend FastAPI serve automaticamente os arquivos estáticos buildados do React, criando uma experiência integrada:

1. React é buildado (`npm run build`)
2. Backend serve arquivos em `/build/`
3. APIs continuam em `/api/*`
4. Documentação em `/docs`

## 📂 Scripts Disponíveis

### 🛠️ Scripts de Desenvolvimento

#### `dev-setup.sh`
- **O que faz**: Configuração inicial completa
- **Quando usar**: Primeira execução ou após problemas
- **Inclui**: 
  - Ambiente virtual Python
  - Dependências Node.js e Python
  - Arquivo `.env.local`

```bash
./dev-setup.sh
```

#### `dev-start.sh`
- **O que faz**: Desenvolvimento simples (build único)
- **Quando usar**: Desenvolvimento normal, mudanças menos frequentes
- **Comportamento**:
  - Build do React uma vez
  - Inicia backend na porta 8000
  - Serve aplicação completa

```bash
./dev-start.sh
```

#### `dev-local.sh`
- **O que faz**: Desenvolvimento avançado (live reload)
- **Quando usar**: Desenvolvimento intenso, mudanças frequentes
- **Comportamento**:
  - Build inicial do React
  - Watch automático em `src/`
  - Rebuild automático ao salvar
  - Backend com hot reload

```bash
./dev-local.sh
```

### 🚀 Scripts de Deploy

#### `deploy-github.sh`
- **O que faz**: Deploy automático para GitHub
- **Funcionalidades**:
  - Detecta mudanças não commitadas
  - Commit automático com mensagem personalizada
  - Push para branch atual
  - Verificação de erros

```bash
./deploy-github.sh
```

#### `deploy-vercel.sh`
- **O que faz**: Deploy automático para Vercel
- **Funcionalidades**:
  - Instala Vercel CLI se necessário
  - Cria `vercel.json` automaticamente
  - Configura variáveis de ambiente
  - Deploy de produção

```bash
./deploy-vercel.sh
```

#### `deploy-all.sh`
- **O que faz**: Deploy completo (GitHub + Vercel)
- **Processo**:
  1. Commit e push para GitHub
  2. Build do React
  3. Deploy na Vercel
  - **Ideal para**: Releases e atualizações completas

```bash
./deploy-all.sh
```

## 🔧 Fluxo de Trabalho Recomendado

### Para Desenvolvimento

```bash
# 1. Configuração inicial (primeira vez)
./dev-setup.sh

# 2. Desenvolvimento normal
./dev-start.sh

# 3. Desenvolvimento intenso (mudanças frequentes)
./dev-local.sh
```

### Para Deploy

```bash
# Deploy completo (recomendado)
./deploy-all.sh

# Ou deploy individual
./deploy-github.sh    # Só GitHub
./deploy-vercel.sh     # Só Vercel
```

## 📁 Estrutura de Arquivos

```
georural-pro/
├── src/                 # Código React
├── build/               # React buildado (gerado)
├── backend/             # API Python FastAPI
├── api/                 # Vercel Functions (produção)
├── 
├── dev-setup.sh         # ⚙️ Setup inicial
├── dev-start.sh         # 🛠️ Dev simples
├── dev-local.sh         # 🔄 Dev com reload
├── 
├── deploy-github.sh     # 📤 GitHub
├── deploy-vercel.sh     # ☁️ Vercel
├── deploy-all.sh        # 🚀 Completo
├── 
├── .env.local          # Config local
├── vercel.json         # Config Vercel (auto)
└── package.json        # Dependências
```

## 🌐 URLs de Acesso

### Desenvolvimento Local
- **Aplicação**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Admin**: http://localhost:8000/redoc

### Produção (Vercel)
- **Aplicação**: https://seu-projeto.vercel.app
- **API Docs**: https://seu-projeto.vercel.app/docs

## ⚙️ Configurações Automáticas

### `vercel.json` (criado automaticamente)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### `.env.local` (configuração local)
```bash
# Deixa vazio para usar mesma porta
REACT_APP_API_URL=

# Supabase (opcional)
# REACT_APP_SUPABASE_URL=sua_url
# REACT_APP_SUPABASE_ANON_KEY=sua_chave
```

## 🛠️ Comandos Manuais Úteis

```bash
# Build manual do React
npm run build

# Verificar status Git
git status

# Limpar cache
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules && npm install

# Verificar portas em uso
lsof -i :8000

# Matar processo na porta
lsof -ti:8000 | xargs kill -9
```

## 🐛 Solução de Problemas

### ❌ Script não executa
```bash
chmod +x *.sh
```

### ❌ Porta 8000 ocupada
```bash
lsof -ti:8000 | xargs kill -9
```

### ❌ Build falha
```bash
rm -rf node_modules build
npm install
npm run build
```

### ❌ Deploy Vercel falha
```bash
vercel login
vercel --prod
```

### ❌ Git push falha
```bash
git pull origin main
git push origin main
```

## 📊 Comparação de Scripts

| Script | Propósito | Build | Reload | Deploy | Melhor Para |
|--------|-----------|-------|--------|--------|-------------|
| `dev-setup.sh` | Setup inicial | ❌ | ❌ | ❌ | Primeira vez |
| `dev-start.sh` | Dev simples | ✅ | ❌ | ❌ | Mudanças pontuais |
| `dev-local.sh` | Dev avançado | ✅ | ✅ | ❌ | Desenvolvimento intenso |
| `deploy-github.sh` | GitHub | ❌ | ❌ | ✅ | Backup código |
| `deploy-vercel.sh` | Vercel | ✅ | ❌ | ✅ | Deploy rápido |
| `deploy-all.sh` | Completo | ✅ | ❌ | ✅ | Releases |

## 🎯 Vantagens da Nova Configuração

### ✅ Desenvolvimento
- **Uma porta só**: Simplicidade
- **URLs consistentes**: Sem CORS issues
- **Deploy real**: Ambiente igual produção
- **Scripts automáticos**: Menos comandos

### ✅ Deploy
- **GitHub automático**: Commit e push
- **Vercel integrado**: Deploy com um comando
- **Configuração zero**: Scripts fazem tudo
- **Verificações**: Detecta problemas

### ✅ Manutenção
- **Documentação clara**: Guias detalhados
- **Troubleshooting**: Soluções prontas
- **Flexibilidade**: Scripts modulares
- **Atualizações**: Fácil evolução

---

**🚀 Agora você tem um fluxo completo de desenvolvimento e deploy automatizado!** 