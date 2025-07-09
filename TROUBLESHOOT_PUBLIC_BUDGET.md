# 🔧 Troubleshooting: Link Público de Orçamento

## 🎯 Problema
O link público `https://ongeo.up.railway.app/budget/orcamento-1752096006845` não está funcionando.

## 📋 Diagnóstico - Execute os passos na ordem

### 1. Verificar se o orçamento existe no banco
Execute o script `verify_budget_table.sql` no SQL Editor do Supabase para verificar:
- Se a tabela `budgets` existe
- Se tem a coluna `custom_link`
- Se o orçamento específico existe
- Se as políticas RLS estão configuradas

### 2. Verificar políticas RLS
Execute o script `supabase_public_budget_policy.sql` para criar as políticas que permitem:
- Leitura pública de orçamentos via `custom_link`
- Atualização pública para aprovação/rejeição

### 3. Testar acesso direto ao Supabase
Abra o arquivo `test_budget_access.html` no navegador para testar:
- Conexão com o Supabase
- Listagem de orçamentos
- Busca pelo orçamento específico

### 4. Verificar logs do navegador
Acesse o link e abra o console do navegador para ver os logs:
- Mensagens de debug do `BudgetViewer`
- Erros de conexão ou permissão
- Dados retornados do Supabase

## 🚨 Possíveis Problemas e Soluções

### Problema 1: Orçamento não existe
**Sintoma:** `Link não encontrado. Verifique se o endereço está correto.`
**Solução:** Verificar se o orçamento `orcamento-1752096006845` existe na tabela `budgets`

### Problema 2: Políticas RLS muito restritivas
**Sintoma:** `Erro de permissão. Verifique as políticas RLS do Supabase.`
**Solução:** Executar `supabase_public_budget_policy.sql` para criar políticas públicas

### Problema 3: Credenciais inválidas
**Sintoma:** `Erro de configuração do Supabase. Verifique as credenciais.`
**Solução:** Verificar se as variáveis de ambiente estão corretas

### Problema 4: Tabela não existe
**Sintoma:** `relation "budgets" does not exist`
**Solução:** Executar `supabase_missing_tables.sql` para criar tabelas

## 🔧 Correções Implementadas

### 1. Acesso público ao Supabase
- Criou cliente público separado para consultas sem autenticação
- Removeu dependência do backend para rotas públicas

### 2. Melhor tratamento de erros
- Códigos de erro específicos do Supabase
- Logs detalhados para debug
- Mensagens de erro mais informativas

### 3. Funções públicas no config
- `getByCustomLink()` - Busca orçamento por link
- `approveByCustomLink()` - Aprova orçamento
- `rejectByCustomLink()` - Rejeita orçamento

## 🧪 Para testar

1. **Teste local:** Execute `npm start` e acesse `http://localhost:3000/budget/orcamento-1752096006845`
2. **Teste produção:** Acesse `https://ongeo.up.railway.app/budget/orcamento-1752096006845`
3. **Verifique logs:** Abra console do navegador e veja mensagens de debug

## 🎉 Resultado esperado

O link deve:
- Carregar sem erro de "Orçamento Não Encontrado"
- Mostrar dados do orçamento
- Permitir aprovação/rejeição
- Funcionar sem necessidade de login

## 📱 Próximos passos

1. Execute os scripts SQL no Supabase
2. Teste o arquivo HTML de debug
3. Verifique os logs do navegador
4. Se ainda não funcionar, verifique se o orçamento existe no banco