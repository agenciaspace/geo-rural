#!/bin/bash

# ========================================
# Deploy para Render.com - GeoRural Pro  
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Banner
echo -e "\n${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}    Deploy Render.com - GeoRural Pro    ${NC}"
echo -e "${MAGENTA}========================================${NC}\n"

# Build de produção
log_info "Realizando build de produção..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Erro no build de produção!"
    exit 1
fi

log_success "Build de produção concluído"

# Commit das mudanças
log_info "Preparando arquivos para deploy..."

# Adicionar arquivos ao git
git add .
git status

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}         Pronto para Deploy!            ${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Faça commit das mudanças:"
echo "   ${YELLOW}git commit -m \"Configure Render deployment\"${NC}"
echo ""
echo "2. Push para o GitHub:"
echo "   ${YELLOW}git push origin main${NC}"
echo ""
echo "3. Acesse: ${YELLOW}https://render.com${NC}"
echo "4. Conecte seu repositório GitHub"
echo "5. O Render detectará automaticamente o ${YELLOW}render.yaml${NC}"
echo ""
echo -e "${BLUE}✨ Configuração aplicada:${NC}"
echo "   - Limite de upload: ${GREEN}500MB${NC}"
echo "   - Plano: ${GREEN}Gratuito${NC}"
echo "   - Stack: ${GREEN}Python 3.12 + Node.js 18${NC}"
echo "   - Build automático do GitHub"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}    Configuração Render Concluída!     ${NC}"
echo -e "${GREEN}========================================${NC}\n"