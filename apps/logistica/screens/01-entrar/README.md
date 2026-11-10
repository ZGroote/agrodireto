# 01 · Entrar

**Perfil:** Logística · **Rota:** `/entrar` · **Arquivo:** `EntrarScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 01)

## Objetivo
Login por código no telefone.

## Elementos
Logo + "Logística", título, descrição, Telefone, Receber código, Criar conta, Recuperar acesso.

## Conexões
- **Chega de:** 00b Paywall
- **Vai para:** 06 Início (Receber código) · 02 Transportadora (Criar conta)

## Dados (fase de integração)
Supabase Auth (OTP por SMS).

## Pendências e observações
Sem auth: "Receber código" vai direto ao Início. Mockup não tem tela de criar conta: o cadastro começa pela 02. Recuperar acesso sem tela.
