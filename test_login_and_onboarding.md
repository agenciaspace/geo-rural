# Teste de Login e Onboarding

## 🧪 Passos para testar:

### 1. **Abrir a aplicação**
- Acesse: http://localhost:8000
- Clique em "Entrar no Sistema"

### 2. **Fazer login ou criar conta**
- **Login:** Use uma conta existente
- **Criar conta:** Crie uma nova conta com email válido

### 3. **Observar logs no console**
Abra F12 → Console e observe as mensagens:
- `SignUp result:` ou logs de login
- `OnboardingFlow - User:` (deve mostrar o usuário)
- `Verificando usuário autenticado...`
- `Usuário da sessão:` (deve mostrar dados do usuário)

### 4. **Tentar completar onboarding**
- Preencha todas as 3 etapas
- Clique em "Finalizar"
- Observe se aparece erro ou sucesso

## 🔍 O que observar:

### ✅ **Sinais de sucesso:**
- Console mostra usuário com ID válido
- Onboarding progride normalmente
- Mensagem "OnboardingFlow - Sucesso!" no console

### ❌ **Sinais de problema:**
- "Auth state changed: INITIAL_SESSION null"
- "Usuário não autenticado"
- "Nenhum usuário encontrado na sessão"

## 🛠️ **Se ainda não funcionar:**

1. **Limpar cache do navegador:**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   // Recarregar página
   ```

2. **Verificar configurações do Supabase:**
   - Execute o script SQL corrigido
   - Verifique se email confirmation está desabilitado no painel do Supabase

3. **Criar usuário de teste:**
   - Use um email real que você tenha acesso
   - Confirme o email se necessário
   - Teste o onboarding

## 📝 **Informações para debug:**

Se o problema persistir, compartilhe:
- Logs completos do console
- Resultado do script SQL
- Se consegue fazer login mas não consegue completar onboarding