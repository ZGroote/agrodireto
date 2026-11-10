# 46 · Verificar código

**App:** Agricultor · **Rota:** `/verificar-codigo` · **Arquivo:** `VerificarCodigoScreen.tsx`
**Referência visual:** criada além do mockup

## Objetivo
Confirmar o código de 6 dígitos enviado por SMS.

## Conexões
- **Chega de:** 01 Entrar · 42 Recuperar acesso
- **Vai para:** 07 Início

## Dados
Lidos por `hooks/dados.ts` (useCodigoValidacao). Hoje vêm de dados-demo (fictício).

## Observações
CRIADA ALÉM DO MOCKUP: o mockup não mostra o passo do código no login. Sem auth: qualquer código de 6 dígitos entra.
