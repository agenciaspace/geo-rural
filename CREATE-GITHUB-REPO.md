# 🚀 Como criar o repositório GitHub e fazer deploy no Render

## 1️⃣ Criar repositório no GitHub

### Opção A: Pela interface web
1. Acesse: https://github.com/new
2. Nome do repositório: `geo-rural`
3. Descrição: "Sistema de georreferenciamento rural com análise GNSS"
4. Deixe como **Public**
5. **NÃO** inicialize com README (já temos um)
6. Clique em **Create repository**

### Opção B: Usando GitHub CLI
```bash
# Se tiver o GitHub CLI instalado:
gh repo create geo-rural --public --source=. --push
```

## 2️⃣ Conectar repositório local ao GitHub

Após criar o repositório vazio no GitHub, execute:

```bash
# Se criou com nome geo-rural:
git remote set-url origin https://github.com/SEU_USUARIO/geo-rural.git

# Fazer push inicial:
git push -u origin main
```

## 3️⃣ Deploy no Render

1. Acesse: https://render.com
2. Clique em **New +** → **Web Service**
3. Conecte sua conta GitHub (se ainda não conectou)
4. Selecione o repositório `geo-rural`
5. O Render detectará automaticamente o `render.yaml`
6. Clique em **Create Web Service**

## ✅ Status atual do projeto

- **Commits prontos**: 6 commits com todas as configurações
- **Configuração Render**: ✅ Pronta no `render.yaml`
- **Limites de upload**: 500MB configurado
- **Build otimizado**: React + FastAPI

## 🔧 Caso prefira outro nome de repositório:

```bash
# Exemplo com nome "precizu":
git remote set-url origin https://github.com/SEU_USUARIO/precizu.git
git push -u origin main
```

## 📝 Resumo dos arquivos importantes:

- `render.yaml` - Configuração do Render
- `backend/main.py` - API com limite de 500MB
- `src/components/GnssUploader.js` - Frontend com limite de 500MB
- `Procfile` - Comando de inicialização

Tudo está pronto, só falta criar o repositório no GitHub!