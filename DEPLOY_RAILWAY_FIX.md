# 🚀 Deploy no Railway com Supabase Funcionando

## Problema Resolvido
O React não estava recebendo as variáveis de ambiente durante o build, fazendo com que o app rodasse em modo demo.

## Solução Implementada
Modificamos o `Dockerfile` para passar as variáveis de ambiente durante o build do React.

## Passos para Deploy

### 1. Commit e Push das Mudanças
```bash
git add Dockerfile src/config/supabase.js
git commit -m "fix: Pass Supabase env vars during React build"
git push origin main
```

### 2. No Railway Dashboard

1. **Verifique as Variáveis** (já estão configuradas):
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. **Force um Novo Deploy**:
   - Vá para **Deployments**
   - Clique em **Redeploy** no último deployment
   - Ou aguarde o deploy automático após o push

### 3. Verificar se Funcionou

1. Acesse https://ongeo.up.railway.app
2. Abra o console do navegador (F12)
3. Procure pelos logs:
   ```
   🔥 SUPABASE CONFIG CHECK:
   🔥 URL: ✅ Configurado
   🔥 KEY: ✅ Configurado
   🔥 Cliente Supabase será: CRIADO
   ```

4. Tente fazer um cadastro
5. Verifique se o usuário aparece no Supabase Dashboard

### 4. Configurar Email no Supabase

Se o usuário aparecer mas o email não for enviado:

1. No Supabase Dashboard, vá para **Settings** > **Auth**
2. Configure um SMTP customizado (SendGrid, Resend, etc.)
3. Ou use o limite padrão de 2 emails/hora para testes

### 5. Limpeza (Após Confirmar que Funciona)

Remova os logs de debug do `src/config/supabase.js`:
```javascript
// Remover estas linhas:
console.log('🔥 SUPABASE CONFIG CHECK:');
console.log('🔥 URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('🔥 KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado');
console.log('🔥 Cliente Supabase será:', supabaseUrl && supabaseAnonKey ? 'CRIADO' : 'NULL (modo demo)');
```

## Troubleshooting

### Se ainda não funcionar:

1. **Verifique os logs do build** no Railway para ver se as variáveis estão sendo passadas
2. **Limpe o cache do navegador** ou teste em janela anônima
3. **Verifique se o Dockerfile está sendo usado** (não deve haver outro arquivo de configuração)

### Logs esperados após o fix:

- No console: `🔥 Cliente Supabase será: CRIADO`
- No cadastro: `🔥 Supabase signUp response:` com dados reais
- Usuário deve aparecer no Supabase Dashboard 