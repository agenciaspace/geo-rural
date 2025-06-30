#!/bin/bash

# GeoRural Pro - Desenvolvimento Local com Live Reload
echo "🌱 GeoRural Pro - Modo desenvolvimento com live reload..."
echo "======================================================="

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

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️ Arquivo .env.local não encontrado. Execute ./dev-setup.sh primeiro!"
    echo "Criando configuração básica temporária..."
    echo "REACT_APP_API_URL=" > .env.local
    echo "⚡ Configuração temporária criada."
fi

# Função para rebuild contínuo
start_watch_build() {
    echo "👀 Iniciando watch para rebuild automático..."
    cd "$PROJECT_DIR"
    
    # Usar chokidar para watch (mais confiável que npm start)
    npx chokidar "src/**/*" -c "npm run build" --initial &
    WATCH_PID=$!
}

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
    
    echo "🚀 Servidor backend com frontend integrado iniciando..."
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
}

# Build inicial
echo "⚛️ Build inicial do React..."

# Verificar se homepage está correto
if grep -q '"homepage": "./"' package.json; then
    echo "🔧 Corrigindo homepage para caminhos absolutos..."
    sed -i.bak 's/"homepage": ".\/",/"homepage": "\/",/' package.json
fi

npm run build

# Iniciar serviços
start_backend
sleep 2
start_watch_build

echo ""
echo "🎉 GeoRural Pro iniciado em modo desenvolvimento!"
echo "=================================================="
echo "🌐 Aplicação:  http://localhost:8000"
echo "📚 API Docs:   http://localhost:8000/docs"
echo "🔧 API Admin:  http://localhost:8000/redoc"
echo "👀 Watch ativo: alterações em src/ → rebuild automático"
echo "=================================================="
echo "🛑 Pressione Ctrl+C para parar a aplicação"
echo ""

# Aguardar sinal de parada
wait 