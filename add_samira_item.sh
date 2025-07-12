#!/bin/bash

# Script para adicionar item de R$ 25,00 ao orçamento da Samiraaaa
# e verificar se o total é calculado corretamente

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

SAMIRA_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"

echo "💰 ADICIONANDO ITEM DE R$ 25,00 AO ORÇAMENTO DA SAMIRAAAA"
echo "============================================================"

# 1. Verificar estado atual
echo ""
echo "1. ESTADO ATUAL DO ORÇAMENTO..."
echo "-------------------------------"

CURRENT_BUDGET=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SAMIRA_BUDGET&select=client_name,total_price,budget_result")

CURRENT_TOTAL=$(echo "$CURRENT_BUDGET" | jq -r '.[0].total_price')
BUDGET_RESULT_TOTAL=$(echo "$CURRENT_BUDGET" | jq -r '.[0].budget_result.total_price')
CLIENT_NAME=$(echo "$CURRENT_BUDGET" | jq -r '.[0].client_name')

echo "👤 Cliente: $CLIENT_NAME"
echo "💰 Total atual: R$ $CURRENT_TOTAL"
echo "📊 Budget result: R$ $BUDGET_RESULT_TOTAL"

# 2. Criar item base do orçamento original
echo ""
echo "2. CRIANDO ITEM BASE DO ORÇAMENTO..."
echo "------------------------------------"

BASE_ITEM_DATA=$(cat <<EOF
{
    "budget_id": "$SAMIRA_BUDGET",
    "item_type": "servico_geo",
    "description": "Serviço de Georreferenciamento Completo",
    "quantity": 1,
    "unit": "serviço",
    "unit_price": $BUDGET_RESULT_TOTAL,
    "notes": "Serviço base: Taxa base (R$ 500) + Vértices 4x50 (R$ 200) + Urgência (R$ 300) + Topografia (R$ 800)"
}
EOF
)

echo "🔄 Criando item base de R$ $BUDGET_RESULT_TOTAL..."

