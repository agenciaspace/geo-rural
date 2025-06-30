# 📚 Scripts de Automação - GeoRural Pro

Este documento explica como usar os scripts de automação do projeto GeoRural Pro.

## 🚀 Scripts Disponíveis

### 1. `start-server.sh` - Iniciar Servidor Local
Script completo para iniciar o servidor de desenvolvimento local.

```bash
./start-server.sh
```

**O que faz:**
- ✅ Verifica dependências (Node.js, Python3)
- ✅ Libera porta 8000 se estiver em uso
- ✅ Instala/atualiza dependências do frontend e backend
- ✅ Cria ambiente virtual Python se necessário
- ✅ Realiza build do React
- ✅ Inicia o servidor na porta 8000

**Requisitos:**
- Node.js instalado
- Python 3 instalado
- Porta 8000 disponível

---

### 2. `deploy.sh` - Deploy Master
Script principal que coordena todos os tipos de deploy.

```bash
./deploy.sh
```

**Opções disponíveis:**
1. **Deploy completo** (GitHub + Vercel)
2. **Deploy apenas no GitHub**
3. **Deploy apenas na Vercel**
4. **Build de produção** (sem deploy)
5. **Cancelar**

---

### 3. `deploy-github.sh` - Deploy para GitHub
Script para fazer commit e push das mudanças para o GitHub.

```bash
./deploy-github.sh
```

**O que faz:**
- ✅ Verifica configuração do Git
- ✅ Mostra status das mudanças
- ✅ Permite mensagem de commit customizada
- ✅ Faz commit e push automático
- ✅ Mostra links úteis do repositório

**Requisitos:**
- Git configurado (user.name e user.email)
- Repositório Git inicializado
- Remote 'origin' configurado

---

### 4. `deploy-vercel.sh` - Deploy para Vercel
Script para fazer deploy do projeto na Vercel.

```bash
./deploy-vercel.sh
```

**O que faz:**
- ✅ Instala Vercel CLI se necessário
- ✅ Verifica/cria build do React
- ✅ Cria vercel.json se não existir
- ✅ Configura variáveis de ambiente (opcional)
- ✅ Faz deploy de produção
- ✅ Mostra URL do projeto

**Requisitos:**
- Conta na Vercel
- Internet ativa

---

## 🛠️ Configuração Inicial

### 1. Tornar scripts executáveis (já feito)
```bash
chmod +x start-server.sh deploy.sh deploy-github.sh deploy-vercel.sh
```

### 2. Configurar Git (se necessário)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 3. Configurar repositório GitHub
```bash
git init
git remote add origin https://github.com/SEU_USUARIO/geo-rural.git
```

### 4. Instalar Vercel CLI (opcional)
```bash
npm install -g vercel
```

---

## 🎯 Fluxo de Trabalho Recomendado

### Desenvolvimento Local
```bash
# 1. Iniciar servidor local
./start-server.sh

# 2. Desenvolver e testar
# Acesse: http://localhost:8000

# 3. Parar servidor: Ctrl+C
```

### Deploy Completo
```bash
# 1. Garantir que tudo está funcionando
./start-server.sh
# Testar... então Ctrl+C

# 2. Fazer deploy completo
./deploy.sh
# Escolher opção 1 (GitHub + Vercel)

# 3. Verificar deploy
# GitHub: https://github.com/SEU_USUARIO/geo-rural
# Vercel: URL fornecida pelo script
```

### Deploy Rápido (só GitHub)
```bash
# Para salvar mudanças rapidamente
./deploy-github.sh
```

### Deploy Rápido (só Vercel)
```bash
# Para atualizar produção sem commit
./deploy-vercel.sh
```

---

## 🔧 Solução de Problemas

### Erro: "porta 8000 em uso"
O script `start-server.sh` tenta liberar automaticamente. Se persistir:
```bash
lsof -ti:8000 | xargs kill -9
```

### Erro: "Git não configurado"
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Erro: "Remote origin não existe"
```bash
git remote add origin https://github.com/SEU_USUARIO/geo-rural.git
```

### Erro na Vercel
```bash
# Fazer login novamente
vercel login

# Verificar projeto
vercel inspect

# Ver logs
vercel logs
```

### Build do React falha
```bash
# Limpar cache
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📝 Variáveis de Ambiente

### Para desenvolvimento local
Crie um arquivo `.env` na raiz do projeto:
```env
REACT_APP_SUPABASE_URL=sua_url_aqui
REACT_APP_SUPABASE_ANON_KEY=sua_chave_aqui
```

### Para produção (Vercel)
O script `deploy-vercel.sh` pergunta se você quer configurar.
Ou configure manualmente em: https://vercel.com/dashboard

---

## 🎨 Personalização dos Scripts

### Mudar porta do servidor
Edite `start-server.sh` e `backend/main.py`:
```bash
# Trocar 8000 por outra porta
```

### Mudar branch padrão do Git
Edite `deploy-github.sh`:
```bash
CURRENT_BRANCH="main"  # ou "master"
```

### Adicionar mais variáveis de ambiente
Edite `deploy-vercel.sh` na seção de variáveis.

---

## 💡 Dicas

1. **Sempre teste localmente** antes de fazer deploy
2. **Use mensagens de commit descritivas**
3. **Configure variáveis de ambiente** antes do primeiro deploy
4. **Monitore os logs** após o deploy
5. **Faça backup** antes de grandes mudanças

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique esta documentação
2. Consulte os logs de erro
3. Verifique os arquivos `*-GUIDE.md` do projeto
4. Abra uma issue no GitHub

---

**GeoRural Pro** - Automatizando o desenvolvimento e deploy! 🚀 