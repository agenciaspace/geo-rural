#!/bin/bash

# GeoRural Pro - Build e Deploy em Porta Única
echo "🌱 GeoRural Pro - Build e Deploy"
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
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf "$FRONTEND_DIR/build"

# Build do Frontend React
echo "⚛️ Fazendo build do frontend React..."
cd "$FRONTEND_DIR"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências Node.js..."
    npm install
fi

# Build da aplicação React
echo "🔨 Gerando build de produção..."
npm run build

if [ ! -d "build" ]; then
    echo "❌ Erro: Build do React falhou"
    exit 1
fi

echo "✅ Build do React concluído"

# Configurar Backend Python
echo "🐍 Configurando backend Python..."
cd "$BACKEND_DIR"

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Instalar dependências Python
echo "📦 Instalando dependências Python..."
pip install -r requirements.txt > /dev/null 2>&1

# Função para parar processos
cleanup() {
    echo ""
    echo "🛑 Parando aplicação..."
    
    if [ -f "server.pid" ]; then
        kill $(cat server.pid) 2>/dev/null
        rm server.pid
    fi
    
    echo "✅ Aplicação parada"
    exit 0
}

# Capturar Ctrl+C
trap cleanup INT TERM

# Iniciar servidor integrado
echo "🚀 Iniciando GeoRural Pro..."
echo ""
echo "🎉 Aplicação disponível em:"
echo "   🌐 http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 Pressione Ctrl+C para parar"
echo ""

# Executar servidor e salvar PID
python main.py &
SERVER_PID=$!
echo $SERVER_PID > server.pid

# Aguardar sinal de parada
wait