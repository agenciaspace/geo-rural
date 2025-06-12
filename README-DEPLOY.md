# Deploy na Vercel - GeoRural Pro

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Vercel CLI instalado (opcional): `npm i -g vercel`

## Passos para Deploy

### 1. Via Interface Web da Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub (ou faça upload da pasta)
3. Configure as seguintes opções:
   - **Framework Preset**: Create React App
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2. Via CLI

```bash
# Na raiz do projeto
vercel

# Siga as instruções:
# - Selecione o escopo da conta
# - Link para projeto existente ou crie novo
# - Detectará automaticamente as configurações
```

## Estrutura do Projeto

```
georural-pro/
├── api/                    # Vercel Functions (serverless)
│   ├── upload-gnss.py     # Endpoint para upload GNSS
│   ├── calculate-budget.py # Cálculo de orçamento
│   └── generate-proposal-pdf.py # Geração de PDF
├── src/                   # Código fonte React
├── public/                # Arquivos estáticos
├── backend/              # Backend original (não usado na Vercel)
└── vercel.json           # Configuração da Vercel
```

## Limitações na Vercel

1. **Processamento GNSS**: A análise real de arquivos RINEX foi substituída por uma simulação devido às limitações de bibliotecas Python na Vercel.

2. **Geração de PDF**: Retorna um PDF base64 simulado. Para produção real, considere:
   - Usar um serviço externo de geração de PDF
   - Implementar com Puppeteer/Playwright
   - Usar uma API dedicada

3. **Tamanho de arquivos**: Limite de 5MB para uploads na Vercel Free.

## Variáveis de Ambiente

Não são necessárias para o deploy básico. Se precisar customizar:

```bash
# No painel da Vercel
REACT_APP_API_URL=https://seu-backend-externo.com
```

## Solução Completa para Produção

Para uma solução completa com todas as funcionalidades:

1. **Frontend**: Vercel (como está)
2. **Backend API**: 
   - Railway.app
   - Render.com
   - Fly.io
   - AWS Lambda
3. **Processamento GNSS**: Serviço dedicado ou AWS Lambda com layers customizadas

## URLs após Deploy

- Frontend: `https://seu-projeto.vercel.app`
- API Functions:
  - `/api/upload-gnss`
  - `/api/calculate-budget`
  - `/api/generate-proposal-pdf`

## Comandos Úteis

```bash
# Ver logs
vercel logs

# Ver ambiente de produção
vercel --prod

# Configurar domínio customizado
vercel domains add seu-dominio.com.br
```

## Suporte

Para dúvidas sobre o deploy, consulte:
- Documentação Vercel: https://vercel.com/docs
- Suporte: https://vercel.com/support