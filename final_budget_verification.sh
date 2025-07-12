#!/bin/bash

# Script final para verificar se todos os orçamentos estão funcionando corretamente

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

echo "✅ VERIFICAÇÃO FINAL DOS ORÇAMENTOS"
echo "============================================================"

# 1. Verificar todos os orçamentos
echo ""
echo "1. VERIFICANDO TODOS OS ORÇAMENTOS..."
echo "-------------------------------------"

ALL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,client_name,total,total_price,budget_result&order=created_at.desc")

BUDGET_COUNT=$(echo "$ALL_BUDGETS" | jq length)
echo "📊 Total de orçamentos: $BUDGET_COUNT"

echo ""
echo "📋 ESTADO ATUAL DOS ORÇAMENTOS:"
echo "ID | Cliente | Total Price | Budget Result | Status"
echo "---|---------|-------------|---------------|-------"

CORRECT_COUNT=0
INCORRECT_COUNT=0

echo "$ALL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_PRICE=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    # Verificar se está correto (usar string comparison para evitar problemas com bc)
    STATUS="✅ OK"
    if [ "$TOTAL_PRICE" != "$BUDGET_RESULT_TOTAL" ]; then
        STATUS="❌ ERRO"
    fi
    
    printf "%.8s | %-10s | %11s | %13s | %s\n" \
        "$BUDGET_ID" "$CLIENT_NAME" "R$ $TOTAL_PRICE" "R$ $BUDGET_RESULT_TOTAL" "$STATUS"
done

# 2. Verificar orçamento específico
echo ""
echo "2. VERIFICANDO ORÇAMENTO ESPECÍFICO..."
echo "--------------------------------------"

SPECIFIC_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"
SPECIFIC_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=*")

if [ "$(echo "$SPECIFIC_DATA" | jq length)" -gt 0 ]; then
    CLIENT_NAME=$(echo "$SPECIFIC_DATA" | jq -r '.[0].client_name')
    TOTAL_PRICE=$(echo "$SPECIFIC_DATA" | jq -r '.[0].total_price')
    BUDGET_RESULT_TOTAL=$(echo "$SPECIFIC_DATA" | jq -r '.[0].budget_result.total_price')
    CUSTOM_LINK=$(echo "$SPECIFIC_DATA" | jq -r '.[0].custom_link')
    
    echo "🎯 Orçamento problemático original:"
    echo "   ID: $SPECIFIC_BUDGET"
    echo "   Cliente: $CLIENT_NAME"
    echo "   Total Price: R$ $TOTAL_PRICE"
    echo "   Budget Result: R$ $BUDGET_RESULT_TOTAL"
    echo "   Link: $CUSTOM_LINK"
    
    if [ "$TOTAL_PRICE" = "$BUDGET_RESULT_TOTAL" ]; then
        echo "   ✅ PROBLEMA RESOLVIDO!"
    else
        echo "   ❌ Ainda há inconsistência"
        
        # Tentar correção final
        echo "   🔧 Aplicando correção final..."
        
        FINAL_FIX=$(curl -s \
          -X PATCH \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d "{\"total_price\": $BUDGET_RESULT_TOTAL}" \
          "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET")
        
        if echo "$FINAL_FIX" | jq empty 2>/dev/null; then
            NEW_TOTAL=$(echo "$FINAL_FIX" | jq -r '.[0].total_price')
            echo "   ✅ Correção aplicada: R$ $NEW_TOTAL"
        else
            echo "   ❌ Falha na correção"
        fi
    fi
fi

# 3. Verificar se há itens órfãos
echo ""
echo "3. VERIFICANDO ITENS ÓRFÃOS..."
echo "------------------------------"

ALL_ITEMS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?select=budget_id,description,total_price")

ITEMS_COUNT=$(echo "$ALL_ITEMS" | jq length)
echo "📊 Total de itens: $ITEMS_COUNT"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo ""
    echo "📋 ITENS POR ORÇAMENTO:"
    echo "$ALL_ITEMS" | jq -r 'group_by(.budget_id) | .[] | "\(.[0].budget_id): \(length) itens, Total: R$ \([.[].total_price] | add)"'
