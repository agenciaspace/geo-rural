#!/bin/bash

# Script para debugar o problema de cálculo do orçamento específico usando curl
# ID: 7c3c891a-e491-4412-918a-bd5a0ac558ae

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"
BUDGET_ID="7c3c891a-e491-4412-918a-bd5a0ac558ae"

echo "🔍 Debugando orçamento: $BUDGET_ID"
echo "============================================================"

# 1. Verificar dados do orçamento específico
echo ""
echo "1. DADOS DO ORÇAMENTO:"
echo "----------------------"

BUDGET_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$BUDGET_ID&select=*")

echo "Resposta da API:"
echo "$BUDGET_DATA" | python3 -m json.tool 2>/dev/null || echo "$BUDGET_DATA"

# 2. Verificar itens do orçamento
echo ""
echo "2. ITENS DO ORÇAMENTO:"
echo "----------------------"

ITEMS_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$BUDGET_ID&select=*")

echo "Resposta da API:"
echo "$ITEMS_DATA" | python3 -m json.tool 2>/dev/null || echo "$ITEMS_DATA"

# 3. Calcular total dos itens usando jq se disponível
echo ""
echo "3. ANÁLISE DOS DADOS:"
echo "--------------------"

# Verificar se jq está disponível
if command -v jq &> /dev/null; then
    echo "Usando jq para análise..."
    
    # Extrair dados do orçamento
    TOTAL_OLD=$(echo "$BUDGET_DATA" | jq -r '.[0].total // 0')
    TOTAL_NEW=$(echo "$BUDGET_DATA" | jq -r '.[0].total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.total_price // 0')
    
    echo "Campo 'total' (antigo): R$ $TOTAL_OLD"
    echo "Campo 'total_price' (novo): R$ $TOTAL_NEW"
    echo "Budget Result Total: R$ $BUDGET_RESULT_TOTAL"
    
    # Calcular soma dos itens
    ITEMS_TOTAL=$(echo "$ITEMS_DATA" | jq '[.[].total_price] | add // 0')
    echo "Soma dos itens: R$ $ITEMS_TOTAL"
    
    # Calcular diferenças
    DIFF_NEW=$(echo "$TOTAL_NEW - $ITEMS_TOTAL" | bc -l 2>/dev/null || echo "N/A")
    DIFF_OLD=$(echo "$TOTAL_OLD - $ITEMS_TOTAL" | bc -l 2>/dev/null || echo "N/A")
    DIFF_RESULT=$(echo "$BUDGET_RESULT_TOTAL - $ITEMS_TOTAL" | bc -l 2>/dev/null || echo "N/A")
    
    echo "Diferença (total_price vs itens): R$ $DIFF_NEW"
    echo "Diferença (total vs itens): R$ $DIFF_OLD"
    echo "Diferença (budget_result vs itens): R$ $DIFF_RESULT"
    
else
    echo "jq não disponível. Dados brutos mostrados acima."
fi

# 4. Tentar forçar recálculo do total_price
echo ""
echo "4. TENTANDO FORÇAR RECÁLCULO:"
echo "-----------------------------"

# Primeiro, calcular o total correto dos itens
if command -v jq &> /dev/null; then
    CORRECT_TOTAL=$(echo "$ITEMS_DATA" | jq '[.[].total_price] | add // 0')
    
    echo "Total correto calculado: R$ $CORRECT_TOTAL"
    
    # Tentar atualizar o orçamento
    UPDATE_RESULT=$(curl -s \
      -X PATCH \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=representation" \
      -d "{\"total_price\": $CORRECT_TOTAL}" \
      "$SUPABASE_URL/rest/v1/budgets?id=eq.$BUDGET_ID")
    
    echo "Resultado da atualização:"
    echo "$UPDATE_RESULT" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_RESULT"
else
    echo "Não foi possível calcular o total correto sem jq."
fi

echo ""
echo "============================================================"
echo "🔧 POSSÍVEIS PROBLEMAS IDENTIFICADOS:"
echo "- Inconsistência entre total, total_price e soma dos itens"
echo "- Frontend pode estar usando campo errado para exibição"
echo "- Campo budget_result pode estar desatualizado"
echo "- Triggers podem não estar funcionando corretamente"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Verificar qual campo o frontend está usando para exibir o total"
echo "2. Verificar se os triggers estão funcionando"
echo "3. Sincronizar todos os campos de total"
echo "============================================================"
