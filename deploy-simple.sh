#!/bin/bash

# OnGeo - Deploy Simples para Vercel
echo "🚀 OnGeo - Deploy para Vercel..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Build do projeto
echo -e "${BLUE}📦 Fazendo build do projeto...${NC}"
npm run build

# Verificar se build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no build. Verifique os erros acima.${NC}"
    exit 1
fi

# Deploy para produção
echo -e "${YELLOW}🚀 Fazendo deploy para produção...${NC}"
vercel --prod --yes

# Verificar se deploy foi bem-sucedido
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
    echo -e "${BLUE}📍 Acesse: https://precizu.vercel.app${NC}"
else
    echo -e "${RED}❌ Erro no deploy. Verifique sua configuração.${NC}"
    exit 1
fi 