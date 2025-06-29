#!/bin/bash

# 🎯 Precizu - Deploy Completo
echo "🎯 Precizu - Deploy para Produção"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    🎯 Precizu - Deploy Master    ${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Build do React
echo -e "${YELLOW}📦 Build do frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi

# 2. Deploy na Vercel
echo -e "${YELLOW}🚀 Deploy na Vercel...${NC}"
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deploy do Precizu concluído!${NC}"
    echo -e "${BLUE}📍 Acesse sua aplicação na URL mostrada acima${NC}"
else
    echo "❌ Erro no deploy"
    exit 1
fi 