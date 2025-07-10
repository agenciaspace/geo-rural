# 🚀 Variáveis de Ambiente para Railway

## Adicione estas variáveis no painel do Railway:

### Backend (Python)
```
SUPABASE_URL=https://lywwxzfnhzbdkxnblvcf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

### Frontend (React)
```
REACT_APP_SUPABASE_URL=https://lywwxzfnhzbdkxnblvcf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d3d4emZuaHpiZGt4bmJsdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYxNTcsImV4cCI6MjA2NDcwMjE1N30.c91JJQ9yFPdjvMcH3VqrJWKu6dUSocrx0Ri9E1V8eDQ
NODE_ENV=production
```

### Sistema
```
PORT=${{PORT}}
```

⚠️ **IMPORTANTE**: O Railway define automaticamente a variável `PORT`. Não defina manualmente!