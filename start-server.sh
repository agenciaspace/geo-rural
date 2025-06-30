#!/bin/bash

# ========================================
# Script para Iniciar o Servidor GeoRural Pro
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}    GeoRural Pro - Iniciando Servidor    ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Verifica se está no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    log_error "Este script deve ser executado no diretório raiz do projeto!"
    exit 1
fi

# Mata processos existentes na porta 8000
log_info "Verificando processos na porta 8000..."
if lsof -ti:8000 > /dev/null 2>&1; then
    log_warning "Encontrado processo na porta 8000, encerrando..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
    log_success "Porta 8000 liberada"
fi

# Verifica Node.js
log_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado!"
    echo "Por favor, instale Node.js: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
log_success "Node.js encontrado: $NODE_VERSION"

# Verifica Python3
log_info "Verificando Python3..."
if ! command -v python3 &> /dev/null; then
    log_error "Python3 não está instalado!"
    echo "Por favor, instale Python3: https://www.python.org/"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
log_success "Python3 encontrado: $PYTHON_VERSION"

# Instala dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    log_warning "node_modules não encontrado. Instalando dependências do frontend..."
    npm install
    if [ $? -eq 0 ]; then
        log_success "Dependências do frontend instaladas"
    else
        log_error "Erro ao instalar dependências do frontend"
        exit 1
    fi
else
    log_info "Verificando atualizações de dependências do frontend..."
    npm install
fi

# Verifica e instala dependências do backend
log_info "Verificando dependências do backend..."
cd backend

# Cria ambiente virtual se não existir
if [ ! -d "venv" ]; then
    log_warning "Ambiente virtual não encontrado. Criando..."
    python3 -m venv venv
    log_success "Ambiente virtual criado"
fi

# Ativa ambiente virtual
log_info "Ativando ambiente virtual..."
source venv/bin/activate

# Instala/atualiza dependências Python
log_info "Instalando/atualizando dependências Python..."
pip install -r requirements.txt --quiet
log_success "Dependências Python atualizadas"

# Volta para o diretório raiz
cd ..

# Build do React
log_info "Realizando build do React..."
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log_success "Build do React concluído"
else
    log_error "Erro no build do React"
    exit 1
fi

# Verifica se o build foi criado
if [ ! -d "build" ]; then
    log_error "Diretório build não foi criado!"
    exit 1
fi

# Inicia o servidor
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}    Servidor iniciando na porta 8000    ${NC}"
echo -e "${GREEN}========================================${NC}\n"

log_info "Acessar em: ${BLUE}http://localhost:8000${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor${NC}\n"

# Inicia o servidor Python
cd backend
python3 main.py 