#!/bin/bash

# 🚀 Precizu - Deploy Master Script
# Automatiza todo o processo de deploy (GitHub + Vercel)

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}========================================${NC}"
echo -e "${PURPLE}  🚀 PRECIZU - DEPLOY MASTER v2.0  ${NC}"
echo -e "${PURPLE}========================================${NC}"
echo ""

# Função para mostrar status
show_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

show_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    show_error "Este script deve ser executado na raiz do projeto!"
    exit 1
fi

show_status "Iniciando deploy master do Precizu..."

# 2. Verificar status Git
echo ""
show_status "📋 Verificando status do Git..."
git status --porcelain > /tmp/git_status.txt

if [[ -s /tmp/git_status.txt ]]; then
    show_warning "Há mudanças não commitadas:"
    cat /tmp/git_status.txt
    
    read -p "Deseja commitá-las automaticamente? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_status "Adicionando mudanças ao Git..."
        git add .
        
        read -p "Digite a mensagem do commit: " commit_msg
        if [[ -z "$commit_msg" ]]; then
            commit_msg="🚀 Deploy automático - $(date '+%Y-%m-%d %H:%M')"
        fi
        
        git commit -m "$commit_msg"
        show_success "Commit realizado: $commit_msg"
    fi
fi

# 3. Build do projeto
echo ""
show_status "📦 Fazendo build do React..."
if npm run build; then
    show_success "Build concluído com sucesso!"
else
    show_error "Falha no build! Verifique os erros acima."
    exit 1
fi

# 4. Deploy na Vercel
echo ""
show_status "🌐 Fazendo deploy na Vercel..."

if command -v vercel &> /dev/null; then
    if vercel --prod --yes; then
        show_success "Deploy na Vercel concluído!"
        echo ""
        echo -e "${GREEN}🌐 Seu site está online!${NC}"
        
        # Extrair URL do último deploy
        vercel ls | head -2 | tail -1 | awk '{print "🔗 URL: https://" $1}'
    else
        show_error "Falha no deploy da Vercel!"
        exit 1
    fi
else
    show_warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
    show_status "Execute novamente após a instalação."
    exit 1
fi

# 5. GitHub Push (se repositório existir)
echo ""
show_status "📤 Verificando GitHub..."

if git remote get-url origin &> /dev/null; then
    repo_url=$(git remote get-url origin)
    show_status "Repositório configurado: $repo_url"
    
    read -p "Fazer push para GitHub? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if git push origin main; then
            show_success "Push para GitHub concluído!"
        else
            show_warning "Falha no push - talvez o repositório não exista ainda"
            show_status "Crie o repositório em: https://github.com/new"
            show_status "Nome sugerido: precizu"
        fi
    fi
else
    show_warning "Remote origin não configurado"
fi

# 6. Resumo final
echo ""
echo -e "${PURPLE}========================================${NC}"
echo -e "${PURPLE}      ✅ DEPLOY CONCLUÍDO!      ${NC}"
echo -e "${PURPLE}========================================${NC}"
echo ""

echo -e "${GREEN}📊 Status Final:${NC}"
echo -e "  ✅ Build React: ${GREEN}Sucesso${NC}"
echo -e "  ✅ Deploy Vercel: ${GREEN}Online${NC}"
echo -e "  📋 Recursos Ativos:"
echo -e "    🛰️  Análise GNSS completa (PPP)"
echo -e "    📈 Visualizações (5 gráficos)"
echo -e "    🎯 Precisão centimétrica"
echo -e "    📄 Geração de PDFs"
echo -e "    🎨 Interface moderna"

echo ""
echo -e "${BLUE}🔗 Links Úteis:${NC}"
echo -e "  🌐 Site: $(vercel ls | head -2 | tail -1 | awk '{print "https://" $1}')"
echo -e "  📊 Dashboard: https://vercel.com/dashboard"
echo -e "  🐙 GitHub: https://github.com/new (se ainda não criou)"

echo ""
echo -e "${YELLOW}📋 Próximos Passos:${NC}"
echo -e "  1. Teste o site na URL acima"
echo -e "  2. Configure domínio personalizado (opcional)"
echo -e "  3. Configure Analytics (automático na Vercel)"
echo -e "  4. Crie repositório GitHub se ainda não tem"

echo ""
show_success "🎉 PRECIZU v2.0 está online e funcionando!"
echo -e "${PURPLE}========================================${NC}"

# Cleanup
rm -f /tmp/git_status.txt

exit 0 