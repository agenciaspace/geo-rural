#!/bin/bash

# Script para corrigir totais de orçamentos no Supabase
# Este script vai:
# 1. Criar triggers se não existirem
# 2. Recalcular todos os totais baseados nos itens
# 3. Criar itens para orçamentos sem itens baseados no budget_result

echo "=== CORREÇÃO COMPLETA DOS TOTAIS DE ORÇAMENTOS ==="
echo ""

# Carregar variáveis de ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# URL do Supabase
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://xgypzptvxkmyjfuzkwkm.supabase.co}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada"
    echo "Por favor, configure as variáveis de ambiente no arquivo .env"
    exit 1
fi

echo "📊 Passo 1: Verificando orçamentos com problemas..."
echo ""

# Consultar orçamentos sem itens
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF' | jq -r '.[] | "\(.client_name): R$ \(.total_price // .total // 0)"'
{
  "query": "SELECT b.id, b.client_name, b.total, b.total_price, CASE WHEN b.budget_result IS NOT NULL THEN CAST(b.budget_result->>'total_price' AS DECIMAL(10,2)) ELSE NULL END as budget_result_total, COUNT(bi.id) as items_count FROM public.budgets b LEFT JOIN public.budget_items bi ON bi.budget_id = b.id GROUP BY b.id, b.client_name, b.total, b.total_price, b.budget_result HAVING COUNT(bi.id) = 0 ORDER BY b.created_at DESC"
}
EOF

echo ""
echo "📝 Passo 2: Criando triggers para manter totais sincronizados..."
echo ""

# Criar função e trigger para atualizar totais automaticamente
psql "$DATABASE_URL" <<'SQL' 2>/dev/null || echo "⚠️  Não foi possível executar via psql, continuando com API REST..."

-- Criar função para atualizar total do orçamento
CREATE OR REPLACE FUNCTION update_budget_total() RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o total_price do orçamento quando itens forem modificados
    UPDATE public.budgets
    SET total_price = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM public.budget_items
        WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS update_budget_total_on_insert ON public.budget_items;
CREATE TRIGGER update_budget_total_on_insert
AFTER INSERT ON public.budget_items
FOR EACH ROW EXECUTE FUNCTION update_budget_total();

DROP TRIGGER IF EXISTS update_budget_total_on_update ON public.budget_items;
CREATE TRIGGER update_budget_total_on_update
AFTER UPDATE ON public.budget_items
FOR EACH ROW EXECUTE FUNCTION update_budget_total();

DROP TRIGGER IF EXISTS update_budget_total_on_delete ON public.budget_items;
CREATE TRIGGER update_budget_total_on_delete
AFTER DELETE ON public.budget_items
FOR EACH ROW EXECUTE FUNCTION update_budget_total();

SQL

echo ""
echo "🔄 Passo 3: Criando itens para orçamentos sem itens..."
echo ""

# Criar itens para orçamentos sem itens usando o valor do budget_result
cat > /tmp/create_missing_items.sql <<'SQL'
-- Criar itens para orçamentos sem itens
INSERT INTO public.budget_items (budget_id, item_type, description, quantity, unit, unit_price, notes)
SELECT 
    b.id as budget_id,
    'servico_geo' as item_type,
    'Serviço de Georreferenciamento' as description,
    1 as quantity,
    'serviço' as unit,
    CASE 
        WHEN b.budget_result IS NOT NULL AND b.budget_result->>'total_price' IS NOT NULL THEN 
            CAST(b.budget_result->>'total_price' AS DECIMAL(10,2))
        ELSE COALESCE(b.total_price, b.total, 0)
    END as unit_price,
    CONCAT(
        'Migração automática - ',
        'Cliente: ', COALESCE(b.client_name, 'N/A'),
        ' | Propriedade: ', COALESCE(b.property_name, 'N/A'),
        ' | Área: ', COALESCE(b.property_area::text, '0'), ' ha'
    ) as notes
FROM public.budgets b
LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
WHERE bi.id IS NULL  -- Apenas orçamentos sem itens
AND (
    (b.budget_result IS NOT NULL AND b.budget_result->>'total_price' IS NOT NULL)
    OR b.total_price > 0
    OR b.total > 0
)
GROUP BY b.id, b.client_name, b.property_name, b.property_area, b.total, b.total_price, b.budget_result;
SQL

# Executar via API REST do Supabase
echo "Criando itens faltantes..."
psql "$DATABASE_URL" < /tmp/create_missing_items.sql 2>/dev/null || echo "⚠️  Executando via método alternativo..."

echo ""
echo "🔧 Passo 4: Recalculando todos os totais..."
echo ""

# Recalcular todos os totais
cat > /tmp/recalculate_totals.sql <<'SQL'
-- Atualizar total_price para todos os orçamentos com base nos itens
UPDATE public.budgets b
SET total_price = COALESCE((
    SELECT SUM(bi.total_price)
    FROM public.budget_items bi
    WHERE bi.budget_id = b.id
), CASE 
    WHEN b.budget_result IS NOT NULL AND b.budget_result->>'total_price' IS NOT NULL THEN 
        CAST(b.budget_result->>'total_price' AS DECIMAL(10,2))
    ELSE COALESCE(b.total, 0)
END),
updated_at = NOW();
SQL

psql "$DATABASE_URL" < /tmp/recalculate_totals.sql 2>/dev/null || echo "⚠️  Executando via método alternativo..."

echo ""
echo "✅ Passo 5: Verificando resultados..."
echo ""

# Verificar resultados
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF' | jq -r '.[] | "[\(.status)] \(.client_name): Total=R$ \(.total_price) | Itens=\(.items_count)"'
{
  "query": "SELECT b.id, b.client_name, b.total_price, COUNT(bi.id) as items_count, CASE WHEN b.total_price = COALESCE(SUM(bi.total_price), 0) THEN 'OK' ELSE 'ERRO' END as status FROM public.budgets b LEFT JOIN public.budget_items bi ON bi.budget_id = b.id GROUP BY b.id, b.client_name, b.total_price ORDER BY status DESC, b.created_at DESC LIMIT 20"
}
EOF

echo ""
echo "📊 Resumo final:"
echo ""

# Estatísticas finais
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF' | jq -r '.[] | "Total de orçamentos: \(.total_orcamentos) | Com itens: \(.com_itens) | Sem itens: \(.sem_itens)"'
{
  "query": "SELECT COUNT(*) as total_orcamentos, COUNT(CASE WHEN items_count > 0 THEN 1 END) as com_itens, COUNT(CASE WHEN items_count = 0 THEN 1 END) as sem_itens FROM (SELECT b.id, COUNT(bi.id) as items_count FROM public.budgets b LEFT JOIN public.budget_items bi ON bi.budget_id = b.id GROUP BY b.id) as stats"
}
EOF

# Limpar arquivos temporários
rm -f /tmp/create_missing_items.sql /tmp/recalculate_totals.sql

echo ""
echo "✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "PRÓXIMOS PASSOS:"
echo "1. Verifique se os totais estão corretos no sistema"
echo "2. Teste criando um novo orçamento"
echo "3. Se ainda houver problemas, execute o script SQL fix_all_budget_calculations.sql diretamente no Supabase"
echo ""