#!/bin/bash

# Script para corrigir cálculos de TODOS os orçamentos via API REST
# Resolve inconsistências entre total, total_price e budget_result.total_price

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

echo "🔧 CORREÇÃO DE CÁLCULOS DE TODOS OS ORÇAMENTOS"
echo "============================================================"

# 1. Buscar todos os orçamentos problemáticos
echo ""
echo "1. IDENTIFICANDO ORÇAMENTOS PROBLEMÁTICOS..."
echo "--------------------------------------------"

ALL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=*")

if ! echo "$ALL_BUDGETS" | jq empty 2>/dev/null; then
    echo "❌ Erro ao buscar orçamentos:"
    echo "$ALL_BUDGETS"
    exit 1
fi

BUDGET_COUNT=$(echo "$ALL_BUDGETS" | jq length)
echo "✅ Encontrados $BUDGET_COUNT orçamentos para análise"

# 2. Processar cada orçamento
echo ""
echo "2. PROCESSANDO ORÇAMENTOS..."
echo "----------------------------"

FIXED_COUNT=0
ERROR_COUNT=0

echo "$ALL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_OLD=$(echo "$budget" | jq -r '.total // 0')
    TOTAL_NEW=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    echo ""
    echo "📋 Processando: $CLIENT_NAME (ID: ${BUDGET_ID:0:8}...)"
    echo "   Total antigo: R$ $TOTAL_OLD"
    echo "   Total atual: R$ $TOTAL_NEW"
    echo "   Budget result: R$ $BUDGET_RESULT_TOTAL"
    
    # Verificar se há itens para este orçamento
    ITEMS=$(curl -s \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$BUDGET_ID&select=*")
    
    ITEMS_COUNT=$(echo "$ITEMS" | jq length 2>/dev/null || echo "0")
    
    if [ "$ITEMS_COUNT" = "0" ]; then
        echo "   ⚠️  Sem itens - criando item baseado no budget_result..."
        
        # Determinar valor correto
        if [ "$BUDGET_RESULT_TOTAL" != "0" ] && [ "$BUDGET_RESULT_TOTAL" != "null" ]; then
            CORRECT_VALUE="$BUDGET_RESULT_TOTAL"
        else
            CORRECT_VALUE="$TOTAL_OLD"
        fi
        
        # Criar item principal
        ITEM_DATA=$(cat <<EOF
{
    "budget_id": "$BUDGET_ID",
    "item_type": "servico_geo",
    "description": "Serviço de Georreferenciamento",
    "quantity": 1,
    "unit": "serviço",
    "unit_price": $CORRECT_VALUE,
    "notes": "Migração automática - Cliente: $CLIENT_NAME"
}
EOF
)
        
        CREATE_RESULT=$(curl -s \
          -X POST \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d "$ITEM_DATA" \
          "$SUPABASE_URL/rest/v1/budget_items")
        
        if echo "$CREATE_RESULT" | jq empty 2>/dev/null && [ "$(echo "$CREATE_RESULT" | jq length)" -gt 0 ]; then
            echo "   ✅ Item criado com sucesso"
            
            # Criar itens detalhados se houver breakdown
            BREAKDOWN=$(echo "$budget" | jq -r '.budget_result.breakdown // empty')
            if [ -n "$BREAKDOWN" ] && [ "$BREAKDOWN" != "null" ]; then
                echo "   📝 Criando itens detalhados do breakdown..."
                
                echo "$budget" | jq -r '.budget_result.breakdown[]? | @base64' | while read -r item_encoded; do
                    if [ -n "$item_encoded" ]; then
                        breakdown_item=$(echo "$item_encoded" | base64 --decode)
                        ITEM_DESC=$(echo "$breakdown_item" | jq -r '.item')
                        ITEM_VALUE=$(echo "$breakdown_item" | jq -r '.value')
                        
                        # Apenas valores positivos
                        if [ "$(echo "$ITEM_VALUE > 0" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
                            # Determinar tipo do item
                            ITEM_TYPE="servico_geo"
                            if echo "$ITEM_DESC" | grep -qi "urgência\|urgencia"; then
                                ITEM_TYPE="outros"
                            fi
                            
                            DETAIL_ITEM_DATA=$(cat <<EOF
{
    "budget_id": "$BUDGET_ID",
    "item_type": "$ITEM_TYPE",
    "description": "$ITEM_DESC",
    "quantity": 1,
    "unit": "serviço",
    "unit_price": $ITEM_VALUE,
    "notes": "Detalhamento automático - $CLIENT_NAME"
}
EOF
)
                            
                            curl -s \
                              -X POST \
                              -H "apikey: $SUPABASE_KEY" \
                              -H "Authorization: Bearer $SUPABASE_KEY" \
                              -H "Content-Type: application/json" \
                              -d "$DETAIL_ITEM_DATA" \
                              "$SUPABASE_URL/rest/v1/budget_items" > /dev/null
                        fi
                    fi
                done
            fi
            
        else
            echo "   ❌ Erro ao criar item:"
            echo "   $CREATE_RESULT"
        fi
    else
        echo "   ✅ Já possui $ITEMS_COUNT itens"
    fi
    
    # Recalcular total_price baseado nos itens atuais
    UPDATED_ITEMS=$(curl -s \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$BUDGET_ID&select=total_price")
    
    NEW_TOTAL=$(echo "$UPDATED_ITEMS" | jq '[.[].total_price] | add // 0')
    
    # Atualizar total_price do orçamento
    UPDATE_RESULT=$(curl -s \
      -X PATCH \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=representation" \
      -d "{\"total_price\": $NEW_TOTAL}" \
      "$SUPABASE_URL/rest/v1/budgets?id=eq.$BUDGET_ID")
    
    if echo "$UPDATE_RESULT" | jq empty 2>/dev/null; then
        echo "   ✅ Total_price atualizado para: R$ $NEW_TOTAL"
        FIXED_COUNT=$((FIXED_COUNT + 1))
    else
        echo "   ❌ Erro ao atualizar total_price"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    echo "   ---"
done

# 3. Verificação final
echo ""
echo "3. VERIFICAÇÃO FINAL..."
echo "----------------------"

FINAL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,client_name,total,total_price,budget_result&order=created_at.desc")

echo ""
echo "📊 RESULTADOS FINAIS:"
echo "ID | Cliente | Total Antigo | Total Price | Budget Result | Status"
echo "---|---------|--------------|-------------|---------------|-------"

echo "$FINAL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_OLD=$(echo "$budget" | jq -r '.total // 0')
    TOTAL_NEW=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    # Verificar se está correto
    STATUS="✅ OK"
    if [ "$BUDGET_RESULT_TOTAL" != "0" ] && [ "$BUDGET_RESULT_TOTAL" != "null" ]; then
        if [ "$(echo "$TOTAL_NEW != $BUDGET_RESULT_TOTAL" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
            STATUS="❌ ERRO"
        fi
    fi
    
    printf "%.8s | %-10s | %12s | %11s | %13s | %s\n" \
        "$BUDGET_ID" "$CLIENT_NAME" "$TOTAL_OLD" "$TOTAL_NEW" "$BUDGET_RESULT_TOTAL" "$STATUS"
done

echo ""
echo "============================================================"
echo "🎉 CORREÇÃO CONCLUÍDA!"
echo "- Orçamentos processados: $BUDGET_COUNT"
echo "- Orçamentos corrigidos: $FIXED_COUNT"
echo "- Erros encontrados: $ERROR_COUNT"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Verificar se o frontend está exibindo valores corretos"
echo "2. Testar orçamento específico: 7c3c891a-e491-4412-918a-bd5a0ac558ae"
echo "3. Monitorar novos orçamentos para garantir que triggers funcionam"
echo "============================================================"
