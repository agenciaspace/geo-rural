#!/bin/bash

# Script para forçar recálculo dos totais após criação dos itens
# Verifica se itens foram criados e força atualização do total_price

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

echo "🔄 FORÇANDO RECÁLCULO DE TOTAIS"
echo "============================================================"

# 1. Verificar quantos itens foram criados
echo ""
echo "1. VERIFICANDO ITENS CRIADOS..."
echo "-------------------------------"

ALL_ITEMS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?select=budget_id,total_price,description")

ITEMS_COUNT=$(echo "$ALL_ITEMS" | jq length)
echo "✅ Total de itens encontrados: $ITEMS_COUNT"

# Agrupar por orçamento
echo ""
echo "📊 ITENS POR ORÇAMENTO:"
echo "$ALL_ITEMS" | jq -r 'group_by(.budget_id) | .[] | "\(.[0].budget_id): \(length) itens, Total: R$ \([.[].total_price] | add)"'

# 2. Buscar todos os orçamentos
echo ""
echo "2. BUSCANDO ORÇAMENTOS PARA RECÁLCULO..."
echo "----------------------------------------"

ALL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,client_name,total_price")

BUDGET_COUNT=$(echo "$ALL_BUDGETS" | jq length)
echo "✅ Orçamentos encontrados: $BUDGET_COUNT"

# 3. Recalcular cada orçamento
echo ""
echo "3. RECALCULANDO TOTAIS..."
echo "-------------------------"

UPDATED_COUNT=0
ERROR_COUNT=0

echo "$ALL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    CURRENT_TOTAL=$(echo "$budget" | jq -r '.total_price // 0')
    
    echo ""
    echo "📋 Recalculando: $CLIENT_NAME (${BUDGET_ID:0:8}...)"
    echo "   Total atual: R$ $CURRENT_TOTAL"
    
    # Buscar itens deste orçamento
    BUDGET_ITEMS=$(curl -s \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$BUDGET_ID&select=total_price")
    
    ITEMS_TOTAL=$(echo "$BUDGET_ITEMS" | jq '[.[].total_price] | add // 0')
    ITEMS_COUNT=$(echo "$BUDGET_ITEMS" | jq length)
    
    echo "   Itens encontrados: $ITEMS_COUNT"
    echo "   Soma dos itens: R$ $ITEMS_TOTAL"
    
    if [ "$ITEMS_COUNT" -gt 0 ] && [ "$(echo "$ITEMS_TOTAL > 0" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        # Atualizar total_price
        UPDATE_RESULT=$(curl -s \
          -X PATCH \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d "{\"total_price\": $ITEMS_TOTAL, \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"}" \
          "$SUPABASE_URL/rest/v1/budgets?id=eq.$BUDGET_ID")
        
        if echo "$UPDATE_RESULT" | jq empty 2>/dev/null && [ "$(echo "$UPDATE_RESULT" | jq length)" -gt 0 ]; then
            NEW_TOTAL=$(echo "$UPDATE_RESULT" | jq -r '.[0].total_price')
            echo "   ✅ Total atualizado para: R$ $NEW_TOTAL"
            UPDATED_COUNT=$((UPDATED_COUNT + 1))
        else
            echo "   ❌ Erro ao atualizar:"
            echo "   $UPDATE_RESULT"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        echo "   ⚠️  Sem itens válidos para recálculo"
    fi
    
    echo "   ---"
done

# 4. Verificação final
echo ""
echo "4. VERIFICAÇÃO FINAL..."
echo "----------------------"

FINAL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,client_name,total,total_price,budget_result&order=created_at.desc")

echo ""
echo "📊 ESTADO FINAL DOS ORÇAMENTOS:"
echo "ID | Cliente | Total Antigo | Total Price | Budget Result | Diferença | Status"
echo "---|---------|--------------|-------------|---------------|-----------|-------"

CORRECT_COUNT=0
INCORRECT_COUNT=0

echo "$FINAL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_OLD=$(echo "$budget" | jq -r '.total // 0')
    TOTAL_NEW=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    # Calcular diferença
    DIFF=$(echo "$TOTAL_NEW - $BUDGET_RESULT_TOTAL" | bc -l 2>/dev/null || echo "0")
    
    # Verificar se está correto (tolerância de 0.01)
    STATUS="✅ OK"
    if [ "$(echo "$DIFF > 0.01 || $DIFF < -0.01" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
        STATUS="❌ ERRO"
        INCORRECT_COUNT=$((INCORRECT_COUNT + 1))
    else
        CORRECT_COUNT=$((CORRECT_COUNT + 1))
    fi
    
    printf "%.8s | %-10s | %12s | %11s | %13s | %9s | %s\n" \
        "$BUDGET_ID" "$CLIENT_NAME" "$TOTAL_OLD" "$TOTAL_NEW" "$BUDGET_RESULT_TOTAL" "$DIFF" "$STATUS"
done

# 5. Testar orçamento específico
echo ""
echo "5. TESTANDO ORÇAMENTO ESPECÍFICO..."
echo "-----------------------------------"

SPECIFIC_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"
SPECIFIC_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=*")

if [ "$(echo "$SPECIFIC_DATA" | jq length)" -gt 0 ]; then
    SPECIFIC_TOTAL=$(echo "$SPECIFIC_DATA" | jq -r '.[0].total_price')
    SPECIFIC_BUDGET_RESULT=$(echo "$SPECIFIC_DATA" | jq -r '.[0].budget_result.total_price')
    
    echo "🎯 Orçamento específico (7c3c891a...):"
    echo "   Total Price: R$ $SPECIFIC_TOTAL"
    echo "   Budget Result: R$ $SPECIFIC_BUDGET_RESULT"
    
    if [ "$SPECIFIC_TOTAL" = "$SPECIFIC_BUDGET_RESULT" ]; then
        echo "   ✅ CORRIGIDO COM SUCESSO!"
    else
        echo "   ❌ Ainda há inconsistência"
    fi
else
    echo "   ❌ Orçamento específico não encontrado"
fi

echo ""
echo "============================================================"
echo "🎉 RECÁLCULO CONCLUÍDO!"
echo "- Orçamentos processados: $BUDGET_COUNT"
echo "- Orçamentos atualizados: $UPDATED_COUNT"
echo "- Erros encontrados: $ERROR_COUNT"
echo "- Orçamentos corretos: $CORRECT_COUNT"
echo "- Orçamentos incorretos: $INCORRECT_COUNT"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Verificar frontend para garantir exibição correta"
echo "2. Testar criação de novos orçamentos"
echo "3. Monitorar triggers para futuros orçamentos"
echo "============================================================"
