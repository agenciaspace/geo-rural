#!/bin/bash

echo "🚀 Script de Deploy para Vercel - GeoRural Pro"
echo "================================================"

# Verificar se vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Fazer build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Abortando deploy."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Verificar se arquivo .env.local existe
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Arquivo .env.local não encontrado!"
    echo "Copie o arquivo .env.example e configure as variáveis do Supabase:"
    echo "cp frontend/.env.example frontend/.env.local"
    echo ""
    echo "Configure as seguintes variáveis:"
    echo "- REACT_APP_SUPABASE_URL"
    echo "- REACT_APP_SUPABASE_ANON_KEY"
    read -p "Pressione Enter quando terminar de configurar..."
fi

# Deploy para Vercel
echo "🚀 Iniciando deploy para Vercel..."
vercel --prod

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente na Vercel (se ainda não fez)"
echo "2. Configure a URL de produção no Supabase"
echo "3. Teste todas as funcionalidades"
echo ""
echo "🔗 Links úteis:"
echo "- Painel Vercel: https://vercel.com/dashboard"
echo "- Painel Supabase: https://supabase.com/dashboard"
echo ""
echo "📚 Consulte VERCEL-TROUBLESHOOTING.md para problemas comuns"