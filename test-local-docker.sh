#!/bin/bash
# Teste local do Docker antes do deploy

echo "🐳 Testando Docker localmente..."

# Build
echo "📦 Building Docker image..."
docker build -t ongeo-test . || exit 1

# Run com variáveis de ambiente
echo "🚀 Starting container..."
docker run --rm -d \
  --name ongeo-test \
  -p 8080:8080 \
  -e PORT=8080 \
  -e SUPABASE_URL=https://lywwxzfnhzbdkxnblvcf.supabase.co \
  -e SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ \
  -e PYTHONUNBUFFERED=1 \
  ongeo-test

# Aguardar início
echo "⏳ Waiting for startup..."
sleep 10

# Testar health check
echo "🧪 Testing health check..."
curl -f http://localhost:8080/api/info | jq .

# Ver logs
echo "📋 Container logs:"
docker logs ongeo-test

# Cleanup
echo "🧹 Cleaning up..."
docker stop ongeo-test

echo "✅ Test complete!"