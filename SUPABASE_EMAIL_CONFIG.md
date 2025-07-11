# Configuração de Email no Supabase

Para que o Supabase envie emails de verificação, siga estes passos:

## 1. Acesse o Painel do Supabase

1. Acesse https://app.supabase.com
2. Faça login e selecione seu projeto

## 2. Configure o Email

### Authentication > Email Templates
1. Vá para **Authentication** no menu lateral
2. Clique em **Email Templates**
3. Verifique se o template **"Confirm signup"** está habilitado
4. O template padrão já deve funcionar, mas você pode personalizá-lo se desejar

### Settings > Auth
1. Vá para **Settings** > **Authentication**
2. Certifique-se de que **"Enable email confirmations"** está ativado
3. Para projetos gratuitos, o Supabase usa seu próprio servidor SMTP

### Authentication > URL Configuration
1. Em **Authentication** > **URL Configuration**
2. Em **Redirect URLs**, adicione:
   - Para desenvolvimento: `http://localhost:8000/app`
   - Para produção: `https://seu-dominio.com/app`
3. Salve as configurações

## 3. Verificações Importantes

- **Plano Gratuito**: O Supabase envia até 3 emails por hora no plano gratuito
- **Pasta de Spam**: Os emails podem ir para a pasta de spam
- **Delay**: Pode haver um delay de alguns minutos para o email chegar

## 4. Testando

1. Crie uma nova conta com um email válido
2. A aplicação redirecionará para a página de confirmação customizada
3. O email será enviado automaticamente pelo Supabase
4. Verifique sua caixa de entrada (e spam)
5. Clique no link de confirmação no email

## 5. Troubleshooting

Se os emails não estão sendo enviados:

1. **Verifique os logs**: No painel do Supabase, vá para **Logs** > **Auth Logs**
2. **Limite de rate**: No plano gratuito, há limite de 3 emails/hora
3. **Email válido**: Use um email real e válido
4. **SMTP customizado**: Para envios ilimitados, configure seu próprio SMTP em **Settings** > **Authentication** > **SMTP Settings**

## Configuração SMTP Customizada (Opcional)

Se precisar de mais emails ou controle total:

1. Vá para **Settings** > **Authentication** > **SMTP Settings**
2. Configure com seu provedor SMTP (SendGrid, Mailgun, etc.)
3. Preencha:
   - Host
   - Port
   - Username
   - Password
   - Sender email
   - Sender name