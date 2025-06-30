#!/bin/bash

# ========================================
# Script de Deploy para GitHub - GeoRural Pro
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
echo -e "\n${CYAN}========================================${NC}"
echo -e "${CYAN}    Deploy para GitHub - GeoRural Pro    ${NC}"
echo -e "${CYAN}========================================${NC}\n"

# Verificar se está no diretório git
if [ ! -d ".git" ]; then
    log_error "Não é um repositório Git!"
    echo -e "${YELLOW}Execute primeiro:${NC}"
    echo "   git init"
    echo "   git remote add origin https://github.com/seu-usuario/geo-rural.git"
    exit 1
fi

# Verificar se git está configurado
if ! git config user.name > /dev/null 2>&1; then
    log_error "Git não está configurado!"
    echo -e "${YELLOW}Configure com:${NC}"
    echo "   git config --global user.name \"Seu Nome\""
    echo "   git config --global user.email \"seu@email.com\""
    exit 1
fi

# Mostrar informações do repositório
REPO_URL=$(git config --get remote.origin.url 2>/dev/null)
CURRENT_BRANCH=$(git branch --show-current)

if [ ! -z "$REPO_URL" ]; then
    log_info "Repositório: $REPO_URL"
fi
log_info "Branch atual: $CURRENT_BRANCH"

# Verificar se tem mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Detectadas mudanças não commitadas"
    
    # Mostrar status
    echo -e "\n${YELLOW}Arquivos alterados:${NC}"
    git status --short
    
    # Contar mudanças
    CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
    echo -e "\n${CYAN}Total: $CHANGES arquivo(s)${NC}"
    
    # Pedir confirmação
    echo ""
    read -p "$(echo -e ${YELLOW}Continuar com o commit automático? [s/N]:${NC} )" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        log_warning "Deploy cancelado. Faça commit manual primeiro."
        exit 0
    fi
    
    # Pedir mensagem de commit
    echo ""
    echo -e "${YELLOW}Digite a mensagem do commit:${NC}"
    echo -e "${CYAN}(Enter para usar mensagem automática)${NC}"
    read -p "> " commit_msg
    
    if [ -z "$commit_msg" ]; then
        DATE=$(date '+%d/%m/%Y %H:%M')
        commit_msg="🚀 Deploy automático - $DATE"
        
        # Adiciona detalhes das mudanças
        if git status --porcelain | grep -q "^M"; then
            commit_msg="$commit_msg | Arquivos modificados"
        fi
        if git status --porcelain | grep -q "^A"; then
            commit_msg="$commit_msg | Novos arquivos"
        fi
        if git status --porcelain | grep -q "^D"; then
            commit_msg="$commit_msg | Arquivos removidos"
        fi
    fi
    
    # Adicionar todos os arquivos
    log_info "Adicionando arquivos ao stage..."
    git add -A
    
    # Fazer commit
    log_info "Fazendo commit..."
    git commit -m "$commit_msg"
    
    if [ $? -ne 0 ]; then
        log_error "Erro ao fazer commit"
        exit 1
    fi
    
    log_success "Commit realizado com sucesso"
else
    log_success "Nenhuma mudança para commit"
fi

# Verificar se remote existe
if ! git remote get-url origin >/dev/null 2>&1; then
    log_error "Remote 'origin' não configurado!"
    echo -e "${YELLOW}Configure com:${NC}"
    echo "   git remote add origin https://github.com/seu-usuario/geo-rural.git"
    exit 1
fi

# Fazer push
log_info "Enviando para GitHub (branch: $CURRENT_BRANCH)..."
echo -e "${YELLOW}Isso pode levar alguns segundos...${NC}"

if git push origin "$CURRENT_BRANCH"; then
    echo ""
    log_success "Deploy para GitHub concluído com sucesso!"
    
    # Extrair informações do repositório
    if [[ "$REPO_URL" =~ github\.com[:/]([^/]+/[^/]+)(\.git)?$ ]]; then
        REPO_PATH="${BASH_REMATCH[1]}"
        
        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}         Deploy Concluído!              ${NC}"
        echo -e "${GREEN}========================================${NC}"
        
        echo -e "\n${CYAN}📊 Resumo:${NC}"
        echo -e "  Branch: ${YELLOW}$CURRENT_BRANCH${NC}"
        echo -e "  Horário: ${YELLOW}$(date '+%d/%m/%Y %H:%M:%S')${NC}"
        
        # Mostrar último commit
        echo -e "\n${CYAN}📝 Último commit:${NC}"
        git log -1 --pretty=format:"  %h - %s (%cr) <%an>" --abbrev-commit
        
        echo -e "\n\n${CYAN}🔗 Links úteis:${NC}"
        echo -e "  Repositório: ${BLUE}https://github.com/$REPO_PATH${NC}"
        echo -e "  Commits: ${BLUE}https://github.com/$REPO_PATH/commits/$CURRENT_BRANCH${NC}"
        echo -e "  Actions: ${BLUE}https://github.com/$REPO_PATH/actions${NC}"
    fi
    
    # Sugestão para próximo passo
    echo -e "\n${YELLOW}💡 Próximo passo:${NC}"
    echo "   ./deploy-vercel.sh   # Deploy na Vercel"
    echo ""
    
else
    log_error "Erro no push para GitHub!"
    echo -e "\n${YELLOW}Possíveis soluções:${NC}"
    echo "  1. Verificar conexão com internet"
    echo "  2. Verificar credenciais GitHub"
    echo "  3. Sincronizar com remote:"
    echo "     git pull origin $CURRENT_BRANCH"
    echo "     git push origin $CURRENT_BRANCH"
    exit 1
fi 