#!/bin/bash

# ========================================
# Deploy para Railway - GeoRural Pro
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
echo -e "${MAGENTA}    Deploy Railway - GeoRural Pro      ${NC}"
echo -e "${MAGENTA}========================================${NC}\n"

# Verifica se está no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    log_error "Este script deve ser executado no diretório raiz do projeto!"
    exit 1
fi

# Verifica se o Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    log_warning "Railway CLI não encontrado. Instalando..."
    
    if command -v npm &> /dev/null; then
        npm install -g @railway/cli
    elif command -v curl &> /dev/null; then
        bash <(curl -fsSL https://railway.app/install.sh)
    else
        log_error "Não foi possível instalar o Railway CLI. Instale manualmente:"
        echo "https://docs.railway.app/develop/cli#install"
        exit 1
    fi
    
    if command -v railway &> /dev/null; then
        log_success "Railway CLI instalado com sucesso!"
    else
        log_error "Falha na instalação do Railway CLI"
        exit 1
    fi
fi

# Verifica autenticação
log_info "Verificando autenticação Railway..."
if ! railway whoami &> /dev/null; then
    log_warning "Não autenticado no Railway."
    echo -e "${YELLOW}Por favor, execute os seguintes comandos:${NC}"
    echo "1. railway login"
    echo "2. ./deploy-railway.sh"
    echo ""
    echo -e "${BLUE}Ou visite: https://railway.app para criar uma conta${NC}"
    exit 1
fi

RAILWAY_USER=$(railway whoami)
log_success "Autenticado como: $RAILWAY_USER"

# Build de produção
log_info "Realizando build de produção..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Erro no build de produção!"
    exit 1
fi

log_success "Build de produção concluído"

# Configuração do projeto
log_info "Configurando projeto Railway..."

# Verifica se já existe um projeto linkado
if [ ! -f ".railway" ]; then
    log_warning "Projeto não encontrado. Criando novo projeto..."
    railway init
fi

# Deploy
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}         Iniciando Deploy               ${NC}"
echo -e "${GREEN}========================================${NC}\n"

log_info "Enviando para Railway..."
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

railway up

if [ $? -eq 0 ]; then
    log_success "Deploy no Railway concluído com sucesso!"
    
    # Obter URL do projeto
    RAILWAY_URL=$(railway domain)
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}         Deploy Concluído!              ${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo -e "${BLUE}📊 Resumo:${NC}"
    echo -e "  Status: ${GREEN}Online${NC}"
    echo -e "  Horário: ${YELLOW}$(date '+%d/%m/%Y %H:%M:%S')${NC}"
    
    echo -e "\n${BLUE}🔗 URLs do Projeto:${NC}"
    if [ ! -z "$RAILWAY_URL" ]; then
        echo -e "  ${YELLOW}$RAILWAY_URL${NC}"
    else
        echo -e "  ${YELLOW}Execute 'railway domain' para ver a URL${NC}"
    fi
    
    echo -e "\n${BLUE}📚 Próximos passos:${NC}"
    echo "  1. Teste o upload de arquivos grandes (até 500MB)"
    echo "  2. Configure domínio customizado (opcional)"
    echo "  3. Monitore logs: railway logs"
    
else
    log_error "Erro no deploy para Railway!"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}         Deploy finalizado!            ${NC}"
echo -e "${GREEN}========================================${NC}\n"