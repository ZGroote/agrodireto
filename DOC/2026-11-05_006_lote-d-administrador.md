# 006 — Lote D: Administrador (fim da Fase 1)

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ · eslint ✅ · bundle Android (`expo export`) ✅

## Pedido
O usuário pediu para continuar ("continue") depois do Lote C, seguindo o plano 002.
O Lote D são as 24 telas do mockup `4-administrador.jpeg`, mais Onboarding e Paywall. Com ele, a Fase 1 termina.

## O que foi feito
- **`features/administrador/`:**
  - `routes.ts`: `rotasAdministrador` e o catálogo `telasAdministrador`.
  - `README.md`: mapa de conexões, onde a tab bar aparece e conexões com outros perfis.
  - 26 pastas em `screens/`, cada uma com `*Screen.tsx` e `README.md`.
- **`app/`:** 29 arquivos de rota fina:
  - `(pre-auth)/administrador/` (onboarding, paywall, entrar, verificacao);
  - `(app)/administrador/`: Stack e Tabs (Início 03 · Operação 11 · Cadastros 04 · Alertas 13 · Perfil);
  - `perfil/` com Stack: 24 e 17–23;
  - telas em tela cheia: 05–10, 12 e 14–16.
- **`components/InlineFieldRow.tsx`:** movido de `features/cliente/components/`, porque agora é usado por dois perfis. Exportado em `components/index.ts`, e os imports do Cliente foram atualizados.
- **Integração:**
  - `features/perfis.ts`: o Administrador aponta para `/administrador/onboarding`. Com isso, o link "Acesso da equipe AgroDireto" da escolha de perfil passa a funcionar.
  - O Mapa de telas ganhou o grupo Administrador.
- **Docs:**
  - `DOC/navegacao.md` (árvore completa e tabs) e `DOC/design-system.md` (InlineFieldRow).
  - Tabelas de conexão entre perfis nos READMEs do Agricultor, da Logística e do Cliente.

## Arquivos alterados
`features/administrador/**` (novo), `app/(pre-auth)/administrador/**` (novo), `app/(app)/administrador/**` (novo),
`components/InlineFieldRow.tsx` (movido), `components/index.ts`, telas 04/08/20 do Cliente (import),
`features/perfis.ts`, `features/compartilhado/mapa-telas/MapaTelasScreen.tsx`,
`features/{agricultor,logistica,cliente}/README.md`, `DOC/navegacao.md`, `DOC/design-system.md`, `DOC/README.md`, `memoria.md`.

## Verificação
- `npx tsc --noEmit`: OK.
- `npx eslint .`: OK. Corrigi um erro de `react-hooks/use-memo` na tela 16.
- `npx expo export --platform android`: bundle gerado sem erro.
- **Não verificado:** visual em aparelho ou simulador.

## Decisões fora do pedido
1. **Raízes de tab:**
   - Início 03, Operação 11 (Torre logística), Cadastros 04, Alertas 13 (Ocorrências) e Perfil 24.
   - O mockup mostra 04, 11 e 13 sem tab bar e com seta de voltar. Aqui elas são raízes de tab, então têm a barra e não têm voltar.
2. **Telas 17–23:** ficam dentro da tab **Perfil**, com uma seção "Administração" na 24 que não está no mockup. O mockup mostra a tab bar nelas, com Início destacado.
3. **Atalhos no Início (03):** Revisão de lotes, Inspeções, Conciliação e Relatórios. Sem eles, não há acesso às telas 07, 09, 15 e 16.
4. **Ligações entre telas:**
   - 12 "Abrir operação" abre a 14 Disputa comercial.
   - 07 "Revisar lote" abre a 08.
   - 08 "pedidos afetados" abre a 12.
5. **Ocorrências (13):** sem dados, mostra estado vazio e "Assumir" fica desabilitado.
6. **Temperatura (10):** o mockup mostra um seletor ("Não medida"). Virou um campo numérico em °C, com "Não medida" como placeholder.
7. **Inspeções nos outros perfis:** o Agricultor (15) e o Cliente (06) **não** abrem telas do Administrador, porque são ferramentas internas. Eles vão ver o resultado da inspeção, em modo leitura, na fase de dados.
8. **Paywall do Administrador:** criado porque foi pedido nos 4 perfis, mas o Administrador é a equipe interna. Recomendo decidir com o negócio se essa etapa deve existir.
9. **Catálogos para revisar com o negócio:**
   - motivos de bloqueio (08), resultados de inspeção (10), soluções de disputa (14);
   - funções (18), templates e canais (21).
