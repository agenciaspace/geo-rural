#!/bin/bash
# Script para testar o deploy no Railway

echo "🧪 Testando deploy do OnGeo no Railway..."
echo "============================================"

# URL base do Railway (atualize com sua URL)
BASE_URL="https://ongeo.up.railway.app"

# Teste 1: Health Check
echo -e "\n1️⃣ Testando Health Check..."
curl -f -s "$BASE_URL/api/info" | jq . || echo "❌ Health check falhou"

# Teste 2: Frontend
echo -e "\n2️⃣ Testando Frontend..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" | grep -q "200" && echo "✅ Frontend OK" || echo "❌ Frontend falhou"

# Teste 3: API Docs
echo -e "\n3️⃣ Testando API Docs..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs" | grep -q "200" && echo "✅ API Docs OK" || echo "❌ API Docs falhou"

# Teste 4: Orçamento Público
echo -e "\n4️⃣ Testando Orçamento Público..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/budget/orcamento-1752096006845" | grep -q "200" && echo "✅ Orçamento público OK" || echo "❌ Orçamento público falhou"

# Teste 5: API Endpoints
echo -e "\n5️⃣ Testando API Endpoints..."
curl -f -s "$BASE_URL/api/endpoints" | jq . || echo "❌ API endpoints falhou"

echo -e "\n============================================"
echo "✅ Testes concluídos!"