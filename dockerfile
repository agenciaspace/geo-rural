# ---------- Fase 1: build do React ----------
    FROM node:18 AS frontend
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    
    # ---------- Fase 2: backend ----------
    FROM python:3.12-slim
    ENV PYTHONUNBUFFERED=1
    WORKDIR /app
    
    # Instala dependências Python
    COPY backend/requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # Copia código backend + build estático
    COPY backend /app/backend
    COPY --from=frontend /app/build /app/build
    
    EXPOSE 8000
    CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]