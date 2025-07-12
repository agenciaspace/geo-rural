#!/bin/bash

# Script para diagnosticar problemas de cálculo em TODOS os orçamentos
# Identifica inconsistências entre total, total_price e budget_result.total_price

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

echo "🔍 DIAGNÓSTICO COMPLETO DE TODOS OS ORÇAMENTOS"
echo "============================================================"

# 1. Buscar todos os orçamentos
echo ""
echo "1. BUSCANDO TODOS OS ORÇAMENTOS..."
echo "-----------------------------------"

ALL_BUDGETS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?select=id,total,total_price,budget_result,client_name,created_at&order=created_at.desc")

# Verificar se a resposta é válida
if echo "$ALL_BUDGETS" | jq empty 2>/dev/null; then
    BUDGET_COUNT=$(echo "$ALL_BUDGETS" | jq length)
    echo "✅ Encontrados $BUDGET_COUNT orçamentos"
else
    echo "❌ Erro ao buscar orçamentos:"
    echo "$ALL_BUDGETS"
    exit 1
fi

# 2. Buscar todos os itens de orçamento
echo ""
echo "2. BUSCANDO TODOS OS ITENS DE ORÇAMENTO..."
echo "------------------------------------------"

ALL_ITEMS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?select=budget_id,total_price")

if echo "$ALL_ITEMS" | jq empty 2>/dev/null; then
    ITEMS_COUNT=$(echo "$ALL_ITEMS" | jq length)
    echo "✅ Encontrados $ITEMS_COUNT itens de orçamento"
else
    echo "❌ Erro ao buscar itens:"
    echo "$ALL_ITEMS"
    exit 1
fi

# 3. Analisar inconsistências
echo ""
echo "3. ANÁLISE DE INCONSISTÊNCIAS"
echo "=============================="

# Criar arquivo temporário para resultados
TEMP_FILE=$(mktemp)
echo "ID,Cliente,Total_Antigo,Total_Price_Novo,Budget_Result_Total,Soma_Itens,Tem_Itens,Inconsistente" > "$TEMP_FILE"

# Processar cada orçamento
echo "$ALL_BUDGETS" | jq -r '.[] | @base64' | while read -r budget_encoded; do
    budget=$(echo "$budget_encoded" | base64 --decode)
    
    BUDGET_ID=$(echo "$budget" | jq -r '.id')
    CLIENT_NAME=$(echo "$budget" | jq -r '.client_name // "N/A"')
    TOTAL_OLD=$(echo "$budget" | jq -r '.total // 0')
    TOTAL_NEW=$(echo "$budget" | jq -r '.total_price // 0')
    BUDGET_RESULT_TOTAL=$(echo "$budget" | jq -r '.budget_result.total_price // 0')
    
    # Calcular soma dos itens para este orçamento
    ITEMS_TOTAL=$(echo "$ALL_ITEMS" | jq --arg budget_id "$BUDGET_ID" '[.[] | select(.budget_id == $budget_id) | .total_price] | add // 0')
    
    # Verificar se tem itens
    HAS_ITEMS=$(echo "$ALL_ITEMS" | jq --arg budget_id "$BUDGET_ID" '[.[] | select(.budget_id == $budget_id)] | length > 0')
    
    # Determinar se há inconsistência
    INCONSISTENT="false"
    
    # Se tem itens, total_price deve ser igual à soma dos itens
    if [ "$HAS_ITEMS" = "true" ]; then
        if [ "$(echo "$TOTAL_NEW != $ITEMS_TOTAL" | bc -l 2>/dev/null || echo "true")" = "1" ]; then
            INCONSISTENT="true"
        fi
    else
        # Se não tem itens, total_price deve ser igual ao budget_result.total_price ou total
        if [ "$(echo "$TOTAL_NEW != $BUDGET_RESULT_TOTAL && $TOTAL_NEW != $TOTAL_OLD" | bc -l 2>/dev/null || echo "true")" = "1" ]; then
            INCONSISTENT="true"
        fi
    fi
    
    echo "$BUDGET_ID,$CLIENT_NAME,$TOTAL_OLD,$TOTAL_NEW,$BUDGET_RESULT_TOTAL,$ITEMS_TOTAL,$HAS_ITEMS,$INCONSISTENT" >> "$TEMP_FILE"
done

# 4. Mostrar resultados
echo ""
echo "4. RESULTADOS DA ANÁLISE"
echo "========================"

# Contar orçamentos inconsistentes
INCONSISTENT_COUNT=$(tail -n +2 "$TEMP_FILE" | grep ",true$" | wc -l)
TOTAL_COUNT=$(tail -n +2 "$TEMP_FILE" | wc -l)

echo "📊 RESUMO:"
echo "- Total de orçamentos: $TOTAL_COUNT"
echo "- Orçamentos inconsistentes: $INCONSISTENT_COUNT"
echo "- Orçamentos corretos: $((TOTAL_COUNT - INCONSISTENT_COUNT))"

if [ "$INCONSISTENT_COUNT" -gt 0 ]; then
    echo ""
    echo "❌ ORÇAMENTOS COM PROBLEMAS:"
    echo "----------------------------"
    echo "ID | Cliente | Total Antigo | Total Price | Budget Result | Soma Itens | Tem Itens"
    echo "---|---------|--------------|-------------|---------------|------------|----------"
    
    tail -n +2 "$TEMP_FILE" | grep ",true$" | while IFS=',' read -r id client total_old total_new budget_result items_total has_items inconsistent; do
        printf "%.8s | %-10s | %12s | %11s | %13s | %10s | %9s\n" \
            "$id" "$client" "$total_old" "$total_new" "$budget_result" "$items_total" "$has_items"
    done
fi

# 5. Categorizar problemas
echo ""
echo "5. CATEGORIZAÇÃO DOS PROBLEMAS"
echo "==============================="

# Orçamentos sem itens com total_price incorreto
NO_ITEMS_WRONG=$(tail -n +2 "$TEMP_FILE" | grep ",false,true$" | wc -l)
echo "- Orçamentos sem itens com total_price incorreto: $NO_ITEMS_WRONG"

# Orçamentos com itens mas total_price incorreto
WITH_ITEMS_WRONG=$(tail -n +2 "$TEMP_FILE" | grep ",true,true$" | wc -l)
echo "- Orçamentos com itens mas total_price incorreto: $WITH_ITEMS_WRONG"

# 6. Salvar relatório detalhado
REPORT_FILE="budget_analysis_$(date +%Y%m%d_%H%M%S).csv"
cp "$TEMP_FILE" "$REPORT_FILE"
echo ""
echo "📄 Relatório detalhado salvo em: $REPORT_FILE"

# Limpar arquivo temporário
rm "$TEMP_FILE"

echo ""
echo "============================================================"
echo "🔧 PRÓXIMOS PASSOS RECOMENDADOS:"
echo ""
echo "1. Para orçamentos SEM itens:"
echo "   - Criar itens baseados no budget_result"
echo "   - Atualizar total_price para budget_result.total_price"
echo ""
echo "2. Para orçamentos COM itens:"
echo "   - Verificar se triggers estão funcionando"
echo "   - Recalcular total_price baseado na soma dos itens"
echo ""
echo "3. Verificar frontend:"
echo "   - Garantir que está usando o campo correto para exibição"
echo "   - Implementar fallback para casos inconsistentes"
echo "============================================================"
