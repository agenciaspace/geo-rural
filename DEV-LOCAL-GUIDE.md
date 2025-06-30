# 🛠️ Guia de Desenvolvimento Local - GeoRural Pro

Este guia ensina como configurar e executar o projeto GeoRural Pro localmente para desenvolvimento e testes.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (geralmente vem com Node.js)
- **Git** - [Download Git](https://git-scm.com/)

### Verificar instalações
```bash
python3 --version  # deve mostrar 3.8 ou superior
node --version     # deve mostrar 16 ou superior  
npm --version      # qualquer versão recente
```

## 🚀 Setup Rápido (Método Automatizado)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/georural-pro.git
cd georural-pro
```

### 2. Execute o setup automatizado
```bash
./dev-setup.sh
```

### 3. Inicie o projeto
```bash
./dev-start.sh
```

Pronto! O projeto estará rodando em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Setup Manual (Passo a Passo)

Se preferir fazer o setup manualmente ou se os scripts automáticos não funcionarem:

### 1. Configurar Backend Python

```bash
# Navegar para o diretório backend
cd backend

# Criar ambiente virtual Python
python3 -m venv venv

# Ativar ambiente virtual
# No macOS/Linux:
source venv/bin/activate
# No Windows:
# venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Voltar para raiz do projeto
cd ..
```

### 2. Configurar Frontend React

```bash
# Instalar dependências Node.js
npm install

# Criar arquivo de configuração local
cp .env.example .env.local
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` com suas configurações:

```bash
# Configuração obrigatória para desenvolvimento local
REACT_APP_API_URL=http://localhost:8000

# Configurações opcionais do Supabase (apenas se usar autenticação)
# REACT_APP_SUPABASE_URL=your_supabase_url
# REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## 🏃‍♂️ Executando o Projeto

### Método 1: Script Automatizado
```bash
./dev-start.sh
```

### Método 2: Manual (em terminais separados)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
npm start
```

## 🌐 Acessando a Aplicação

- **Frontend Principal**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs
- **Interface Admin da API**: http://localhost:8000/redoc

## 🧪 Funcionalidades Disponíveis Localmente

### ✅ Funcionam sem configuração extra:
- 📊 **Simulador de Orçamento**: Cálculo de preços por região
- 📡 **Upload GNSS**: Análise de arquivos RINEX
- 🏠 **Landing Page**: Interface completa
- 📋 **Formulários**: Captura de dados
- 📄 **Geração de PDF**: Propostas automáticas

### ⚠️ Requerem configuração do Supabase:
- 🔐 **Autenticação**: Login/logout de usuários
- 💾 **Banco de Dados**: Salvamento de dados
- ☁️ **Storage**: Armazenamento na nuvem

## 🔧 Configuração Opcional do Supabase

Se quiser testar as funcionalidades completas com banco de dados:

### 1. Criar projeto Supabase
1. Acesse https://supabase.com
2. Crie uma conta e um novo projeto
3. Anote a URL e chave anônima do projeto

### 2. Configurar banco de dados
Execute os scripts SQL na pasta `supabase/`:
```sql
-- Copie e execute supabase/schema.sql
-- Copie e execute supabase/storage.sql
```

### 3. Atualizar .env.local
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 🐛 Solução de Problemas

### Backend não inicia
- Verifique se Python 3.8+ está instalado
- Certifique-se que o ambiente virtual está ativado
- Reinstale dependências: `pip install -r backend/requirements.txt`

### Frontend não inicia
- Verifique se Node.js 16+ está instalado
- Limpe o cache: `npm cache clean --force`
- Reinstale dependências: `rm -rf node_modules && npm install`

### Erro de conexão entre frontend e backend
- Verifique se `.env.local` existe e tem `REACT_APP_API_URL=http://localhost:8000`
- Confirme que o backend está rodando na porta 8000
- Verifique se não há firewall bloqueando as portas

### Erro "command not found" nos scripts
```bash
# Dar permissão de execução aos scripts
chmod +x dev-setup.sh dev-start.sh
```

### Porta já em uso
Se as portas 3000 ou 8000 estiverem ocupadas:
```bash
# Para parar processos que usam a porta
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend

# Ou escolher portas diferentes
PORT=3001 npm start  # Frontend em porta 3001
uvicorn main:app --port 8001  # Backend em porta 8001
```

## 📁 Estrutura do Projeto Local

```
georural-pro/
├── src/                    # Código React (frontend)
├── backend/               # API Python (FastAPI)
├── public/               # Arquivos estáticos
├── supabase/            # Scripts SQL
├── dev-setup.sh         # Script de configuração
├── dev-start.sh         # Script de inicialização
├── .env.example         # Exemplo de configuração
├── .env.local          # Suas configurações (criar)
├── package.json        # Dependências Node.js
└── README.md          # Documentação geral
```

## 🔄 Comandos Úteis

```bash
# Parar todos os processos (Ctrl+C no terminal com dev-start.sh)

# Reinstalar dependências Python
cd backend && pip install -r requirements.txt

# Reinstalar dependências Node.js
npm install

# Limpar cache Node.js
npm cache clean --force

# Ver logs do backend com mais detalhes
cd backend && python -m uvicorn main:app --log-level debug

# Executar apenas testes do frontend
npm test

# Construir versão de produção local
npm run build
```

## 🎯 Próximos Passos

Após configurar o ambiente local:

1. **Explore a aplicação** visitando http://localhost:3000
2. **Teste o simulador** com diferentes cenários
3. **Faça upload de arquivos GNSS** para testar análise
4. **Consulte a API** em http://localhost:8000/docs
5. **Modifique o código** e veja as mudanças em tempo real

## 📞 Suporte

Se encontrar problemas:
1. Verifique este guia novamente
2. Consulte o [README.md](./README.md) principal
3. Abra uma [issue no GitHub](https://github.com/seu-usuario/georural-pro/issues)

---

Desenvolvido com ❤️ para facilitar o desenvolvimento local do GeoRural Pro. 