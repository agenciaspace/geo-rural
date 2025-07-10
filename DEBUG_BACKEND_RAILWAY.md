# 🚨 Debug Backend Railway - Health Check Falhando

## 🔍 Problema
```
Attempt #1-11 failed with service unavailable
Health check em /api/info falhando
```

## 🛠️ Correções Aplicadas

### ✅ 1. Dockerfile Simplificado
- Removido comando shell complexo
- Comando direto: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
- Teste de importação adicionado no build

### ✅ 2. Railway.json Atualizado
- `startCommand` explícito
- `PORT=8000` fixo
- Health check timeout aumentado

## 🧪 Estratégia de Debug

### **Opção 1: Verificar Logs do Railway**
1. Acesse Railway Dashboard
2. Vá em "Logs" 
3. Veja mensagens de erro específicas
4. Procure por:
   - `Import Error`
   - `Module not found`
   - `Port binding error`

### **Opção 2: Teste com Dockerfile Mínimo**
Se ainda falhar, mude temporariamente:
```bash
# Renomear Dockerfile atual
mv Dockerfile Dockerfile.original

# Usar versão de teste
mv Dockerfile.test Dockerfile

# Commit e push
git add . && git commit -m "Test minimal Dockerfile" && git push
```

### **Opção 3: Debug Local**
Teste o container localmente:
```bash
# Build local
docker build -t ongeo-test .

# Run local
docker run -p 8000:8000 ongeo-test

# Teste health check
curl http://localhost:8000/api/info
```

## 🎯 Possíveis Causas

### **1. Dependências Faltando**
- GeorINEX precisa de build tools
- Numpy/Scipy podem falhar

### **2. Porta Errada**
- Railway pode estar esperando porta dinâmica
- Verificar variável `$PORT`

### **3. Path Issues**
- Backend não encontrado
- Build directory missing

### **4. Memory/CPU Limits**
- Container pode estar sendo killed
- Railway free tier tem limites

## 🚀 Próximos Passos

1. **Aguarde deploy atual** (2-3 min)
2. **Verifique logs** no Railway
3. **Se ainda falhar:** Use Dockerfile.test
4. **Se funcionar:** Volte gradualmente as features

## 📋 Checklist de Debug

- [ ] Logs do Railway verificados
- [ ] Dockerfile.test testado se necessário
- [ ] Health check respondendo
- [ ] Endpoint de orçamento funcionando
- [ ] Frontend servindo corretamente

## 🎉 Resultado Esperado

Após correções:
```bash
✅ Health check: 200 OK
✅ /api/info respondendo
✅ Backend 100% funcional
```