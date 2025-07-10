#!/bin/bash
# Script de inicialização para Railway

echo "🚀 Iniciando OnGeo..."
echo "PORT: ${PORT:-8000}"
echo "Python: $(python --version)"
echo "Node: $(node --version 2>/dev/null || echo 'N/A')"

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$SUPABASE_URL" ]; then
    echo "⚠️ AVISO: SUPABASE_URL não definida"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️ AVISO: SUPABASE_ANON_KEY não definida"
fi

# Criar diretórios necessários
mkdir -p /app/backend/data

# Testar importação do backend
echo "🧪 Testando importação do backend..."
python -c "import backend.main; print('✅ Backend importado com sucesso')" || {
    echo "❌ Erro ao importar backend"
    exit 1
}

# Iniciar servidor
echo "🌐 Iniciando servidor na porta ${PORT:-8000}..."
exec uvicorn backend.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --log-level info \
    --access-log