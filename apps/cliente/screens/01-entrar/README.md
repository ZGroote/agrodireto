# 01 · Entrar

**Perfil:** Cliente · **Rota:** `/entrar` · **Arquivo:** `EntrarScreen.tsx`
**Referência visual:** `mockups/3-cliente.jpeg` (tela 01)

## Objetivo
Login por e-mail e senha.

## Elementos
Logo + "Cliente", título, descrição, E-mail, Senha (com olho), Entrar, Criar conta, Recuperar acesso.

## Conexões
- **Chega de:** 00b Paywall
- **Vai para:** 02 Início

## Dados (fase de integração)
Supabase Auth (e-mail + senha).

## Pendências e observações
Sem auth: Entrar (e-mail com @ e senha com 6+ caracteres) vai direto ao Início. Criar conta e Recuperar acesso sem tela no mockup.
