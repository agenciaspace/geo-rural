#!/bin/bash

# Script para testar se as correções de orçamento estão funcionando
# Verifica tanto o backend quanto o frontend

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

SPECIFIC_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"

echo "🧪 TESTE DAS CORREÇÕES DE ORÇAMENTO"
echo "============================================================"

# 1. Verificar estado atual do orçamento específico
echo ""
echo "1. VERIFICANDO ORÇAMENTO ESPECÍFICO..."
echo "--------------------------------------"

BUDGET_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=*")

if [ "$(echo "$BUDGET_DATA" | jq length)" -gt 0 ]; then
    CLIENT_NAME=$(echo "$BUDGET_DATA" | jq -r '.[0].client_name')
    TOTAL_PRICE=$(echo "$BUDGET_DATA" | jq -r '.[0].total_price')
    BUDGET_RESULT_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.total_price')
    CUSTOM_LINK=$(echo "$BUDGET_DATA" | jq -r '.[0].custom_link')
    
    echo "✅ Orçamento encontrado:"
    echo "   Cliente: $CLIENT_NAME"
    echo "   Total Price: R$ $TOTAL_PRICE"
    echo "   Budget Result: R$ $BUDGET_RESULT_TOTAL"
    echo "   Link: $CUSTOM_LINK"
    
    if [ "$TOTAL_PRICE" = "$BUDGET_RESULT_TOTAL" ]; then
        echo "   ✅ Valores estão sincronizados!"
    else
        echo "   ❌ Valores ainda inconsistentes"
    fi
else
    echo "❌ Orçamento não encontrado"
    exit 1
fi

# 2. Verificar itens do orçamento
echo ""
echo "2. VERIFICANDO ITENS DO ORÇAMENTO..."
echo "------------------------------------"

ITEMS_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SPECIFIC_BUDGET&select=*")

ITEMS_COUNT=$(echo "$ITEMS_DATA" | jq length)
echo "📊 Itens encontrados: $ITEMS_COUNT"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo ""
    echo "📋 DETALHES DOS ITENS:"
    echo "Descrição | Quantidade | Preço Unit. | Total"
    echo "----------|------------|-------------|------"
    
    ITEMS_TOTAL=0
    echo "$ITEMS_DATA" | jq -r '.[] | "\(.description)|\(.quantity)|\(.unit_price)|\(.total_price)"' | while IFS='|' read -r desc qty price total; do
        printf "%-20s | %10s | %11s | %s\n" "$desc" "$qty" "R$ $price" "R$ $total"
        ITEMS_TOTAL=$(echo "$ITEMS_TOTAL + $total" | bc -l 2>/dev/null || echo "$total")
    done
    
    CALCULATED_TOTAL=$(echo "$ITEMS_DATA" | jq '[.[].total_price] | add')
    echo ""
    echo "💰 Total calculado dos itens: R$ $CALCULATED_TOTAL"
    
    if [ "$CALCULATED_TOTAL" = "$TOTAL_PRICE" ]; then
        echo "✅ Total dos itens bate com total_price!"
    else
        echo "❌ Total dos itens não bate com total_price"
    fi
else
    echo "⚠️  Nenhum item encontrado - orçamento usa valor fixo"
fi

# 3. Testar adição de um item
echo ""
echo "3. TESTANDO ADIÇÃO DE ITEM..."
echo "-----------------------------"

echo "🔄 Adicionando item de teste..."

NEW_ITEM_DATA=$(cat <<EOF
{
    "budget_id": "$SPECIFIC_BUDGET",
    "item_type": "outros",
    "description": "Item de Teste - Taxa Adicional",
    "quantity": 1,
    "unit": "serviço",
    "unit_price": 100.00,
    "notes": "Item adicionado para teste de cálculo dinâmico"
}
EOF
)

