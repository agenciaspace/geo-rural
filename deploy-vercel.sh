#!/bin/bash

# ========================================
# Script de Deploy para Vercel - GeoRural Pro
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Banner
echo -e "\n${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}    Deploy para Vercel - GeoRural Pro    ${NC}"
echo -e "${MAGENTA}========================================${NC}\n"

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI não encontrado"
    echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        log_error "Erro ao instalar Vercel CLI"
        echo -e "${YELLOW}Instale manualmente:${NC}"
        echo "   npm install -g vercel"
        exit 1
    fi
    log_success "Vercel CLI instalado com sucesso!"
fi

# Verificar versão do Vercel CLI
VERCEL_VERSION=$(vercel --version 2>/dev/null)
log_info "Vercel CLI: $VERCEL_VERSION"

# Verificar se existe build do React
if [ ! -d "build" ]; then
    log_warning "Build do React não encontrado"
    echo -e "${YELLOW}Executando build de produção...${NC}"
    echo -e "${CYAN}Isso pode levar alguns minutos...${NC}"
    
    npm run build
    
    if [ $? -ne 0 ]; then
        log_error "Erro no build do React"
        echo "Verifique os erros acima e tente novamente"
        exit 1
    fi
    log_success "Build do React concluído!"
else
    log_info "Build existente encontrado"
    
    # Perguntar se quer refazer o build
    read -p "$(echo -e ${YELLOW}Deseja refazer o build? [s/N]:${NC} )" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        log_info "Removendo build anterior..."
        rm -rf build
        
        log_info "Executando novo build..."
        npm run build
        
        if [ $? -ne 0 ]; then
            log_error "Erro no build do React"
            exit 1
        fi
        log_success "Novo build concluído!"
    fi
fi

# Verificar se vercel.json existe
if [ ! -f "vercel.json" ]; then
    log_info "Criando vercel.json..."
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF
    log_success "vercel.json criado!"
else
    log_success "vercel.json já existe"
fi

# Mostrar informações do projeto
echo -e "\n${CYAN}📋 Configuração do Deploy:${NC}"
echo -e "  Framework: ${YELLOW}React (Create React App)${NC}"
echo -e "  Build Command: ${YELLOW}npm run build${NC}"
echo -e "  Output Directory: ${YELLOW}build/${NC}"
echo -e "  Node Version: ${YELLOW}18.x${NC}"

# Verificar se está logado na Vercel
log_info "Verificando autenticação na Vercel..."
if ! vercel whoami &>/dev/null; then
    log_warning "Você não está logado na Vercel"
    echo -e "${YELLOW}Fazendo login...${NC}"
    vercel login
    
    if [ $? -ne 0 ]; then
        log_error "Erro ao fazer login na Vercel"
        exit 1
    fi
fi

# Perguntar sobre variáveis de ambiente
echo -e "\n${CYAN}🔧 Configuração de Variáveis de Ambiente:${NC}"
read -p "$(echo -e ${YELLOW}Configurar variáveis do Supabase agora? [s/N]:${NC} )" -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}Digite as credenciais do Supabase:${NC}"
    echo -e "${CYAN}(Encontre em: https://supabase.com/dashboard)${NC}"
    
    read -p "$(echo -e ${BLUE}REACT_APP_SUPABASE_URL:${NC} )" supabase_url
    read -p "$(echo -e ${BLUE}REACT_APP_SUPABASE_ANON_KEY:${NC} )" supabase_key
    
    if [ ! -z "$supabase_url" ] && [ ! -z "$supabase_key" ]; then
        log_info "Configurando variáveis de ambiente na Vercel..."
        
        # Adicionar variáveis para produção
        vercel env add REACT_APP_SUPABASE_URL production < <(echo "$supabase_url")
        vercel env add REACT_APP_SUPABASE_ANON_KEY production < <(echo "$supabase_key")
        
        log_success "Variáveis de ambiente configuradas!"
    else
        log_warning "Variáveis não configuradas - configure manualmente no painel da Vercel"
    fi
fi

# Deploy
echo -e "\n${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}         Iniciando Deploy               ${NC}"
echo -e "${MAGENTA}========================================${NC}\n"

log_info "Enviando para Vercel..."
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}\n"

# Deploy de produção com output detalhado
if vercel --prod --yes; then
    echo ""
    log_success "Deploy na Vercel concluído com sucesso!"
    
    # Obter informações do deploy
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}         Deploy Concluído!              ${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    echo -e "\n${CYAN}📊 Resumo:${NC}"
    echo -e "  Status: ${GREEN}Online${NC}"
    echo -e "  Horário: ${YELLOW}$(date '+%d/%m/%Y %H:%M:%S')${NC}"
    
    # Tentar obter URL do projeto
    echo -e "\n${CYAN}🔗 URLs do Projeto:${NC}"
    
    # Obter última URL de deploy
    DEPLOY_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null)
    
    if [ ! -z "$DEPLOY_URL" ] && [ "$DEPLOY_URL" != "null" ]; then
        echo -e "  Produção: ${BLUE}https://$DEPLOY_URL${NC}"
        echo -e "  Preview: ${BLUE}https://$DEPLOY_URL${NC}"
        
        # Opção para abrir no navegador
        echo ""
        read -p "$(echo -e ${YELLOW}Abrir no navegador? [s/N]:${NC} )" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            if command -v open &> /dev/null; then
                open "https://$DEPLOY_URL"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "https://$DEPLOY_URL"
            else
                echo -e "${YELLOW}Abra manualmente: https://$DEPLOY_URL${NC}"
            fi
        fi
    else
        echo -e "  ${YELLOW}Execute 'vercel' para ver as URLs${NC}"
    fi
    
    echo -e "\n${CYAN}📚 Próximos passos:${NC}"
    echo "  1. Teste todas as funcionalidades"
    echo "  2. Configure domínio customizado (opcional)"
    echo "  3. Monitore logs: vercel logs"
    echo ""
    
else
    log_error "Erro no deploy da Vercel!"
    echo -e "\n${YELLOW}Possíveis soluções:${NC}"
    echo "  1. Verificar conexão com internet"
    echo "  2. Fazer login novamente: vercel login"
    echo "  3. Verificar projeto: vercel inspect"
    echo "  4. Ver logs: vercel logs"
    echo "  5. Tentar novamente: vercel --prod"
    exit 1
fi 