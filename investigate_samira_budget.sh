#!/bin/bash

# Script para investigar o orçamento da Samiraaaa e o item de R$ 25,00

# Configurações do Supabase
SUPABASE_URL="https://lywwxzfnhzbdkxnblvcf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ"

SAMIRA_BUDGET="7c3c891a-e491-4412-918a-bd5a0ac558ae"

echo "🔍 INVESTIGANDO ORÇAMENTO DA SAMIRAAAA"
echo "============================================================"

# 1. Verificar dados completos do orçamento
echo ""
echo "1. DADOS COMPLETOS DO ORÇAMENTO..."
echo "----------------------------------"

BUDGET_DATA=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budgets?id=eq.$SAMIRA_BUDGET&select=*")

echo "📋 ORÇAMENTO COMPLETO:"
echo "$BUDGET_DATA" | jq '.[0] | {
  id: .id,
  client_name: .client_name,
  total: .total,
  total_price: .total_price,
  budget_result_total: .budget_result.total_price,
  created_at: .created_at,
  updated_at: .updated_at
}'

# 2. Verificar TODOS os itens relacionados a este orçamento
echo ""
echo "2. VERIFICANDO TODOS OS ITENS..."
echo "--------------------------------"

ALL_ITEMS=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SAMIRA_BUDGET&select=*")

ITEMS_COUNT=$(echo "$ALL_ITEMS" | jq length)
echo "📊 Total de itens encontrados: $ITEMS_COUNT"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo ""
    echo "📋 DETALHES DOS ITENS:"
    echo "ID | Descrição | Qtd | Preço Unit. | Total | Criado"
    echo "---|-----------|-----|-------------|-------|-------"
    
    TOTAL_ITEMS=0
    echo "$ALL_ITEMS" | jq -r '.[] | "\(.id)|\(.description)|\(.quantity)|\(.unit_price)|\(.total_price)|\(.created_at)"' | while IFS='|' read -r id desc qty unit_price total created; do
        printf "%.8s | %-20s | %3s | %11s | %5s | %s\n" "$id" "$desc" "$qty" "R$ $unit_price" "R$ $total" "$created"
    done
    
    # Calcular total dos itens
    CALCULATED_TOTAL=$(echo "$ALL_ITEMS" | jq '[.[].total_price] | add')
    echo ""
    echo "💰 TOTAL CALCULADO DOS ITENS: R$ $CALCULATED_TOTAL"
    
    # Verificar se há item de R$ 25
    ITEM_25=$(echo "$ALL_ITEMS" | jq '.[] | select(.total_price == 25 or .unit_price == 25)')
    if [ -n "$ITEM_25" ] && [ "$ITEM_25" != "null" ]; then
        echo ""
        echo "🎯 ITEM DE R$ 25,00 ENCONTRADO:"
        echo "$ITEM_25" | jq '{
          id: .id,
          description: .description,
          quantity: .quantity,
          unit_price: .unit_price,
          total_price: .total_price,
          created_at: .created_at
        }'
    else
        echo ""
        echo "❌ ITEM DE R$ 25,00 NÃO ENCONTRADO NOS ITENS!"
    fi
else
    echo "❌ Nenhum item encontrado!"
fi

# 3. Verificar histórico de atualizações
echo ""
echo "3. VERIFICANDO HISTÓRICO..."
echo "---------------------------"

CURRENT_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].total_price')
BUDGET_RESULT_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.total_price')
ORIGINAL_TOTAL=$(echo "$BUDGET_DATA" | jq -r '.[0].total')

echo "📊 COMPARAÇÃO DE VALORES:"
echo "   Total original (campo 'total'): R$ $ORIGINAL_TOTAL"
echo "   Budget result total: R$ $BUDGET_RESULT_TOTAL"
echo "   Total price atual: R$ $CURRENT_TOTAL"

# 4. Buscar em outras tabelas possíveis
echo ""
echo "4. BUSCANDO EM OUTRAS TABELAS..."
echo "---------------------------------"

# Verificar se há algum registro relacionado em outras tabelas
echo "🔍 Buscando referências ao orçamento em outras tabelas..."

# Verificar se há algum campo que possa conter o valor 25
BUDGET_FIELDS=$(echo "$BUDGET_DATA" | jq -r '.[0] | to_entries[] | select(.value == 25 or .value == "25" or .value == 25.0) | "\(.key): \(.value)"')

if [ -n "$BUDGET_FIELDS" ]; then
    echo "🎯 CAMPOS COM VALOR 25 ENCONTRADOS:"
    echo "$BUDGET_FIELDS"
else
    echo "❌ Nenhum campo com valor 25 encontrado no orçamento"
fi

# 5. Verificar se o valor 25 está em algum lugar do JSON
echo ""
echo "5. BUSCA DETALHADA POR VALOR 25..."
echo "-----------------------------------"

