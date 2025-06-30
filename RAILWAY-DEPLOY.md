# 🚂 Deploy no Railway - GeoRural Pro

## ✅ Configuração Completa

Todos os arquivos necessários foram criados:
- ✅ `railway.json` - Configuração do Railway
- ✅ `nixpacks.toml` - Build configuration  
- ✅ `Procfile` - Comando de inicialização
- ✅ `deploy-railway.sh` - Script automatizado

## 🚀 Como fazer o deploy:

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Fazer login no Railway
```bash
railway login
```
Isso abrirá o navegador para autenticação.

### 3. Executar o deploy
```bash
./deploy-railway.sh
```

## 📋 Passo a passo manual (alternativo):

### 1. Inicializar projeto
```bash
railway init
```

### 2. Fazer deploy
```bash
railway up
```

### 3. Configurar domínio (opcional)
```bash
railway domain
```

## ✨ Configurações aplicadas:

### Limites de Upload:
- **Backend**: 500MB
- **Frontend**: 500MB  
- **Interface**: "Tamanho máximo: 500MB"

### Stack:
- **Python**: 3.12
- **Node.js**: 18
- **FastAPI**: Com suporte a uploads grandes
- **React**: Build otimizado

### Comando de inicialização:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

## 🔗 Após o deploy:

1. **Obter URL**: `railway domain`
2. **Ver logs**: `railway logs`
3. **Status**: `railway status`

## 💡 Vantagens do Railway:

- ✅ Suporte a uploads de até 500MB+
- ✅ Deploy automático do GitHub
- ✅ SSL gratuito
- ✅ Domínios customizados
- ✅ Logs em tempo real
- ✅ Escalabilidade automática

## 🧪 Teste do upload:

Após o deploy, teste o upload do seu arquivo de 33.75MB - agora deve funcionar perfeitamente!