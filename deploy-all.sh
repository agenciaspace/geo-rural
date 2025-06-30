#!/bin/bash

# GeoRural Pro - Deploy Completo (GitHub + Vercel)
echo "🚀 GeoRural Pro - Deploy Completo..."
echo "===================================="
echo ""
echo "Este script irá:"
echo "1. 📝 Fazer commit e push para GitHub"
echo "2. 🏗️ Fazer build do React"
echo "3. ☁️ Deploy na Vercel"
echo ""

# Pedir confirmação
read -p "🤔 Continuar com o deploy completo? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado."
    exit 0
fi

# Verificar pré-requisitos
echo "🔍 Verificando pré-requisitos..."

if [ ! -d ".git" ]; then
    echo "❌ Não é um repositório Git. Execute primeiro:"
    echo "   git init"
    echo "   git remote add origin https://github.com/seu-usuario/georural-pro.git"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "✅ Pré-requisitos verificados!"
echo ""

# Passo 1: GitHub
echo "📍 PASSO 1/3: Deploy para GitHub"
echo "================================="

if ./deploy-github.sh; then
    echo "✅ GitHub deploy concluído!"
else
    echo "❌ Erro no GitHub deploy. Parando..."
    exit 1
fi

echo ""

# Passo 2: Build
echo "📍 PASSO 2/3: Build do React"
echo "============================"

echo "⚛️ Executando npm run build..."
if npm run build; then
    echo "✅ Build concluído!"
else
    echo "❌ Erro no build. Parando..."
    exit 1
fi

echo ""

# Passo 3: Vercel
echo "📍 PASSO 3/3: Deploy na Vercel"
echo "==============================="

if ./deploy-vercel.sh; then
    echo "✅ Vercel deploy concluído!"
else
    echo "❌ Erro no Vercel deploy. Parando..."
    exit 1
fi

echo ""
echo "🎉 DEPLOY COMPLETO CONCLUÍDO!"
echo "==============================="
echo "📅 Horário: $(date '+%d/%m/%Y %H:%M:%S')"
echo ""
echo "✅ GitHub: Código atualizado"
echo "✅ Vercel: Aplicação no ar"
echo ""

# Obter informações do deploy
GITHUB_URL=$(git remote get-url origin 2>/dev/null)
if [ ! -z "$GITHUB_URL" ]; then
    echo "🔗 GitHub: $GITHUB_URL"
fi

# Tentar obter URL da Vercel
if command -v vercel &> /dev/null; then
    PROJECT_URL=$(vercel ls 2>/dev/null | head -1 | awk '{print $2}' | sed 's/.*\(https:\/\/[^[:space:]]*\).*/\1/')
    if [ ! -z "$PROJECT_URL" ]; then
        echo "🌐 Vercel: $PROJECT_URL"
    fi
fi

echo ""
echo "🚀 Aplicação está online e funcionando!"
echo "🎯 Próximos passos:"
echo "   1. Testar a aplicação na URL da Vercel"
echo "   2. Configurar domínio customizado (opcional)"
echo "   3. Monitorar logs e performance"
echo ""
echo "📖 Para futuras atualizações, use:"
echo "   ./deploy-all.sh (deploy completo)"
echo "   ./deploy-github.sh (só GitHub)"
echo "   ./deploy-vercel.sh (só Vercel)" 