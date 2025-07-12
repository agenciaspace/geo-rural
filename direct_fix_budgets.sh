#!/bin/bash

# Script para corrigir diretamente os totais dos orçamentos
# Atualiza total_price baseado no budget_result.total_price

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

echo "🔧 CORREÇÃO DIRETA DOS TOTAIS DOS ORÇAMENTOS"
echo "============================================================"

# 1. Buscar todos os orçamentos
echo ""
echo "1. BUSCANDO ORÇAMENTOS..."
echo "-------------------------"

ALL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,client_name,total,total_price,budget_result")

BUDGET_COUNT=$(echo "$ALL_BUDGETS" | jq length)
echo "✅ Encontrados $BUDGET_COUNT orçamentos"

# 2. Corrigir cada orçamento
echo ""
echo "2. CORRIGINDO TOTAIS..."
echo "----------------------"

FIXED_COUNT=0
ERROR_COUNT=0

echo "$ALL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_OLD=$(echo "$budget" | jq -r '.total // 0')
    TOTAL_CURRENT=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    echo ""
    echo "📋 Corrigindo: $CLIENT_NAME (${BUDGET_ID:0:8}...)"
    echo "   Total antigo: R$ $TOTAL_OLD"
    echo "   Total atual: R$ $TOTAL_CURRENT"
    echo "   Budget result: R$ $BUDGET_RESULT_TOTAL"
    
    # Determinar valor correto
    CORRECT_VALUE="$BUDGET_RESULT_TOTAL"
    if [ "$BUDGET_RESULT_TOTAL" = "0" ] || [ "$BUDGET_RESULT_TOTAL" = "null" ]; then
        CORRECT_VALUE="$TOTAL_OLD"
    fi
    
    echo "   Valor correto: R$ $CORRECT_VALUE"
    
    # Verificar se precisa atualizar
    if [ "$(echo "$TOTAL_CURRENT != $CORRECT_VALUE" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
        echo "   🔄 Atualizando total_price..."
        
        UPDATE_RESULT=$(curl -s \
          -X PATCH \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d "{\"total_price\": $CORRECT_VALUE}" \
          "$SUPABASE_URL/rest/v1/budgets?id=eq.$BUDGET_ID")
        
        if echo "$UPDATE_RESULT" | jq empty 2>/dev/null && [ "$(echo "$UPDATE_RESULT" | jq length)" -gt 0 ]; then
            NEW_TOTAL=$(echo "$UPDATE_RESULT" | jq -r '.[0].total_price')
            echo "   ✅ Atualizado para: R$ $NEW_TOTAL"
            FIXED_COUNT=$((FIXED_COUNT + 1))
        else
            echo "   ❌ Erro ao atualizar:"
            echo "   $UPDATE_RESULT"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        echo "   ✅ Já está correto"
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
echo "📊 ESTADO FINAL DOS ORÇAMENTOS:"
echo "ID | Cliente | Total Antigo | Total Price | Budget Result | Status"
echo "---|---------|--------------|-------------|---------------|-------"

CORRECT_COUNT=0
INCORRECT_COUNT=0

echo "$FINAL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_OLD=$(echo "$budget" | jq -r '.total // 0')
    TOTAL_NEW=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    # Determinar valor esperado
    EXPECTED_VALUE="$BUDGET_RESULT_TOTAL"
    if [ "$BUDGET_RESULT_TOTAL" = "0" ] || [ "$BUDGET_RESULT_TOTAL" = "null" ]; then
        EXPECTED_VALUE="$TOTAL_OLD"
    fi
    
    # Verificar se está correto
    STATUS="✅ OK"
    if [ "$(echo "$TOTAL_NEW != $EXPECTED_VALUE" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
        STATUS="❌ ERRO"
        INCORRECT_COUNT=$((INCORRECT_COUNT + 1))
    else
        CORRECT_COUNT=$((CORRECT_COUNT + 1))
    fi
    
    printf "%.8s | %-10s | %12s | %11s | %13s | %s\n" \
        "$BUDGET_ID" "$CLIENT_NAME" "$TOTAL_OLD" "$TOTAL_NEW" "$BUDGET_RESULT_TOTAL" "$STATUS"
done

# 4. Testar orçamento específico
echo ""
echo "4. TESTANDO ORÇAMENTO ESPECÍFICO..."
echo "-----------------------------------"

SPECIFIC_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"
echo "🎯 Testando orçamento: $SPECIFIC_BUDGET"

# Buscar dados atuais
SPECIFIC_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET&select=*")

if [ "$(echo "$SPECIFIC_DATA" | jq length)" -gt 0 ]; then
    SPECIFIC_TOTAL=$(echo "$SPECIFIC_DATA" | jq -r '.[0].total_price')
    SPECIFIC_BUDGET_RESULT=$(echo "$SPECIFIC_DATA" | jq -r '.[0].budget_result.total_price')
    SPECIFIC_CLIENT=$(echo "$SPECIFIC_DATA" | jq -r '.[0].client_name')
    
    echo "   Cliente: $SPECIFIC_CLIENT"
    echo "   Total Price: R$ $SPECIFIC_TOTAL"
    echo "   Budget Result: R$ $SPECIFIC_BUDGET_RESULT"
    
    if [ "$SPECIFIC_TOTAL" = "$SPECIFIC_BUDGET_RESULT" ]; then
        echo "   ✅ PROBLEMA RESOLVIDO!"
    else
        echo "   ❌ Ainda há inconsistência - tentando correção manual..."
        
        # Tentar correção manual
        MANUAL_FIX=$(curl -s \
          -X PATCH \
          -H "apikey: $SUPABASE_KEY" \
          -H "Authorization: Bearer $SUPABASE_KEY" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d "{\"total_price\": $SPECIFIC_BUDGET_RESULT}" \
          "$SUPABASE_URL/rest/v1/budgets?id=eq.$SPECIFIC_BUDGET")
        
        if echo "$MANUAL_FIX" | jq empty 2>/dev/null; then
            NEW_TOTAL=$(echo "$MANUAL_FIX" | jq -r '.[0].total_price')
            echo "   ✅ Correção manual aplicada: R$ $NEW_TOTAL"
        else
            echo "   ❌ Falha na correção manual"
        fi
    fi
else
    echo "   ❌ Orçamento específico não encontrado"
fi

# 5. Verificar URL do orçamento
echo ""
echo "5. VERIFICANDO URL DO ORÇAMENTO..."
echo "----------------------------------"

if [ "$(echo "$SPECIFIC_DATA" | jq length)" -gt 0 ]; then
    CUSTOM_LINK=$(echo "$SPECIFIC_DATA" | jq -r '.[0].custom_link // "N/A"')
    echo "🔗 Link personalizado: $CUSTOM_LINK"
    echo "🌐 URL completa: http://localhost:8000/app/budgets/$SPECIFIC_BUDGET"
    echo "🌐 URL pública: http://localhost:8000/budget/$CUSTOM_LINK"
fi

echo ""
echo "============================================================"
echo "🎉 CORREÇÃO DIRETA CONCLUÍDA!"
echo "- Orçamentos processados: $BUDGET_COUNT"
echo "- Orçamentos corrigidos: $FIXED_COUNT"
echo "- Erros encontrados: $ERROR_COUNT"
echo "- Orçamentos corretos: $CORRECT_COUNT"
echo "- Orçamentos incorretos: $INCORRECT_COUNT"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Testar a URL: http://localhost:8000/app/budgets/7c3c891a-e491-4412-918a-bd5a0ac558ae"
echo "2. Verificar se o frontend exibe o valor correto"
echo "3. Implementar fallback no frontend para casos futuros"
echo "============================================================"
