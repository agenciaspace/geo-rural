# 🔧 Atualização do Schema Existente - OnGeo

## 📋 Situação Atual

Você já possui as seguintes tabelas no Supabase:
- ✅ `budgets` - Orçamentos
- ✅ `gnss_analyses` - Análises GNSS
- ✅ `leads` - Leads da landing page
- ✅ `user_profiles` - Perfis dos usuários
- ✅ `activity_logs` - Logs de atividade
- ✅ `transactions` - Transações

## 🔧 O que precisa ser adicionado

### 1. Tabela `clients` (faltando)
A aplicação precisa de uma tabela separada para gerenciar clientes.

### 2. Colunas na tabela `budgets`
- `client_id` - Para referenciar clientes da tabela clients

### 3. Colunas na tabela `user_profiles`
- `position` - Cargo do usuário
- `city` - Cidade do usuário
- `state` - Estado do usuário

### 4. Políticas RLS
Configurar Row Level Security para todas as tabelas.

## 🚀 Executar Atualização

### Passo 1: Executar Script de Atualização
1. Abra o **SQL Editor** no painel do Supabase
2. Copie e cole o conteúdo do arquivo `supabase_missing_tables.sql`
3. Execute o script

### Passo 2: Configurar Storage (se necessário)
Se você precisar da funcionalidade de upload de arquivos GNSS:
1. Vá para **Storage** no painel do Supabase
2. Crie um bucket chamado `gnss-files` (privado)
3. Execute o script `supabase_storage_setup.sql`

## 🔍 Verificações Pós-Execução

### 1. Verificar se a tabela clients foi criada
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'clients';
```

### 2. Verificar se as colunas foram adicionadas
```sql
-- Verificar client_id em budgets
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'budgets' 
AND column_name = 'client_id';

-- Verificar colunas do onboarding em user_profiles
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('position', 'city', 'state');
```

### 3. Verificar políticas RLS
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'budgets', 'user_profiles');
```

## 🔄 Mudanças na Aplicação

### Onboarding atualizado
- Agora usa a tabela `user_profiles` em vez de `user_metadata`
- Salva dados diretamente no banco de dados
- Verifica se o usuário precisa completar o onboarding

### Gerenciamento de Clientes
- Tabela `clients` separada do `budgets`
- Relacionamento via `client_id`
- Contador automático de orçamentos por cliente

### Segurança
- Todas as tabelas têm RLS habilitado
- Usuários só veem seus próprios dados
- Orçamentos públicos via `custom_link`

## 📊 Estrutura Final

```
auth.users (Supabase Auth)
├── user_profiles (perfil + onboarding)
├── clients (clientes do usuário)
│   └── budgets (orçamentos por cliente)
├── gnss_analyses (análises GNSS)
├── leads (leads da landing)
├── activity_logs (logs de atividade)
└── transactions (transações)
```

## 🐛 Troubleshooting

### Se aparecer erro "relation already exists"
- Normal, significa que a tabela já existe
- Continue com o resto do script

### Se aparecer erro "column already exists"
- Normal, significa que a coluna já foi adicionada
- Continue com o resto do script

### Se aparecer erro "policy already exists"
- Normal, significa que a política já existe
- Continue com o resto do script

## ✅ Próximos Passos

1. Execute o script `supabase_missing_tables.sql`
2. Teste a aplicação
3. Verifique se o onboarding aparece para usuários sem perfil completo
4. Teste criação de clientes e orçamentos
5. Verifique se as políticas RLS estão funcionando

---

🎉 **Após executar o script, sua aplicação estará completamente funcional com o schema atualizado!**