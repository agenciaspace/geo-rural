# Instruções para Implementar Itens Detalhados de Orçamento

## Resumo
Esta atualização adiciona a funcionalidade de criar orçamentos mais detalhados e completos, permitindo adicionar diferentes tipos de itens além dos serviços de georreferenciamento.

## Arquivos Criados/Modificados

1. **SQL Migration**: `supabase/create_budget_items_tables.sql`
   - Cria tabela `budget_items` para armazenar itens detalhados
   - Cria tabela `budget_item_templates` para templates reutilizáveis
   - Adiciona triggers para atualização automática de totais
   - Configura RLS (Row Level Security)
   - Migra dados existentes

2. **Componente de Gerenciamento**: `src/components/BudgetItemsManager.js`
   - Interface para adicionar/editar/excluir itens do orçamento
   - Suporte para diferentes tipos de itens (serviços, insumos, deslocamento, etc.)
   - Templates rápidos para facilitar adição
   - Cálculo automático de totais

3. **Integração no BudgetHub**: `src/components/BudgetHub.js`
   - Adicionado botão "📋 Itens" na lista de orçamentos
   - Modal para gerenciar itens de cada orçamento
   - Importação do componente BudgetItemsManager

4. **Visualização Detalhada**: `src/components/BudgetDetails.js`
   - Exibe breakdown completo de custos por categoria
   - Mostra quantidade, valor unitário e total de cada item
   - Agrupa itens por tipo com cores distintivas

## Como Executar

1. **Execute a migração SQL no Supabase**:
   ```bash
   # Via Supabase CLI
   supabase db push < supabase/create_budget_items_tables.sql
   
   # Ou copie o conteúdo do arquivo e execute no SQL Editor do Supabase Dashboard
   ```

2. **Reinicie o servidor de desenvolvimento** para garantir que os novos componentes sejam carregados.

## Funcionalidades Adicionadas

### Tipos de Itens Suportados:
- **Serviços de Georreferenciamento**: Serviços principais
- **Insumos/Materiais**: Marcos, placas, materiais diversos
- **Deslocamento**: Combustível, pedágios
- **Hospedagem**: Diárias de hotel
- **Alimentação**: Refeições da equipe
- **Outros**: Taxas, ART, custos diversos

### Templates Padrão:
- Marco de concreto (R$ 25,00/unidade)
- Placa de identificação (R$ 80,00/unidade)
- Combustível (R$ 1,20/km)
- Pedágio (R$ 15,00/unidade)
- Diária hotel (R$ 150,00/diária)
- Refeição (R$ 35,00/unidade)
- Taxa de ART (R$ 250,00/unidade)

### Características:
- Cálculo automático de totais
- Agrupamento visual por categoria
- Possibilidade de adicionar observações em cada item
- Interface intuitiva com cores distintivas
- Totais atualizados em tempo real

## Observações

- Os dados existentes foram migrados automaticamente para a nova estrutura
- O campo `total_price` na tabela `budgets` será atualizado automaticamente pelos triggers
- Cada usuário pode criar seus próprios templates personalizados
- A segurança RLS garante que usuários só vejam seus próprios dados

## Próximos Passos Sugeridos

1. Adicionar funcionalidade de duplicar orçamentos com todos os itens
2. Criar relatórios de custos por categoria
3. Adicionar opção de desconto global no orçamento
4. Implementar histórico de alterações nos itens