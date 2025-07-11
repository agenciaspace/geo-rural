# ---------- Stage 1: Build React frontend ----------
FROM node:18-alpine AS frontend

# Adicionar variáveis de ambiente do React para o build
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# ---------- Stage 2: Build Python backend ----------
FROM python:3.12-slim

# Configurações de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential gcc gfortran curl && \
    rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código do backend
COPY backend ./backend

# Copiar frontend buildado
COPY --from=frontend /app/build ./build

# Criar diretórios necessários
RUN mkdir -p ./backend/data

# Verificar instalação
RUN python -c "import fastapi; print('✅ FastAPI instalado')" && \
    python -c "import uvicorn; print('✅ Uvicorn instalado')" && \
    python -c "import backend.main; print('✅ Backend importado')"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/info || exit 1

# Expor porta
EXPOSE ${PORT}

# Copiar script de inicialização
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Comando de inicialização
CMD ["./start.sh"]