BASE_RESULT=$(curl -s \
  -X POST \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$BASE_ITEM_DATA" \
  "$SUPABASE_URL/rest/v1/budget_items")

if echo "$BASE_RESULT" | jq empty 2>/dev/null && [ "$(echo "$BASE_RESULT" | jq length)" -gt 0 ]; then
    BASE_ITEM_ID=$(echo "$BASE_RESULT" | jq -r '.[0].id')
    echo "✅ Item base criado com sucesso (ID: ${BASE_ITEM_ID:0:8}...)"
else
    echo "❌ Erro ao criar item base:"
    echo "$BASE_RESULT"
    exit 1
fi

# 3. Criar item adicional de R$ 25,00
echo ""
echo "3. CRIANDO ITEM ADICIONAL DE R$ 25,00..."
echo "-----------------------------------------"

ADDITIONAL_ITEM_DATA=$(cat <<EOF
{
    "budget_id": "$SAMIRA_BUDGET",
    "item_type": "outros",
    "description": "Taxa Adicional",
    "quantity": 1,
    "unit": "taxa",
    "unit_price": 25.00,
    "notes": "Item adicional conforme solicitado pelo cliente"
}
EOF
)

echo "🔄 Criando item adicional de R$ 25,00..."

ADDITIONAL_RESULT=$(curl -s \
  -X POST \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$ADDITIONAL_ITEM_DATA" \
  "$SUPABASE_URL/rest/v1/budget_items")

if echo "$ADDITIONAL_RESULT" | jq empty 2>/dev/null && [ "$(echo "$ADDITIONAL_RESULT" | jq length)" -gt 0 ]; then
    ADDITIONAL_ITEM_ID=$(echo "$ADDITIONAL_RESULT" | jq -r '.[0].id')
    echo "✅ Item adicional criado com sucesso (ID: ${ADDITIONAL_ITEM_ID:0:8}...)"
else
    echo "❌ Erro ao criar item adicional:"
    echo "$ADDITIONAL_RESULT"
    exit 1
fi

# 4. Verificar itens criados
echo ""
echo "4. VERIFICANDO ITENS CRIADOS..."
echo "-------------------------------"

CREATED_ITEMS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SAMIRA_BUDGET&select=*")

ITEMS_COUNT=$(echo "$CREATED_ITEMS" | jq length)
echo "📊 Total de itens criados: $ITEMS_COUNT"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo ""
    echo "📋 ITENS DO ORÇAMENTO:"
    echo "Descrição | Quantidade | Preço Unit. | Total"
    echo "----------|------------|-------------|------"
    
    echo "$CREATED_ITEMS" | jq -r '.[] | "\(.description)|\(.quantity)|\(.unit_price)|\(.total_price)"' | while IFS='|' read -r desc qty price total; do
        printf "%-30s | %10s | %11s | %s\n" "$desc" "$qty" "R$ $price" "R$ $total"
    done
    
    ITEMS_TOTAL=$(echo "$CREATED_ITEMS" | jq '[.[].total_price] | add')
    echo ""
    echo "💰 TOTAL DOS ITENS: R$ $ITEMS_TOTAL"
    
    EXPECTED_TOTAL=$(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)
    echo "💰 TOTAL ESPERADO: R$ $EXPECTED_TOTAL"
    
    if [ "$(echo "$ITEMS_TOTAL == $EXPECTED_TOTAL" | bc -l)" = "1" ]; then
        echo "✅ Total dos itens está correto!"
    else
        echo "❌ Total dos itens não confere"
    fi
fi

# 5. Forçar atualização do total_price do orçamento
echo ""
echo "5. ATUALIZANDO TOTAL DO ORÇAMENTO..."
echo "------------------------------------"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    FINAL_TOTAL=$(echo "$CREATED_ITEMS" | jq '[.[].total_price] | add')
    
    echo "🔄 Atualizando total_price para R$ $FINAL_TOTAL..."
    
    UPDATE_RESULT=$(curl -s \
      -X PATCH \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=representation" \
      -d "{\"total_price\": $FINAL_TOTAL}" \
      "$SUPABASE_URL/rest/v1/budgets?id=eq.$SAMIRA_BUDGET")
    
    if echo "$UPDATE_RESULT" | jq empty 2>/dev/null && [ "$(echo "$UPDATE_RESULT" | jq length)" -gt 0 ]; then
        NEW_TOTAL=$(echo "$UPDATE_RESULT" | jq -r '.[0].total_price')
        echo "✅ Total do orçamento atualizado para: R$ $NEW_TOTAL"
    else
        echo "❌ Erro ao atualizar total do orçamento:"
        echo "$UPDATE_RESULT"
    fi
fi

# 6. Verificação final
echo ""
echo "6. VERIFICAÇÃO FINAL..."
echo "----------------------"

FINAL_BUDGET=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SAMIRA_BUDGET&select=client_name,total_price,budget_result")

FINAL_TOTAL_PRICE=$(echo "$FINAL_BUDGET" | jq -r '.[0].total_price')
FINAL_BUDGET_RESULT=$(echo "$FINAL_BUDGET" | jq -r '.[0].budget_result.total_price')

echo "📊 ESTADO FINAL:"
echo "   Cliente: $CLIENT_NAME"
echo "   Total Price: R$ $FINAL_TOTAL_PRICE"
echo "   Budget Result Original: R$ $FINAL_BUDGET_RESULT"
echo "   Diferença: R$ $(echo "$FINAL_TOTAL_PRICE - $FINAL_BUDGET_RESULT" | bc -l)"

# Verificar se o frontend vai calcular corretamente
FINAL_ITEMS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SAMIRA_BUDGET&select=total_price")

FRONTEND_TOTAL=$(echo "$FINAL_ITEMS" | jq '[.[].total_price] | add')

echo ""
echo "🎨 CÁLCULO DO FRONTEND:"
echo "   Soma dos itens: R$ $FRONTEND_TOTAL"
echo "   Total_price: R$ $FINAL_TOTAL_PRICE"

if [ "$FRONTEND_TOTAL" = "$FINAL_TOTAL_PRICE" ]; then
    echo "   ✅ Frontend calculará corretamente!"
else
    echo "   ❌ Inconsistência entre soma dos itens e total_price"
fi

echo ""
echo "============================================================"
echo "🎯 RESULTADO:"
echo ""
echo "✅ ITEM DE R$ 25,00 ADICIONADO COM SUCESSO!"
echo ""
echo "📊 RESUMO:"
echo "   - Orçamento original: R$ $BUDGET_RESULT_TOTAL"
echo "   - Item adicional: R$ 25,00"
echo "   - Total final: R$ $FINAL_TOTAL_PRICE"
echo ""
echo "🌐 URLS PARA TESTE:"
echo "   - Interno: http://localhost:8000/app/budgets/$SAMIRA_BUDGET"
echo "   - Público: http://localhost:8000/budget/orcamento-1752279479659"
echo ""
echo "💡 O frontend agora deve mostrar:"
echo "   - Total baseado na soma dos itens: R$ $FRONTEND_TOTAL"
echo "   - Incluindo o item adicional de R$ 25,00"
echo "============================================================"
