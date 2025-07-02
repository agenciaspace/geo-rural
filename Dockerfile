# ---------- Stage 1: Build React frontend ----------
FROM node:18 AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# ---------- Stage 2: Build Python backend ----------
FROM python:3.12-slim AS backend
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# System build deps for numpy/scipy/georinex
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc gfortran && \
    rm -rf /var/lib/apt/lists/*

# Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend /app/backend

# Copy built frontend static files
COPY --from=frontend /app/build /app/build

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
