# 003 — Lote A: setup, design system, navegação e Agricultor

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ · eslint ✅ · bundle Android (`expo export`) ✅

## Respostas do usuário ao plano 002
1. Onboarding e Paywall: criar para os 4 perfis.
2. Escolha de perfil: decisão minha, com pedido de que fosse robusta.
3. Execução em 4 lotes: aprovado.
4. Fonte Inter: aprovada.
5. Dependências extras: sem resposta. Instalei, porque o expo-router e o lucide exigem esses pacotes (detalhes abaixo).

## O que foi feito
- **Projeto Expo:** SDK 58 (expo 58.0.23, RN 0.88.1, React 19.3, TS 6.0), template blank-typescript. Criado numa pasta temporária e movido para a raiz.
- **Arquivos do template que não vieram:** `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.git/`, `App.tsx` e `index.ts`.
- **Configuração:**
  - `package.json`: `main: expo-router/entry`, scripts `lint`/`typecheck`, `start` com `--tunnel`.
  - `app.json`: nome AgroDireto, `scheme` e `typedRoutes`.
  - `tsconfig.json`: alias `@/`.
  - `eslint.config.js`: `no-explicit-any` como erro.
- **`.env`:** 3 variáveis vazias. `.env` adicionado ao `.gitignore`.
- **`theme/`:** cores, tipografia, espaçamento, raios, sombras e tamanhos.
- **`components/`:** 33 componentes base (ver `DOC/design-system.md`).
- **`features/`:**
  - `perfis.ts`; `compartilhado/` (seleção de perfil, templates de Onboarding/Paywall, tab bar, mapa de telas).
  - `agricultor/` com `routes.ts`, `lote/LoteDraftContext.tsx` e 26 telas, cada uma com README.
- **`app/`:** rotas finas, grupos `(pre-auth)` e `(app)`, Tabs do Agricultor.
- **`DOC/`:** `arquitetura.md`, `design-system.md`, `navegacao.md`, `assets-pendentes.md`.

## Dependências instaladas
- **Pedidas pelo usuário:** expo-router, react-native-safe-area-context, react-native-reanimated, @react-native-async-storage/async-storage, lucide-react-native, @expo-google-fonts/inter.
- **Exigidas por elas:**
  - react-native-screens, expo-linking, expo-constants e expo-status-bar (expo-router).
  - react-native-worklets (reanimated 4).
  - react-native-svg (lucide).
  - expo-font e expo-splash-screen (carregar a fonte).
- **Desenvolvimento:** eslint@9 e eslint-config-expo.
  - O ESLint 10 quebra o `eslint-plugin-react`, por isso fixei o 9.
  - A instalação usou `--legacy-peer-deps` por causa do peer opcional `react-dom` 19.3.1, que conflita com o react 19.3.0 fixado pelo SDK.

## Verificação
- `npx tsc --noEmit`: OK, com os tipos de rota gerados. Todos os caminhos de `routes.ts` existem.
- `npx eslint .`: OK, sem avisos.
- `npx expo export --platform android`: bundle gerado sem erro.
- `npx expo-doctor`: 19 de 20 checks OK. O check do schema falhou por rede (precisa da API do Expo).
- **Não verificado:** visual em aparelho ou simulador. Precisa rodar `npx expo start --tunnel` e comparar com o mockup.

## Decisões fora do pedido
Ver o relatório no chat da sessão; o mesmo conteúdo está resumido em `memoria.md`.
