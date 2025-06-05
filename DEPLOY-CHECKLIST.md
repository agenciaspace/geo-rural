# ✅ Checklist de Deploy - Vercel

## 🔧 Estrutura Corrigida

✅ **Arquivos React na raiz**
- package.json na raiz
- src/ na raiz  
- public/ na raiz
- build/ gerado na raiz

✅ **Configuração Vercel**
- vercel.json configurado para Create React App
- Framework detectado automaticamente
- Rewrites configurados para SPA

✅ **Build funcionando**
- `npm run build` executa sem erros
- Arquivos gerados em build/

## 🚀 Para Deploy na Vercel

### Opção 1: Via Interface Web
1. Delete o projeto atual na Vercel
2. Importe novamente do GitHub
3. A Vercel deve detectar automaticamente:
   - **Framework**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Opção 2: Via CLI
```bash
# Na raiz do projeto
vercel --prod
```

## 🔑 Variáveis de Ambiente na Vercel

Configure no painel da Vercel:
```
REACT_APP_SUPABASE_URL = https://lywwxzfnhzbdkxnblvcf.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Resultado Esperado

Após o deploy:
- ✅ Landing page carrega em `/`
- ✅ APIs funcionam em `/api/*`
- ✅ SPA routing funciona
- ✅ Supabase conectado

## 🐛 Se Ainda Der 404

1. **Verificar Build Logs**: Na Vercel, vá em Deployments > Ver logs
2. **Verificar Output**: Deve mostrar arquivos em `build/`
3. **Verificar Framework**: Deve detectar Create React App

## 📞 Último Recurso

Se nada funcionar, use essa configuração manual na Vercel:
- **Framework Preset**: Other
- **Build Command**: `npm run build`  
- **Output Directory**: `build`
- **Install Command**: `npm install`

---

**Status**: ✅ Estrutura corrigida, pronto para deploy!