# 🚀 Configuração do Supabase

Este guia explica como configurar o Supabase para persistência de dados do GeoRural Pro.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## 🛠️ Configuração Passo a Passo

### 1. **Executar Script de Configuração**

**⚡ SOLUÇÃO RECOMENDADA:** Execute um dos scripts completos:

#### **Opção A - Script Completo (Recomendado):**
```sql
-- Execute o arquivo: supabase/complete_setup.sql
-- Script mais completo com numeração sequencial de links
```

#### **Opção B - Script Simples (Se Opção A der erro):**
```sql
-- Execute o arquivo: supabase/simple_setup.sql  
-- Script mais básico, sem stored procedures complexas
```

#### **Scripts Alternativos (Método Antigo):**

**Para instalação nova:**
```sql
-- Execute: supabase/schema_safe.sql
```

**Para instalação existente com problemas:**
```sql
-- 1. Execute: supabase/fix_indexes.sql
-- 2. Execute: supabase/migrate_budgets.sql  
```

### 2. **Configurar Variáveis de Ambiente**

#### **Para Desenvolvimento Local:**
Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```bash
# Supabase Configuration
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA

# Frontend
REACT_APP_SUPABASE_URL=https://SEU-PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA
```

#### **Para Railway (Deploy):**
Configure no Railway Dashboard:
```bash
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA
REACT_APP_SUPABASE_URL=https://SEU-PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA
```

### 3. **Obter Credenciais do Supabase**

1. Vá para o dashboard do seu projeto Supabase
2. Navegue até **Settings** → **API**
3. Copie:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)

### 4. **Verificar Configuração**

#### **Teste Local:**
```bash
# Instalar dependências
npm install
pip install -r requirements.txt

# Iniciar backend
cd backend && python main.py

# Iniciar frontend  
npm start
```

#### **Teste no Supabase:**
Execute no SQL Editor:
```sql
-- Verificar se tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Testar inserção de orçamento
INSERT INTO budgets (
  budget_request, 
  budget_result, 
  custom_link
) VALUES (
  '{"client_name": "Teste"}',
  '{"total_price": 1000}',
  'teste-001'
);
```

## 🔄 Migração de Dados Existentes

Se você já tinha dados em SQLite:

1. **Backup dos dados SQLite:**
   ```bash
   cp data/budgets.db data/budgets_backup.db
   ```

2. **Sistema híbrido:** O sistema automaticamente detecta se o Supabase está configurado e usa SQLite como fallback.

3. **Migração manual:** Os dados precisam ser migrados manualmente do SQLite para Supabase se necessário.

## 🐛 Resolução de Problemas

### **Erro: "relation already exists"**
```sql
-- Execute fix_indexes.sql para corrigir conflitos
```

### **Erro: "duplicate key"**
```sql
-- Normal durante upserts, o sistema trata automaticamente
```

### **Sistema usando SQLite em vez de Supabase:**
- Verifique se as variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas
- Verifique os logs para ver qual sistema está sendo usado

### **Dados não persistindo:**
- Verifique se RLS (Row Level Security) está configurado corretamente
- Execute o script de migração se necessário

## ✅ Vantagens do Supabase

- ✅ **Persistência Garantida:** Dados salvos em PostgreSQL robusto
- ✅ **Escalabilidade:** Suporta milhares de usuários simultâneos  
- ✅ **Backup Automático:** Backups regulares e restore point
- ✅ **Real-time:** Updates em tempo real entre usuários
- ✅ **Segurança:** RLS e autenticação integrada
- ✅ **Dashboard:** Interface visual para gerenciar dados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend (`python main.py`)
2. Consulte os logs do Supabase Dashboard
3. Execute os scripts de verificação fornecidos