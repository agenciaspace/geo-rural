#!/bin/bash

# Script para verificar se o backend está funcionando em produção
echo "🔧 Verificando Backend em Produção - OnGeo"
echo "============================================="

BASE_URL="https://ongeo.up.railway.app"
CUSTOM_LINK="orcamento-1752096006845"

echo ""
echo "1. 🏥 Testando Health Check..."
curl -s -w "Status: %{http_code}\n" "${BASE_URL}/api/info" | head -20

echo ""
echo "2. 📋 Testando Endpoint de Orçamento..."
curl -s -w "Status: %{http_code}\n" "${BASE_URL}/api/budgets/link/${CUSTOM_LINK}" | head -10

echo ""
echo "3. 📊 Testando Listagem de Orçamentos..."
curl -s -w "Status: %{http_code}\n" "${BASE_URL}/api/budgets" | head -10

echo ""
echo "4. 📖 Testando Documentação..."
curl -s -I "${BASE_URL}/docs" | grep -E "(HTTP|content-type)"

echo ""
echo "5. 🏠 Testando Rota Principal..."
curl -s -I "${BASE_URL}/" | grep -E "(HTTP|content-type)"

echo ""
echo "============================================="
echo "✅ Verificação completa!"
echo ""
echo "💡 Para mais detalhes, abra: test_backend_production.html"
echo "🌐 Health Check: ${BASE_URL}/api/info"
echo "📖 Docs: ${BASE_URL}/docs"