#!/bin/bash

# GeoRural Pro - Script de Inicialização
echo "🌱 GeoRural Pro - Inicializando projeto..."
echo "================================================"

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
echo "🔍 Verificando dependências..."

if ! command_exists python3; then
    echo "❌ Python 3 não encontrado. Instale Python 3.8 ou superior."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js não encontrado. Instale Node.js 16 ou superior."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm não encontrado. Instale npm."
    exit 1
fi

echo "✅ Dependências básicas encontradas"

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
# React app está na raiz do projeto
FRONTEND_DIR="$PROJECT_DIR"

# Função para iniciar backend
start_backend() {
    echo "🐍 Iniciando backend..."
    cd "$BACKEND_DIR"
    
    # Instalar dependências Python se necessário
    if [ ! -d "venv" ]; then
        echo "📦 Criando ambiente virtual Python..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
    
    echo "📦 Instalando dependências Python..."
    pip install -r requirements.txt > /dev/null 2>&1
    
    echo "🚀 Servidor backend iniciando na porta 8000..."
    python main.py &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
}

# Função para iniciar frontend
start_frontend() {
    echo "⚛️ Iniciando frontend..."
    cd "$FRONTEND_DIR"
    
    # Instalar dependências Node se necessário
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências Node.js..."
        npm install > /dev/null 2>&1
    fi
    
    echo "🚀 Aplicação frontend iniciando na porta 3000..."
    npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
}

# Função para parar processos
cleanup() {
    echo ""
    echo "🛑 Parando aplicação..."
    
    if [ -f "$BACKEND_DIR/backend.pid" ]; then
        kill $(cat "$BACKEND_DIR/backend.pid") 2>/dev/null
        rm "$BACKEND_DIR/backend.pid"
    fi
    
    if [ -f "$FRONTEND_DIR/frontend.pid" ]; then
        kill $(cat "$FRONTEND_DIR/frontend.pid") 2>/dev/null
        rm "$FRONTEND_DIR/frontend.pid"
    fi
    
    echo "✅ Aplicação parada"
    exit 0
}

# Capturar Ctrl+C
trap cleanup INT TERM

# Iniciar serviços
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 GeoRural Pro iniciado com sucesso!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 Pressione Ctrl+C para parar a aplicação"

# Aguardar sinal de parada
wait