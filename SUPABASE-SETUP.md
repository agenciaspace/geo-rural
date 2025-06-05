# Configuração do Supabase - GeoRural Pro

## 📋 Passos para Configurar o Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta ou faça login
4. Clique em "New project"
5. Configure:
   - **Organization**: Selecione ou crie uma organização
   - **Name**: `georural-pro`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (South America - São Paulo)
6. Clique em "Create new project"

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para "SQL Editor"
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
4. Execute o SQL clicando em "Run"

### 3. Configurar Storage

1. Vá para "Storage" no painel lateral
2. Clique em "New query" novamente
3. Copie e cole o conteúdo do arquivo `supabase/storage.sql`
4. Execute o SQL

### 4. Configurar Autenticação

1. Vá para "Authentication" > "Settings"
2. Configure:
   - **Site URL**: `http://localhost:3000` (para desenvolvimento)
   - **Redirect URLs**: `http://localhost:3000/**` (para desenvolvimento)
3. Para produção, adicione também:
   - **Site URL**: `https://seu-dominio.vercel.app`
   - **Redirect URLs**: `https://seu-dominio.vercel.app/**`

### 5. Obter Chaves da API

1. Vá para "Settings" > "API"
2. Anote os seguintes valores:
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 6. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Edite o arquivo `.env.local` com suas chaves:
   ```env
   REACT_APP_SUPABASE_URL=https://xxxxxxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 7. Testar a Integração

1. Inicie o projeto:
   ```bash
   cd frontend
   npm start
   ```

2. Teste as funcionalidades:
   - ✅ Captura de leads na landing page
   - ✅ Login/cadastro de usuários
   - ✅ Upload de arquivos GNSS
   - ✅ Criação de orçamentos
   - ✅ Dashboard com dados do usuário

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **leads**: Captura de leads da landing page
- **user_profiles**: Perfis estendidos dos usuários
- **budgets**: Orçamentos criados
- **gnss_analyses**: Análises de arquivos GNSS
- **transactions**: Histórico de pagamentos
- **activity_logs**: Logs de atividade

### Storage Buckets

- **gnss-files**: Arquivos RINEX privados
- **proposals**: Propostas em PDF públicas

## 🔐 Segurança (RLS)

Todas as tabelas têm Row Level Security ativado:
- Usuários só veem seus próprios dados
- Leads são acessíveis publicamente para captura
- Storage tem políticas por usuário

## 🚀 Deploy na Vercel

Para o deploy na Vercel, configure as variáveis de ambiente:

1. No painel da Vercel, vá para seu projeto
2. "Settings" > "Environment Variables"
3. Adicione:
   ```
   REACT_APP_SUPABASE_URL = https://xxxxxxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 📊 Monitoramento

No painel do Supabase você pode monitorar:
- **Database**: Performance e uso
- **Auth**: Usuários registrados
- **Storage**: Arquivos enviados
- **Logs**: Erros e atividade

## 🆘 Solução de Problemas

### Erro de CORS
Se houver erros de CORS, verifique:
1. Site URL configurado corretamente
2. Redirect URLs incluem wildcards (`/**`)

### Erro de RLS
Se não conseguir acessar dados:
1. Verifique se o usuário está autenticado
2. Confirme que as políticas RLS estão ativas

### Erro de Storage
Para problemas de upload:
1. Verifique se os buckets existem
2. Confirme as políticas de storage
3. Verifique o tamanho do arquivo (limite de 50MB)

## 💡 Recursos Avançados

### Webhooks
Configure webhooks para:
- Enviar email de boas-vindas
- Notificar novos leads
- Processar pagamentos

### Funções Edge
Use Edge Functions para:
- Processamento GNSS avançado
- Geração de PDF server-side
- Integração com APIs externas

### Backup
Configure backups automáticos:
- Database: Backup diário automático
- Storage: Sync com S3/Google Cloud

---

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Guide](https://supabase.com/docs/guides/auth)