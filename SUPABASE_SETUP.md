# 🔧 Configuração do Supabase para OnGeo

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Credenciais do projeto (URL e Anon Key)

## 🗄️ Configuração do Banco de Dados

### 1. Executar o Schema Principal

1. Abra o **SQL Editor** no painel do Supabase
2. Copie e cole o conteúdo do arquivo `supabase_schema.sql`
3. Execute o script

Este script criará:
- ✅ Tabela `leads` (captura de leads)
- ✅ Tabela `clients` (gerenciamento de clientes)
- ✅ Tabela `budgets` (orçamentos)
- ✅ Tabela `gnss_analyses` (análises GNSS)
- ✅ Políticas RLS (Row Level Security)
- ✅ Triggers automáticos
- ✅ Índices para performance

### 2. Configurar Storage para Arquivos GNSS

1. Vá para **Storage** no painel do Supabase
2. Clique em **"New bucket"**
3. Configure:
   - **Nome**: `gnss-files`
   - **Public**: `false` (privado)
4. Clique em **"Create bucket"**

### 3. Configurar Políticas do Storage

1. Abra o **SQL Editor** novamente
2. Copie e cole o conteúdo do arquivo `supabase_storage_setup.sql`
3. Execute o script

## 🔑 Configuração da Autenticação

### 1. Configurar Provedores de Auth

1. Vá para **Authentication** > **Providers**
2. Configure **Email**:
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - ✅ Enable secure email change

### 2. Configurar URLs de Callback

1. Vá para **Authentication** > **URL Configuration**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**: 
     - `http://localhost:3000`
     - `http://localhost:8000`
     - `https://seudominio.com` (produção)

## 📊 Verificação da Configuração

### 1. Verificar Tabelas

Execute no SQL Editor:

```sql
-- Verificar se todas as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'clients', 'budgets', 'gnss_analyses');

-- Verificar políticas RLS
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. Verificar Storage

```sql
-- Verificar bucket
SELECT * FROM storage.buckets WHERE name = 'gnss-files';

-- Verificar políticas do storage
SELECT * FROM storage.policies WHERE bucket_id = 'gnss-files';
```

### 3. Testar Autenticação

1. Crie um usuário de teste via **Authentication** > **Users**
2. Teste login na aplicação
3. Verifique se o onboarding aparece para usuários sem perfil completo

## 🔐 Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```bash
# .env.local
REACT_APP_SUPABASE_URL=https://sua-url.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 🚀 Estrutura das Tabelas

### `leads`
- Captura de leads da landing page
- Campos: name, email, phone, company, message

### `clients`
- Gerenciamento de clientes
- Campos: name, email, phone, client_type, document, company_name, address, notes
- Relação: user_id (FK para auth.users)

### `budgets`
- Orçamentos com dados flexíveis em JSON
- Campos: budget_request, budget_result, custom_link, status
- Relações: user_id (FK para auth.users), client_id (FK para clients)

### `gnss_analyses`
- Análises de arquivos GNSS
- Campos: filename, file_path, analysis_result, quality_color, processing_status
- Relação: user_id (FK para auth.users)

## 🔒 Segurança (RLS)

Todas as tabelas têm Row Level Security configurado:

- **leads**: Inserção pública, visualização apenas para admins
- **clients**: Usuários só veem seus próprios dados
- **budgets**: Usuários só veem seus próprios dados + visualização pública via custom_link
- **gnss_analyses**: Usuários só veem seus próprios dados

## 📝 Dados de Teste (Opcional)

Para testar a aplicação, você pode inserir dados manualmente:

```sql
-- Exemplo de cliente de teste (substitua user_id por um ID real)
INSERT INTO public.clients (user_id, name, email, phone, client_type) 
VALUES (
    'seu-user-id-aqui',
    'João Silva',
    'joao@teste.com',
    '(11) 99999-9999',
    'pessoa_fisica'
);
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Verifique se o script `supabase_schema.sql` foi executado completamente
- Confirme que as tabelas foram criadas no schema `public`

### Erro: "RLS policy violation"
- Verifique se o usuário está autenticado
- Confirme que as políticas RLS foram criadas corretamente

### Erro: "Storage bucket not found"
- Verifique se o bucket `gnss-files` foi criado
- Execute o script `supabase_storage_setup.sql`

## 💡 Próximos Passos

1. Execute os scripts SQL fornecidos
2. Teste a aplicação localmente
3. Verifique se todas as funcionalidades estão funcionando
4. Configure o domínio em produção nas URLs de callback

---

✅ **Configuração concluída!** A aplicação OnGeo agora está conectada ao Supabase com todas as tabelas e políticas de segurança configuradas.