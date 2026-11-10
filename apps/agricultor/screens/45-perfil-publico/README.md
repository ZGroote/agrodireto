# 45 · Perfil público

**App:** Agricultor · **Rota:** `/propriedade/perfil-publico` · **Arquivo:** `PerfilPublicoScreen.tsx`
**Referência visual:** criada além do mockup

## Objetivo
Como os compradores veem a propriedade.

## Conexões
- **Chega de:** 04 Minha propriedade
- **Vai para:** 10 Meus lotes (Ver lotes)

## Dados
Lidos por `hooks/dados.ts` (useAgricultor, useMidia). Hoje vêm de dados-demo (fictício).

## Observações
Reproduz a tela 05 do mockup do Cliente. Nesse app, o Cliente faz sua própria versão.
Mostra só a mídia que um comprador aprovado pode ver (podeVerMidia, de @agrodireto/dominio). Mídia pendente aparece com "Não verificado".
