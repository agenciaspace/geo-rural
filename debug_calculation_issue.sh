#!/bin/bash

# Script para debugar o problema de cálculo que está mostrando apenas R$ 25,00

SAMIRA_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

echo "🐛 DEBUGANDO PROBLEMA DE CÁLCULO - MOSTRANDO APENAS R$ 25,00"
echo "============================================================"

# 1. Verificar dados do orçamento
echo ""
echo "1. DADOS DO ORÇAMENTO..."
echo "------------------------"

BUDGET_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SAMIRA_BUDGET&select=*")

echo "📊 DADOS COMPLETOS:"
echo "$BUDGET_DATA" | jq '.[0] | {
  client_name: .client_name,
  total: .total,
  total_price: .total_price,
  budget_result_total: .budget_result.total_price,
  budget_result_breakdown: .budget_result.breakdown
}'

TOTAL_PRICE=$(echo "$BUDGET_DATA" | jq -r '.[0].total_price')
BUDGET_RESULT_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.total_price')

echo ""
echo "💰 VALORES CHAVE:"
echo "   total_price: R$ $TOTAL_PRICE"
echo "   budget_result.total_price: R$ $BUDGET_RESULT_TOTAL"

# 2. Verificar itens no banco
echo ""
echo "2. ITENS NO BANCO..."
echo "-------------------"

ITEMS_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SAMIRA_BUDGET&select=*")

ITEMS_COUNT=$(echo "$ITEMS_DATA" | jq length)
echo "📊 Itens no banco: $ITEMS_COUNT"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo ""
    echo "📋 DETALHES DOS ITENS:"
    echo "$ITEMS_DATA" | jq '.[] | {
      description: .description,
      unit_price: .unit_price,
      total_price: .total_price
    }'
    
    ITEMS_TOTAL=$(echo "$ITEMS_DATA" | jq '[.[].total_price] | add')
    echo ""
    echo "💰 TOTAL DOS ITENS NO BANCO: R$ $ITEMS_TOTAL"
else
    echo "⚠️  Nenhum item no banco"
fi

# 3. Simular lógica do frontend
echo ""
echo "3. SIMULANDO LÓGICA DO FRONTEND..."
echo "----------------------------------"

echo "🧮 LÓGICA ATUAL (calculateCorrectTotal):"
echo ""

if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo "   ✅ Há itens no banco ($ITEMS_COUNT itens)"
    echo "   📊 Usando soma dos itens: R$ $ITEMS_TOTAL"
    echo "   ➕ Mais itens adicionais: R$ 25,00"
    echo "   🎯 Total esperado: R$ $(echo "$ITEMS_TOTAL + 25" | bc -l)"
else
    echo "   ❌ NÃO há itens no banco"
    echo "   📊 Deveria usar budget_result.total_price: R$ $BUDGET_RESULT_TOTAL"
    echo "   ➕ Mais itens adicionais: R$ 25,00"
    echo "   🎯 Total esperado: R$ $(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)"
fi

echo ""
echo "🚨 PROBLEMA IDENTIFICADO:"
echo "   O frontend está calculando apenas os itens adicionais (R$ 25,00)"
echo "   Não está considerando o valor base do orçamento (R$ $BUDGET_RESULT_TOTAL)"

# 4. Verificar breakdown
echo ""
echo "4. ANALISANDO BREAKDOWN..."
echo "--------------------------"

BREAKDOWN=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.breakdown // empty')
if [ -n "$BREAKDOWN" ] && [ "$BREAKDOWN" != "null" ]; then
    echo "📋 BREAKDOWN DO ORÇAMENTO ORIGINAL:"
    echo "$BUDGET_DATA" | jq -r '.[0].budget_result.breakdown[] | "   - \(.item): R$ \(.value)"'
    
    echo ""
    echo "💡 SOLUÇÃO:"
    echo "   1. Mostrar breakdown original como 'itens base'"
    echo "   2. Somar itens adicionais ao total"
    echo "   3. Exibir total correto: R$ $(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)"
else
    echo "❌ Nenhum breakdown encontrado"
fi

echo ""
echo "============================================================"
echo "🔧 CORREÇÃO NECESSÁRIA:"
echo ""
echo "❌ PROBLEMA:"
echo "   - Frontend mostra apenas R$ 25,00 (só itens adicionais)"
echo "   - Não considera valor base de R$ $BUDGET_RESULT_TOTAL"
echo ""
echo "✅ SOLUÇÃO:"
echo "   - Corrigir função calculateCorrectTotal()"
echo "   - Garantir que valor base seja sempre incluído"
echo "   - Total correto: R$ $(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)"
echo ""
echo "🎯 VALOR ESPERADO FINAL: R$ $(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)"
echo "============================================================"