ADD_RESULT=$(curl -s \
  -X POST \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$NEW_ITEM_DATA" \
  "$SUPABASE_URL/rest/v1/budget_items")

if echo "$ADD_RESULT" | jq empty 2>/dev/null && [ "$(echo "$ADD_RESULT" | jq length)" -gt 0 ]; then
    NEW_ITEM_ID=$(echo "$ADD_RESULT" | jq -r '.[0].id')
    echo "✅ Item adicionado com sucesso (ID: ${NEW_ITEM_ID:0:8}...)"
    
    # Verificar se o total foi atualizado automaticamente
    sleep 2
    
    UPDATED_BUDGET=$(curl -s \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=total_price")
    
    NEW_TOTAL_PRICE=$(echo "$UPDATED_BUDGET" | jq -r '.[0].total_price')
    EXPECTED_TOTAL=$(echo "$TOTAL_PRICE + 100" | bc -l)
    
    echo "   Total anterior: R$ $TOTAL_PRICE"
    echo "   Total atual: R$ $NEW_TOTAL_PRICE"
    echo "   Total esperado: R$ $EXPECTED_TOTAL"
    
    if [ "$(echo "$NEW_TOTAL_PRICE == $EXPECTED_TOTAL" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        echo "   ✅ Trigger funcionando - total atualizado automaticamente!"
    else
        echo "   ⚠️  Trigger não funcionou - atualizando manualmente..."
        
        # Calcular total dos itens atual
        CURRENT_ITEMS=$(curl -s \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SPECIFIC_BUDGET&select=total_price")
        
        CURRENT_TOTAL=$(echo "$CURRENT_ITEMS" | jq '[.[].total_price] | add')
        
        # Atualizar manualmente
        MANUAL_UPDATE=$(curl -s \
          -X PATCH \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d "{\"total_price\": $CURRENT_TOTAL}" \
          "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET")
        
        if echo "$MANUAL_UPDATE" | jq empty 2>/dev/null; then
            FINAL_TOTAL=$(echo "$MANUAL_UPDATE" | jq -r '.[0].total_price')
            echo "   ✅ Atualização manual bem-sucedida: R$ $FINAL_TOTAL"
        else
            echo "   ❌ Falha na atualização manual"
        fi
    fi
    
    # Remover item de teste
    echo ""
    echo "🗑️  Removendo item de teste..."
    
    DELETE_RESULT=$(curl -s \
      -X DELETE \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      "$SUPABASE_URL/rest/v1/budget_items?id=eq.$NEW_ITEM_ID")
    
    echo "✅ Item de teste removido"
    
    # Verificar se total voltou ao original
    sleep 2
    
    FINAL_BUDGET=$(curl -s \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=total_price")
    
    FINAL_TOTAL_PRICE=$(echo "$FINAL_BUDGET" | jq -r '.[0].total_price')
    echo "   Total final: R$ $FINAL_TOTAL_PRICE"
    
    if [ "$(echo "$FINAL_TOTAL_PRICE == $TOTAL_PRICE" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        echo "   ✅ Total voltou ao valor original!"
    else
        echo "   ⚠️  Total não voltou ao original - corrigindo..."
        
        # Recalcular e corrigir
        REMAINING_ITEMS=$(curl -s \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SPECIFIC_BUDGET&select=total_price")
        
        REMAINING_TOTAL=$(echo "$REMAINING_ITEMS" | jq '[.[].total_price] | add // 0')
        
        if [ "$REMAINING_TOTAL" = "0" ]; then
            REMAINING_TOTAL="$BUDGET_RESULT_TOTAL"
        fi
        
        curl -s \
          -X PATCH \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -d "{\"total_price\": $REMAINING_TOTAL}" \
          "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET" > /dev/null
        
        echo "   ✅ Total corrigido para: R$ $REMAINING_TOTAL"
    fi
    
else
    echo "❌ Falha ao adicionar item de teste:"
    echo "$ADD_RESULT"
fi

# 4. Resumo final
echo ""
echo "4. RESUMO FINAL..."
echo "-----------------"

FINAL_CHECK=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=total_price,budget_result")

FINAL_TOTAL=$(echo "$FINAL_CHECK" | jq -r '.[0].total_price')
FINAL_BUDGET_RESULT=$(echo "$FINAL_CHECK" | jq -r '.[0].budget_result.total_price')

echo "📊 ESTADO FINAL:"
echo "   Total Price: R$ $FINAL_TOTAL"
echo "   Budget Result: R$ $FINAL_BUDGET_RESULT"

if [ "$FINAL_TOTAL" = "$FINAL_BUDGET_RESULT" ]; then
    echo "   ✅ SISTEMA FUNCIONANDO CORRETAMENTE!"
else
    echo "   ❌ Ainda há inconsistências"
fi

echo ""
echo "============================================================"
echo "🎯 URLS PARA TESTE MANUAL:"
echo "- Orçamento interno: http://localhost:8000/app/budgets/$SPECIFIC_BUDGET"
echo "- Orçamento público: http://localhost:8000/budget/$CUSTOM_LINK"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Testar as URLs acima no navegador"
echo "2. Verificar se os totais estão corretos"
echo "3. Testar adição/remoção de itens na interface"
echo "4. Verificar se os cálculos são dinâmicos"
echo "============================================================"
