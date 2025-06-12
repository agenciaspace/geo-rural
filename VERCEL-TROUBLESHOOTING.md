# Solução de Problemas - Deploy Vercel

## 🔧 Erro 404: NOT_FOUND

### Possíveis Causas e Soluções

#### 1. Configuração do Projeto na Vercel

**Problema**: Configuração incorreta do framework ou build
**Solução**:
1. No painel da Vercel, vá para o seu projeto
2. "Settings" > "General"
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (deixe vazio)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### 2. Variáveis de Ambiente

**Problema**: Variáveis do Supabase não configuradas
**Solução**:
1. "Settings" > "Environment Variables"
2. Adicione:
   ```
   REACT_APP_SUPABASE_URL = https://lywwxzfnhzbdkxnblvcf.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Faça redeploy

#### 3. Estrutura de Arquivos

**Problema**: Vercel não encontra os arquivos
**Solução**: Certifique-se de que a estrutura está assim:
```
georural-pro/
├── package.json          # Configuração do React
├── vercel.json           # Configuração da Vercel
├── api/                  # Vercel Functions
│   ├── upload-gnss.py
│   ├── calculate-budget.py
│   └── generate-proposal-pdf.py
├── src/                  # Código fonte React
├── public/               # Arquivos estáticos
└── supabase/            # Scripts SQL
```

#### 4. Redeploy Completo

Se nada funcionar:
1. Delete o projeto na Vercel
2. Recrie importando do GitHub
3. Configure as variáveis de ambiente
4. Deploy

## 🚀 Deploy via CLI (Alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na raiz do projeto
vercel

# Seguir instruções e configurar:
# - Framework: Create React App
# - Build Command: npm run build
# - Output Directory: build
```

## 🔍 Debug

### Verificar Logs
1. Na Vercel: "Deployments" > Clique no deployment
2. "View Function Logs" para erros de API
3. "Build Logs" para erros de build

### Testar Localmente
```bash
# Na raiz do projeto
npm run build

# Servir estaticamente
npx serve build

# Deve funcionar em localhost:3000
```

### Verificar APIs
Teste as Vercel Functions:
- `https://seu-app.vercel.app/api/calculate-budget`
- `https://seu-app.vercel.app/api/upload-gnss`

## 📱 URL de Produção

Depois do deploy, sua URL será algo como:
- `https://georural-pro-xxx.vercel.app`

Configure essa URL no Supabase:
1. Supabase > Authentication > Settings
2. **Site URL**: `https://georural-pro-xxx.vercel.app`
3. **Redirect URLs**: `https://georural-pro-xxx.vercel.app/**`

## 🔧 Configurações Avançadas

### Domínio Customizado
```bash
vercel domains add seudominio.com.br
```

### Variáveis por Ambiente
- Development: `.env.local`
- Preview: Configurar na Vercel
- Production: Configurar na Vercel

### Headers de Segurança
Adicione no `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Criar issue no repositório
- **Discord Vercel**: https://vercel.com/discord