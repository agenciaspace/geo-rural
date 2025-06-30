#!/bin/bash

# ========================================
# Script Principal de Deploy - GeoRural Pro
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
echo -e "${MAGENTA}     GeoRural Pro - Deploy Master      ${NC}"
echo -e "${MAGENTA}========================================${NC}\n"

# Verifica se está no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    log_error "Este script deve ser executado no diretório raiz do projeto!"
    exit 1
fi

# Menu de opções
echo -e "${YELLOW}Escolha o tipo de deploy:${NC}"
echo "1) Deploy completo (GitHub + Vercel)"
echo "2) Deploy apenas no GitHub"
echo "3) Deploy apenas na Vercel"
echo "4) Build de produção (sem deploy)"
echo "5) Cancelar"
echo

read -p "Opção: " choice

case $choice in
    1)
        log_info "Deploy completo selecionado"
        
        # Build de produção
        log_info "Realizando build de produção..."
        npm run build
        
        if [ $? -ne 0 ]; then
            log_error "Erro no build de produção!"
            exit 1
        fi
        
        log_success "Build concluído com sucesso"
        
        # Deploy no GitHub
        log_info "Iniciando deploy no GitHub..."
        ./deploy-github.sh
        
        # Deploy na Vercel
        log_info "Iniciando deploy na Vercel..."
        ./deploy-vercel.sh
        
        log_success "Deploy completo finalizado!"
        ;;
        
    2)
        log_info "Deploy GitHub selecionado"
        ./deploy-github.sh
        ;;
        
    3)
        log_info "Deploy Vercel selecionado"
        ./deploy-vercel.sh
        ;;
        
    4)
        log_info "Build de produção selecionado"
        
        # Limpa build anterior
        if [ -d "build" ]; then
            log_warning "Removendo build anterior..."
            rm -rf build
        fi
        
        # Build de produção
        log_info "Realizando build de produção..."
        echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"
        
        npm run build
        
        if [ $? -eq 0 ]; then
            log_success "Build de produção concluído!"
            echo -e "${GREEN}Arquivos prontos em: ./build/${NC}"
        else
            log_error "Erro no build de produção!"
            exit 1
        fi
        ;;
        
    5)
        log_warning "Deploy cancelado"
        exit 0
        ;;
        
    *)
        log_error "Opção inválida!"
        exit 1
        ;;
esac

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}         Deploy finalizado!            ${NC}"
echo -e "${GREEN}========================================${NC}\n"