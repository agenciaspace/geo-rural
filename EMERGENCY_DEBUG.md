# 🚨 EMERGENCY DEBUG - Backend Ultra-Minimal

## 🎯 O Que Foi Feito

Substituí o backend complexo por uma versão **ULTRA-SIMPLIFICADA**:

- ✅ Apenas FastAPI + uvicorn (sem outras dependências)
- ✅ Sem GeorINEX, ReportLab, Supabase
- ✅ Sem build do frontend
- ✅ Apenas 20 linhas de código Python
- ✅ Endpoint de teste que retorna o orçamento fake

## 🔍 Se Esta Versão AINDA Falhar

Então o problema **NÃO É** no nosso código, mas sim:

1. **Railway Infrastructure** - Problema no serviço
2. **Docker Issues** - Problema no ambiente Docker
3. **Network Issues** - Problema de rede/proxy
4. **Resource Limits** - Falta de memória/CPU

## 🧪 Esta Versão Deve Funcionar

### Endpoints disponíveis:
- ✅ `GET /api/info` - Health check
- ✅ `GET /api/budgets/link/orcamento-1752096006845` - Orçamento teste
- ✅ `GET /` - Página inicial
- ✅ `GET /docs` - Documentação automática

### O que retorna:
```json
{
  "success": true,
  "budget": {
    "id": "502d6aa4-5549-41ab-b6de-d4f4138b506b",
    "custom_link": "orcamento-1752096006845",
    "status": "active",
    "budget_request": {
      "client_name": "Cliente Teste",
      "client_email": "teste@email.com",
      "property_name": "Propriedade Teste"
    },
    "budget_result": {
      "total_price": 5000.00
    }
  }
}
```

## 🎯 Aguardar Deploy

1. **Aguarde 2-3 minutos** para o deploy
2. **Verifique health check** - deve passar agora
3. **Teste o link:** `https://ongeo.up.railway.app/budget/orcamento-1752096006845`

## 📋 Se Funcionar

Depois que funcionar, vamos **gradualmente** adicionar de volta:
1. ✅ Frontend build
2. ✅ Supabase connection
3. ✅ GeorINEX dependencies
4. ✅ Full backend features

## 🚨 Se AINDA Falhar

Então o problema é na infraestrutura do Railway:
- Verificar logs detalhados
- Contactar suporte Railway
- Considerar outra plataforma (Render, Heroku, etc.)

**ESTA VERSÃO MINIMAL DEVE FUNCIONAR 100%!**