# Configuração de Email de Confirmação no Supabase

## Problema
O email de confirmação não está sendo enviado automaticamente após o cadastro.

## Solução

### 1. Verificar Configurações no Dashboard do Supabase

1. Acesse o Dashboard do Supabase
2. Vá para **Authentication** > **Providers** > **Email**
3. Certifique-se de que **"Confirm email"** está **HABILITADO**
4. Salve as alterações

### 2. Configurar SMTP Customizado (Importante para Produção)

O Supabase tem um limite padrão de **2 emails por hora**. Para produção, você DEVE configurar um servidor SMTP customizado.

#### No Dashboard do Supabase:
1. Vá para **Settings** > **Auth**
2. Role até **SMTP Settings**
3. Habilite **"Enable Custom SMTP"**
4. Configure com um dos seguintes provedores:

##### Opção A: SendGrid (Recomendado)
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: SUA_SENDGRID_API_KEY
Sender email: noreply@seudominio.com
Sender name: OnGeo
```

##### Opção B: Resend
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: SUA_RESEND_API_KEY
Sender email: noreply@seudominio.com
Sender name: OnGeo
```

##### Opção C: Amazon SES
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: SEU_SMTP_USERNAME
Password: SEU_SMTP_PASSWORD
Sender email: noreply@seudominio.com
Sender name: OnGeo
```

### 3. Configurar Redirect URLs

No Dashboard do Supabase:
1. Vá para **Authentication** > **URL Configuration**
2. Adicione as seguintes URLs em **Redirect URLs**:
   ```
   http://localhost:3000/app
   http://localhost:8000/app
   https://seudominio.com/app
   https://seuapp.railway.app/app
   ```

### 4. Testar Localmente com Inbucket

Para desenvolvimento local, o Supabase CLI usa o Inbucket automaticamente:

```bash
# Verificar o status do Supabase local
supabase status

# Acessar o Inbucket (geralmente em http://localhost:54324)
# Todos os emails serão capturados lá
```

### 5. Verificar Logs de Email

No Dashboard do Supabase:
1. Vá para **Logs** > **Auth**
2. Filtre por `auth.email`
3. Verifique se há erros no envio

### 6. Código Frontend Atualizado

O código já está configurado corretamente em `src/config/supabase.js`:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: metadata,
    emailRedirectTo: window.location.origin + '/app'
  }
});
```

## Checklist de Verificação

- [ ] "Confirm email" está habilitado no Dashboard
- [ ] SMTP customizado configurado (para produção)
- [ ] Redirect URLs configuradas
- [ ] Domínio verificado (se usando SMTP customizado)
- [ ] Templates de email configurados (opcional)

## Troubleshooting

### Email não chega
1. Verifique a pasta de spam
2. Verifique os logs no Dashboard
3. Teste com um email diferente
4. Verifique o limite de rate (2/hora sem SMTP customizado)

### Link de confirmação não funciona
1. Verifique se a Redirect URL está configurada
2. Verifique se o token não expirou (24 horas por padrão)
3. Tente reenviar o email de confirmação

### Para Railway/Produção
Certifique-se de que as variáveis de ambiente estão configuradas:
```
REACT_APP_SUPABASE_URL=sua_url
REACT_APP_SUPABASE_ANON_KEY=sua_chave
```

## Próximos Passos

1. Configure o SMTP customizado no Dashboard do Supabase
2. Teste o fluxo de cadastro novamente
3. Verifique se o email está chegando
4. Se não funcionar, verifique os logs de autenticação no Dashboard 