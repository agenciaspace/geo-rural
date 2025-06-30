# 🚀 Como Rodar o GeoRural Pro Localmente

## ⚡ Início Rápido (3 comandos)

```bash
# 1. Configurar ambiente (só na primeira vez)
./dev-setup.sh

# 2. Iniciar o projeto (porta única)
./dev-start.sh

# 3. Acessar no navegador
# Aplicação completa: http://localhost:8000
```

## 📋 Pré-requisitos

- **Python 3.8+** 
- **Node.js 16+**
- **npm**

## 🔧 O que o setup faz automaticamente

✅ Cria ambiente virtual Python  
✅ Instala dependências do backend  
✅ Instala dependências do frontend  
✅ Configura arquivo `.env.local`  
✅ Pronto para rodar!  

## 🌐 Acesso Local (Porta Única)

- **🏠 Aplicação Completa**: http://localhost:8000
- **📚 Documentação da API**: http://localhost:8000/docs
- **🔧 Interface Admin**: http://localhost:8000/redoc

## 🧪 Funcionalidades Testáveis

### ✅ Funcionam sem configuração extra:
- 📊 **Simulador de Orçamento**
- 📡 **Upload e Análise GNSS** 
- 🏠 **Landing Page Completa**
- 📋 **Formulários de Captação**
- 📄 **Geração de PDF**

### ⚠️ Precisam do Supabase configurado:
- 🔐 **Login/Autenticação**
- 💾 **Salvamento no Banco**  
- ☁️ **Storage na Nuvem**

## 🚀 Scripts de Deploy Automático

### Deploy para GitHub
```bash
./deploy-github.sh
```

### Deploy para Vercel
```bash
./deploy-vercel.sh
```

### Deploy Completo (GitHub + Vercel)
```bash
./deploy-all.sh
```

## 📝 Opções de Desenvolvimento

### Desenvolvimento Simples (build único)
```bash
./dev-start.sh  # Build uma vez e roda
```

### Desenvolvimento Avançado (live reload)
```bash
./dev-local.sh  # Rebuild automático ao salvar
```

## 🛑 Como Parar

Pressione `Ctrl+C` no terminal onde executou o script

## 🔄 Comandos Úteis

```bash
# Se algo der errado, rode novamente
./dev-setup.sh

# Limpar cache Node.js  
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules && npm install

# Ver versões instaladas
python3 --version && node --version

# Rebuild manual do React
npm run build
```

## 🆘 Problemas Comuns

### ❌ "Permission denied" nos scripts
```bash
chmod +x dev-setup.sh dev-start.sh dev-local.sh deploy-*.sh
```

### ❌ Porta já em uso
```bash
# Matar processos na porta 8000
lsof -ti:8000 | xargs kill -9
```

### ❌ Backend não encontra React build
```bash
# Rebuild do React
npm run build
```

### ❌ "Frontend not built" na página
- Execute `npm run build`
- Reinicie `./dev-start.sh`

## 📞 Suporte

- 📖 **Guia Completo**: [DEV-LOCAL-GUIDE.md](./DEV-LOCAL-GUIDE.md)
- 📋 **README Geral**: [README.md](./README.md)
- 🐛 **Problemas**: Abra uma issue no GitHub

---

**🎯 Agora com porta única e deploy automático!** 