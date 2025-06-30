#!/bin/bash

# GeoRural Pro - Iniciar Desenvolvimento Local
echo "🌱 GeoRural Pro - Iniciando desenvolvimento local..."
echo "================================================="

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

# Função para parar processos
cleanup() {
    echo ""
    echo "🛑 Parando aplicação..."
    
    # Matar processos filhos
    jobs -p | xargs -r kill
    
    echo "✅ Aplicação parada"
    exit 0
}

# Capturar Ctrl+C
trap cleanup INT TERM

# Verificar se o setup foi executado
if [ ! -f "$BACKEND_DIR/venv/bin/activate" ] && [ ! -f "$BACKEND_DIR/venv/Scripts/activate" ]; then
    echo "❌ Ambiente virtual não encontrado. Execute primeiro: ./dev-setup.sh"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "❌ Dependências Node.js não encontradas. Execute primeiro: ./dev-setup.sh"
    exit 1
fi

# Função para iniciar backend
start_backend() {
    echo "🐍 Iniciando backend Python..."
    cd "$BACKEND_DIR"
    
    # Ativar ambiente virtual
    if [[ "$OSTYPE" == "msys" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    echo "🚀 Servidor backend iniciando em http://localhost:8000"
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
}

# Função para buildar React
build_react() {
    echo "⚛️ Buildando React para produção..."
    cd "$PROJECT_DIR"
    
    # Verificar se homepage está correto
    if grep -q '"homepage": "./"' package.json; then
        echo "🔧 Corrigindo homepage para caminhos absolutos..."
        sed -i.bak 's/"homepage": ".\/",/"homepage": "\/",/' package.json
    fi
    
    echo "📦 Executando npm run build..."
    npm run build
    
    echo "✅ Build do React concluído!"
}

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️ Arquivo .env.local não encontrado. Execute ./dev-setup.sh primeiro!"
    echo "Criando configuração básica temporária..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
    else
        echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
    fi
    echo "⚡ Configuração temporária criada. Recomendamos executar ./dev-setup.sh"
fi

# Buildar React primeiro
build_react

# Iniciar apenas o backend (que serve tudo)
start_backend

echo ""
echo "🎉 GeoRural Pro iniciado com sucesso!"
echo "======================================"
echo "🌐 Aplicação:  http://localhost:8000"
echo "📚 API Docs:   http://localhost:8000/docs"
echo "🔧 API Admin:  http://localhost:8000/redoc"
echo "======================================"
echo "🛑 Pressione Ctrl+C para parar a aplicação"
echo ""

# Aguardar sinal de parada
wait 