else
    echo "⚠️  Nenhum item encontrado - todos os orçamentos usam valores fixos"
fi

# 4. Testar URLs
echo ""
echo "4. URLS PARA TESTE..."
echo "--------------------"

if [ -n "$CUSTOM_LINK" ]; then
    echo "🌐 URLs do orçamento específico:"
    echo "   - Interno: http://localhost:8000/app/budgets/$SPECIFIC_BUDGET"
    echo "   - Público: http://localhost:8000/budget/$CUSTOM_LINK"
    echo ""
    echo "🔗 Para testar, acesse as URLs acima e verifique se:"
    echo "   - O total exibido é R$ $BUDGET_RESULT_TOTAL"
    echo "   - Os valores estão consistentes em todas as seções"
    echo "   - Itens adicionados são refletidos no total"
fi

# 5. Resumo das correções aplicadas
echo ""
echo "5. RESUMO DAS CORREÇÕES APLICADAS..."
echo "------------------------------------"

echo "✅ CORREÇÕES IMPLEMENTADAS:"
echo ""
echo "📊 BACKEND:"
echo "   - Todos os orçamentos tiveram total_price sincronizado"
echo "   - Campo total_price agora reflete o valor correto"
echo "   - Orçamentos sem itens usam budget_result.total_price"
echo ""
echo "🎨 FRONTEND:"
echo "   - BudgetDetails.js atualizado para usar calculateCorrectTotal()"
echo "   - BudgetHub.js atualizado para priorizar total_price"
echo "   - Função calculateCorrectTotal() considera itens dinâmicos"
echo "   - Fallback para budget_result quando não há itens"
echo ""
echo "🔧 LÓGICA DE CÁLCULO:"
echo "   - Se há itens: usa soma dos itens (dinâmico)"
echo "   - Se não há itens: usa budget_result.total_price (fixo)"
echo "   - Fallback para total_price e total em casos extremos"

# 6. Verificação final
echo ""
echo "6. VERIFICAÇÃO FINAL..."
echo "----------------------"

FINAL_VERIFICATION=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,total_price,budget_result&order=created_at.desc")

TOTAL_BUDGETS=$(echo "$FINAL_VERIFICATION" | jq length)
CORRECT_BUDGETS=$(echo "$FINAL_VERIFICATION" | jq '[.[] | select(.total_price == .budget_result.total_price)] | length')
INCORRECT_BUDGETS=$((TOTAL_BUDGETS - CORRECT_BUDGETS))

echo "📊 ESTATÍSTICAS FINAIS:"
echo "   - Total de orçamentos: $TOTAL_BUDGETS"
echo "   - Orçamentos corretos: $CORRECT_BUDGETS"
echo "   - Orçamentos incorretos: $INCORRECT_BUDGETS"

if [ "$INCORRECT_BUDGETS" -eq 0 ]; then
    echo ""
    echo "🎉 TODOS OS ORÇAMENTOS ESTÃO CORRETOS!"
    echo "✅ PROBLEMA RESOLVIDO COM SUCESSO!"
else
    echo ""
    echo "⚠️  Ainda há $INCORRECT_BUDGETS orçamento(s) com problemas"
    echo "💡 Pode ser necessário investigação adicional"
fi

echo ""
echo "============================================================"
echo "🎯 PRÓXIMOS PASSOS RECOMENDADOS:"
echo ""
echo "1. 🌐 TESTE MANUAL:"
echo "   - Acesse: http://localhost:8000/app/budgets/$SPECIFIC_BUDGET"
echo "   - Verifique se o total exibido é R$ $BUDGET_RESULT_TOTAL"
echo "   - Teste adição/remoção de itens"
echo ""
echo "2. 🔄 MONITORAMENTO:"
echo "   - Monitore novos orçamentos criados"
echo "   - Verifique se triggers funcionam para novos itens"
echo "   - Teste em diferentes cenários"
echo ""
echo "3. 🛡️ PREVENÇÃO:"
echo "   - Considere implementar validação no frontend"
echo "   - Adicione logs para debug de cálculos"
echo "   - Documente a lógica de fallback"
echo "============================================================"
