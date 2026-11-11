# 01c · Recuperar acesso

**Perfil:** Logística · **Rota:** `/recuperar-acesso` · **Arquivo:** `RecuperarAcessoScreen.tsx`
**Referência visual:** link "Esqueci minha senha" da tela 01 (a tela em si não está no mockup)

## Objetivo
Trocar a senha com um código enviado por e-mail (Supabase Auth, sem deep link).

## Conexões
- **Chega de:** 01 Entrar
- **Vai para:** 06 Início (com transportadora) ou 02 Transportadora (sem)

## Dados
`resetPasswordForEmail` → `verifyOtp({ type: 'recovery' })` → `updateUser({ password })`.

## Pendências
O template "Reset Password" do Supabase precisa trazer `{{ .Token }}` (configuração do Maestro). SMTP próprio é pré-requisito do piloto (I04).
