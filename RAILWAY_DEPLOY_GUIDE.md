# 🚀 Guia Completo de Deploy no Railway - OnGeo

## 📋 Pré-requisitos

1. Conta no Railway (railway.app)
2. Projeto criado no Railway
3. Repositório GitHub conectado

## 🔧 Configuração Passo a Passo

### 1. Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```bash
# Backend Python
SUPABASE_URL=https://lywwxzfnhzbdkxnblvcf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ

# Frontend React
REACT_APP_SUPABASE_URL=https://lywwxzfnhzbdkxnblvcf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ

# Python
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# Node
NODE_ENV=production
```

⚠️ **NÃO DEFINA** a variável `PORT` - o Railway define automaticamente!

### 2. Deploy Settings

No painel do Railway, em **Settings**:

- **Build Command**: (deixe vazio - usa Dockerfile)
- **Start Command**: (deixe vazio - usa CMD do Dockerfile)
- **Health Check Path**: `/api/info`
- **Health Check Timeout**: `300`

### 3. Estrutura de Arquivos

Certifique-se de que existem:
- ✅ `Dockerfile` - Configuração do container
- ✅ `railway.json` - Configuração do Railway
- ✅ `start.sh` - Script de inicialização
- ✅ `backend/requirements.txt` - Dependências Python
- ✅ `package.json` - Dependências Node.js

### 4. Deploy

```bash
git add .
git commit -m "Configure Railway deployment"
git push origin main
```

## 🔍 Verificação

### 1. Logs
- Acesse Railway Dashboard → Logs
- Procure por:
  - ✅ "Backend importado com sucesso"
  - ✅ "Iniciando servidor na porta"
  - ✅ Health check passando

### 2. Endpoints
Teste os seguintes endpoints:

- `https://seu-app.up.railway.app/` - Frontend React
- `https://seu-app.up.railway.app/api/info` - Health check
- `https://seu-app.up.railway.app/docs` - Documentação API
- `https://seu-app.up.railway.app/budget/orcamento-1752096006845` - Orçamento público

### 3. Health Check
```bash
curl https://seu-app.up.railway.app/api/info
```

Deve retornar:
```json
{
  "message": "OnGeo API",
  "version": "1.0.0",
  "status": "running"
}
```

## 🚨 Troubleshooting

### Problema: Health check falhando
1. Verifique logs para erros de importação
2. Confirme que variáveis de ambiente estão definidas
3. Verifique se a porta está correta

### Problema: Frontend não carrega
1. Verifique se o build do React foi bem-sucedido
2. Confirme variáveis REACT_APP_*

### Problema: Backend não conecta ao Supabase
1. Verifique variáveis SUPABASE_*
2. Teste conexão localmente

## 📊 Arquitetura

```
Railway Container
├── Frontend (React)
│   └── Servido pelo backend em /
├── Backend (FastAPI)
│   ├── API REST em /api/*
│   ├── Documentação em /docs
│   └── Health check em /api/info
└── Supabase (Externo)
    └── Banco de dados e autenticação
```

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Railway.json presente
- [ ] Dockerfile configurado
- [ ] Health check passando
- [ ] Frontend acessível
- [ ] API funcionando
- [ ] Orçamentos públicos funcionando

## 🎉 Sucesso!

Quando tudo estiver funcionando:
- ✅ Health check retorna 200 OK
- ✅ Frontend carrega normalmente
- ✅ API responde aos requests
- ✅ Links públicos funcionam