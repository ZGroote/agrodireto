# 42 · Recuperar acesso

**App:** Agricultor · **Rota:** `/recuperar-acesso` · **Arquivo:** `RecuperarAcessoScreen.tsx`
**Referência visual:** criada além do mockup

## Objetivo
Trocar a senha com um código enviado por e-mail (Supabase Auth, sem deep link).

## Conexões
- **Chega de:** 01 Entrar (Esqueci minha senha)
- **Vai para:** 03 Seu cadastro (depois de trocar a senha, como o login)

## Dados
`resetPasswordForEmail` → `verifyOtp({ type: 'recovery' })` → `updateUser({ password })`.

## Observações
CRIADA ALÉM DO MOCKUP. O template "Reset Password" do Supabase precisa trazer `{{ .Token }}`; SMTP próprio é pré-requisito do piloto (I04).
