# 005 — Lote C: Cliente

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ · eslint ✅ · bundle Android (`expo export`) ✅

## Pedido
O usuário pediu para continuar ("continue") depois do Lote B, seguindo o plano 002: um lote por perfil.
O Lote C são as 24 telas do mockup `3-cliente.jpeg`, mais Onboarding e Paywall.

## O que foi feito
- **`features/cliente/`:**
  - `routes.ts`: `rotasCliente` e o catálogo `telasCliente`.
  - `components/InlineFieldRow.tsx`: linha com rótulo à esquerda e campo à direita, usada nas telas 04, 08 e 20.
  - `README.md`: mapa de conexões, onde a tab bar aparece e conexões com outros perfis.
  - 26 pastas em `screens/`, cada uma com `*Screen.tsx` e `README.md`.
- **`app/`:** 31 arquivos de rota fina:
  - `(pre-auth)/cliente/` (onboarding, paywall, entrar);
  - `(app)/cliente/`: Stack e Tabs (Início · Ofertas · Pedidos · Mensagens · Perfil);
  - Stacks dentro das tabs `inicio` (02, 09), `ofertas` (03, 11) e `pedidos` (16, 17);
  - fora das tabs: telas 04–08, 10, `compra/` (12–15) e 18–22.
- **Integração:**
  - `features/perfis.ts`: o Cliente aponta para `/cliente/onboarding`.
  - O Mapa de telas (dev) ganhou o grupo Cliente.
  - O "Ver perfil público" do **Agricultor 04** agora abre o **Cliente 05 · Fornecedor** (README do Agricultor atualizado).
- **Docs:** `DOC/navegacao.md` (árvore e status das tabs).

## Arquivos alterados
`features/cliente/**` (novo), `app/(pre-auth)/cliente/**` (novo), `app/(app)/cliente/**` (novo),
`features/perfis.ts`, `features/compartilhado/mapa-telas/MapaTelasScreen.tsx`,
`features/agricultor/screens/04-minha-propriedade/` (tela + README), `features/agricultor/README.md`,
`DOC/navegacao.md`, `DOC/README.md`, `memoria.md`.

## Verificação
- `npx tsc --noEmit`: OK, com os tipos de rota regenerados.
- `npx eslint .`: OK.
- `npx expo export --platform android`: bundle gerado sem erro.
- **Não verificado:** visual em aparelho ou simulador.

## Decisões fora do pedido
1. **Criar conta e Recuperar acesso** ficam inertes: o mockup do Cliente não tem essas telas.
2. **Acessos que não estão no mockup:**
   - Ofertas (03): botão ♥ para a 11 Favoritos e link "Comparar ofertas" para a 07.
   - Detalhe do pedido (17): "Rastrear entrega" e "Conferir recebimento".
   - Conferir recebimento (19): link "Registrar divergência".
   - Configurações (24): "Faturas e financeiro".
3. **Botões que exigem preenchimento:**
   - 07 "Selecionar oferta" fica desabilitado sem ofertas para comparar.
   - 08 "Enviar cotação" exige quantidade e data.
   - 14 "Confirmar pedido" exige o aceite dos termos.
   - 19 exige os 3 itens marcados.
   - 20 exige tipo, severidade e descrição.
   - 21 exige as 4 notas.
4. **Itens por lista ("Ver proposta" na 09, "Ver pedido" na 16):** ficam ativos para manter as telas conectadas, como o "Ver oferta" da Logística.
5. **Seta de voltar:** removida da 16 e da 23, por serem raiz de tab. O mockup mostra a seta nessas duas.
6. **Status sem dados:**
   - 15 não mostra "Pagamento autorizado".
   - 05 não afirma "Cadastro verificado".
   - 21 mostra "Pedido entregue", porque é o estado do próprio fluxo, depois de confirmar o recebimento.
7. **Fim dos fluxos:**
   - 15 "Acompanhar pedido" fecha o fluxo de compra e abre o pedido.
   - 21 "Enviar avaliação" volta a Meus pedidos.
8. **Filtros (04):** "Aplicar" só volta para a 03. Os filtros passam a valer na fase de dados.
9. **Catálogos para revisar com o negócio:** distância (04) e os tipos, severidades e impactos de divergência (20).
