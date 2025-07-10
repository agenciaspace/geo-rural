# 🚨 Debug do Dockerfile - Backend Falhando

## 🔍 Problema Identificado
Health check falhando em `/api/info` - "service unavailable"

## 🎯 Possíveis Causas
1. **Processo Python não inicia**
2. **Erro no comando uvicorn**
3. **Dependências faltando**
4. **Porta incorreta**
5. **Path de trabalho errado**

## 🛠️ Soluções a Testar

### 1. Simplificar Comando
```dockerfile
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Verificar Path
```dockerfile
WORKDIR /app
COPY backend ./backend
```

### 3. Logs Detalhados
```dockerfile
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
```

### 4. Test de Sintaxe
```dockerfile
RUN python -c "import backend.main; print('Backend importado com sucesso')"
```