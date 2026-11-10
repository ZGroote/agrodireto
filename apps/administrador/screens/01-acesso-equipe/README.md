# 01 · Acesso da equipe

**Perfil:** Administrador · **Rota:** `/entrar` · **Arquivo:** `AcessoEquipeScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 01)

## Objetivo
Login da equipe por e-mail e senha.

## Elementos
Logo + "Administrador", título, E-mail, Senha (com olho), Entrar, Recuperar acesso, Acesso por convite.

## Conexões
- **Chega de:** 00b Paywall
- **Vai para:** 02 Verificação de segurança

## Dados (fase de integração)
Supabase Auth (e-mail + senha) com MFA.

## Pendências e observações
Entrar habilita com e-mail com @ e senha com 6+ caracteres. Recuperar acesso e convite sem tela.
