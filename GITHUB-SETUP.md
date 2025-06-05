# 📚 Como Subir para o GitHub

## ✅ STATUS ATUAL
- ✅ Repositório Git inicializado
- ✅ Primeiro commit realizado (91 arquivos)
- ✅ .gitignore configurado
- ✅ Usuário Git configurado

## 🚀 PRÓXIMOS PASSOS

### 1. Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository" (botão verde)
3. Configure:
   - **Repository name**: `georural-pro`
   - **Description**: `🌱 Plataforma completa de georreferenciamento rural com IA`
   - **Visibility**: Public (ou Private se preferir)
   - **⚠️ NÃO marque** "Add a README file"
   - **⚠️ NÃO marque** "Add .gitignore"
   - **⚠️ NÃO marque** "Choose a license"
4. Clique em "Create repository"

### 2. Conectar ao Repositório Remoto

Após criar o repositório, execute:

```bash
# Adicionar remote (substitua SEU-USUARIO pelo seu username)
git remote add origin https://github.com/SEU-USUARIO/georural-pro.git

# Verificar se foi adicionado
git remote -v

# Fazer push do código
git push -u origin main
```

### 3. Verificar Upload

Após o push, acesse:
`https://github.com/SEU-USUARIO/georural-pro`

Você deve ver:
- ✅ 91 arquivos
- ✅ README.md com documentação
- ✅ Estrutura organizada
- ✅ Último commit: "feat: Initial commit - GeoRural Pro"

## 🔄 COMANDOS COMPLETOS

```bash
# 1. Verificar status atual
git status

# 2. Adicionar remote (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/georural-pro.git

# 3. Fazer push inicial
git push -u origin main

# 4. Verificar se deu certo
git remote show origin
```

## 🚀 DEPLOY NA VERCEL APÓS GITHUB

Depois que estiver no GitHub:

1. **Acesse**: https://vercel.com/new
2. **Import Git Repository**: Escolha seu repositório
3. **Configure**:
   - Framework: Other
   - Build Command: (vazio)
   - Output Directory: (vazio)
4. **Environment Variables**:
   ```
   REACT_APP_SUPABASE_URL = https://lywwxzfnhzbdkxnblvcf.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. **Deploy**

## 🎯 RESULTADO FINAL

- ✅ Código no GitHub
- ✅ Deploy automático na Vercel
- ✅ CI/CD configurado
- ✅ Domínio .vercel.app funcionando

---

**🎉 Pronto para ser compartilhado e usado!**