echo "🔍 Procurando '25' em todo o JSON do orçamento..."
CONTAINS_25=$(echo "$BUDGET_DATA" | jq -r '.[0] | tostring' | grep -o "25" | wc -l)
echo "📊 Ocorrências do número '25': $CONTAINS_25"

if [ "$CONTAINS_25" -gt 0 ]; then
    echo ""
    echo "🎯 CONTEXTO DAS OCORRÊNCIAS:"
    echo "$BUDGET_DATA" | jq '.[0]' | grep -n "25" || echo "Não encontrado com grep"
fi

# 6. Verificar breakdown detalhado
echo ""
echo "6. ANALISANDO BREAKDOWN DETALHADO..."
echo "------------------------------------"

BREAKDOWN=$(echo "$BUDGET_DATA" | jq -r '.[0].budget_result.breakdown // empty')
if [ -n "$BREAKDOWN" ] && [ "$BREAKDOWN" != "null" ]; then
    echo "📋 BREAKDOWN DO ORÇAMENTO:"
    echo "$BUDGET_DATA" | jq -r '.[0].budget_result.breakdown[] | "- \(.item): R$ \(.value)"'
    
    # Verificar se há item de 25 no breakdown
    BREAKDOWN_25=$(echo "$BUDGET_DATA" | jq '.[] | .budget_result.breakdown[] | select(.value == 25)')
    if [ -n "$BREAKDOWN_25" ] && [ "$BREAKDOWN_25" != "null" ]; then
        echo ""
        echo "🎯 ITEM DE R$ 25 NO BREAKDOWN:"
        echo "$BREAKDOWN_25"
    fi
else
    echo "❌ Nenhum breakdown encontrado"
fi

# 7. Verificar logs de auditoria (se existir)
echo ""
echo "7. VERIFICANDO POSSÍVEIS LOGS..."
echo "--------------------------------"

# Verificar se há alguma tabela de auditoria ou logs
AUDIT_CHECK=$(curl -s \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/budget_items?budget_id=eq.$SAMIRA_BUDGET&select=*&order=created_at.desc")

echo "🔍 Verificando histórico de itens (ordenado por data)..."
AUDIT_COUNT=$(echo "$AUDIT_CHECK" | jq length)
echo "📊 Registros encontrados: $AUDIT_COUNT"

# 8. Propor correção
echo ""
echo "8. PROPOSTA DE CORREÇÃO..."
echo "--------------------------"

if [ "$ITEMS_COUNT" -gt 0 ]; then
    ITEMS_TOTAL=$(echo "$ALL_ITEMS" | jq '[.[].total_price] | add')
    EXPECTED_TOTAL=$(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)
    
    echo "💡 ANÁLISE:"
    echo "   Soma atual dos itens: R$ $ITEMS_TOTAL"
    echo "   Total do budget_result: R$ $BUDGET_RESULT_TOTAL"
    echo "   Total esperado (com item de R$ 25): R$ $EXPECTED_TOTAL"
    
    echo ""
    echo "🔧 POSSÍVEIS SOLUÇÕES:"
    echo "1. Criar item de R$ 25,00 se não existir"
    echo "2. Atualizar total_price para considerar todos os itens"
    echo "3. Verificar se o item foi deletado acidentalmente"
    
    # Verificar se devemos criar o item
    if [ "$ITEMS_TOTAL" != "$EXPECTED_TOTAL" ]; then
        echo ""
        echo "❓ QUER CRIAR O ITEM DE R$ 25,00? (y/n)"
        echo "   (Este script apenas identifica o problema)"
    fi
else
    echo "💡 RECOMENDAÇÃO:"
    echo "   Criar item de R$ 25,00 para este orçamento"
    echo "   Total final seria: R$ $(echo "$BUDGET_RESULT_TOTAL + 25" | bc -l)"
fi

echo ""
echo "============================================================"
echo "🎯 RESUMO DA INVESTIGAÇÃO:"
echo ""
echo "📊 ESTADO ATUAL:"
echo "   - Orçamento: $SAMIRA_BUDGET (Samiraaaa)"
echo "   - Total Price: R$ $CURRENT_TOTAL"
echo "   - Budget Result: R$ $BUDGET_RESULT_TOTAL"
echo "   - Itens encontrados: $ITEMS_COUNT"
echo ""
echo "🔍 SOBRE O ITEM DE R$ 25,00:"
if [ "$ITEMS_COUNT" -gt 0 ]; then
    echo "   - Status: Verificar detalhes acima"
else
    echo "   - Status: NÃO ENCONTRADO"
    echo "   - Ação: Precisa ser criado"
fi
echo ""
echo "💡 PRÓXIMO PASSO:"
echo "   Verificar se o item de R$ 25,00 deve ser adicionado"
echo "   e atualizar o total_price adequadamente"
echo "============================================================"
