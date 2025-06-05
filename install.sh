#!/bin/bash
# Script de instalação para Vercel

echo "Instalando dependências na raiz..."
npm install

echo "Instalando dependências do frontend..."
cd frontend && npm install

echo "Instalação concluída!"