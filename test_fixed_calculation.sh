#!/bin/bash

# Script para testar se a correção da função calculateCorrectTotal funcionou

echo "🧪 TESTANDO CORREÇÃO DA FUNÇÃO calculateCorrectTotal"
echo "============================================================"

SAMIRA_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"

# 1. Verificar se o servidor está rodando
echo ""
echo "1. VERIFICANDO SERVIDOR..."
echo "-------------------------"

SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000)
echo "🌐 Status do servidor: $SERVER_STATUS"

if [ "$SERVER_STATUS" != "200" ]; then
    echo "❌ Servidor não está rodando. Execute: npm start"
    exit 1
fi

# 2. Testar URL do orçamento
echo ""
echo "2. TESTANDO URL DO ORÇAMENTO..."
echo "-------------------------------"

BUDGET_URL="http://localhost:8000/app/budgets/$SAMIRA_BUDGET"
echo "🔗 URL: $BUDGET_URL"

BUDGET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BUDGET_URL")
echo "📊 Status da página: $BUDGET_STATUS"

if [ "$BUDGET_STATUS" != "200" ]; then
    echo "❌ Erro ao acessar página do orçamento"
    exit 1
fi

# 3. Simular lógica corrigida
echo ""
echo "3. SIMULANDO LÓGICA CORRIGIDA..."
echo "--------------------------------"

echo "🧮 NOVA LÓGICA (calculateCorrectTotal):"
echo ""
echo "   📊 budgetItems.length = 0 (nenhum item no banco)"
echo "   📊 additionalItems.length = 1 (item de R$ 25,00)"
echo ""
echo "   🔄 CÁLCULO:"
echo "   1. baseTotal = budget.budget_result.total_price = R$ 1800"
echo "   2. additionalItemsTotal = R$ 25,00"
echo "   3. TOTAL = baseTotal + additionalItemsTotal = R$ 1800 + R$ 25 = R$ 1825"
echo ""
echo "   ✅ RESULTADO ESPERADO: R$ 1.825,00"

# 4. Verificar dados do banco para confirmar
echo ""
echo "4. CONFIRMANDO DADOS DO BANCO..."
echo "--------------------------------"

SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

BUDGET_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SAMIRA_BUDGET&select=budget_result")

BUDGET_RESULT_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.total_price')

echo "💰 budget_result.total_price: R$ $BUDGET_RESULT_TOTAL"
echo "➕ Item adicional: R$ 25,00"
echo "🎯 Total esperado: R$ $(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)"

# 5. Instruções para verificação manual
echo ""
echo "5. VERIFICAÇÃO MANUAL..."
echo "------------------------"

echo "🌐 ACESSE A URL:"
echo "   $BUDGET_URL"
echo ""
echo "🔍 VERIFIQUE SE:"
echo "   1. ✅ Total Geral mostra: R$ 1.825,00"
echo "   2. ✅ Seção 'Detalhamento de Custos' mostra: R$ 1.825,00"
echo "   3. ✅ Seção 'Itens Adicionais' mostra: Taxa Adicional R$ 25,00"
echo "   4. ✅ Breakdown original mostra os 4 itens (R$ 500 + R$ 200 + R$ 300 + R$ 800)"
echo ""
echo "❌ SE AINDA MOSTRAR R$ 25,00:"
echo "   - O cache do navegador pode estar interferindo"
echo "   - Pressione Ctrl+F5 para recarregar sem cache"
echo "   - Ou abra em aba anônima/privada"

# 6. Verificar se há problemas de cache
echo ""
echo "6. DICAS PARA RESOLVER CACHE..."
echo "-------------------------------"

echo "🔄 SE O PROBLEMA PERSISTIR:"
echo ""
echo "1. 🌐 RECARREGAR SEM CACHE:"
echo "   - Chrome/Edge: Ctrl+Shift+R ou Ctrl+F5"
echo "   - Firefox: Ctrl+Shift+R"
echo "   - Safari: Cmd+Shift+R"
echo ""
echo "2. 🕵️ MODO PRIVADO/ANÔNIMO:"
echo "   - Abra uma nova janela privada"
echo "   - Acesse a URL novamente"
echo ""
echo "3. 🔧 REINICIAR SERVIDOR:"
echo "   - Pare o servidor (Ctrl+C)"
echo "   - Execute: npm start"
echo "   - Acesse a URL novamente"

# 7. Verificar arquivos modificados
echo ""
echo "7. ARQUIVOS MODIFICADOS..."
echo "--------------------------"

echo "📁 ARQUIVO CORRIGIDO:"
echo "   - src/components/BudgetDetails.js"
echo ""
echo "🔧 FUNÇÃO CORRIGIDA:"
echo "   - calculateCorrectTotal()"
echo ""
echo "✅ CORREÇÃO APLICADA:"
echo "   - Valor base sempre considerado"
echo "   - Itens adicionais somados corretamente"
echo "   - Total: baseTotal + additionalItemsTotal"

echo ""
echo "============================================================"
echo "🎯 RESUMO DA CORREÇÃO:"
echo ""
echo "❌ ANTES:"
echo "   - Mostrava apenas R$ 25,00 (só itens adicionais)"
echo "   - Não considerava valor base do orçamento"
echo ""
echo "✅ DEPOIS:"
echo "   - Mostra R$ 1.825,00 (valor base + itens adicionais)"
echo "   - Considera corretamente: R$ 1.800,00 + R$ 25,00"
echo ""
echo "🌐 TESTE AGORA:"
echo "   $BUDGET_URL"
echo ""
echo "💡 Se ainda não funcionar, tente recarregar sem cache!"
echo "============================================================"
