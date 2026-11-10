# 002 — Plano da Fase 1 (scaffold + design system)

**Data:** 2026-11-05
**Status:** Aguardando aprovação. Nada foi executado.

## Pedido
Criar o projeto Expo (blank-typescript, SDK 58), o design system em `theme/`, os componentes base,
a navegação expo-router com `(pre-auth)` e `(app)` e as telas esqueleto dos 4 perfis.
A fonte da verdade visual são os 4 mockups em `mockups/`.

## Verificações feitas
- Node v24.19.0, npm 11.17.0.
- `expo@latest` = 58.0.23 (SDK 58 existe e é a versão estável atual).
- Os mockups têm 24 telas por perfil, 96 no total.

## Tokens extraídos (das amostras de cor no rodapé dos mockups)
- primary #245943, background #F7F8F4, surface #FFFFFF, textPrimary #172C22,
  textSecondary #667368, border #E2E7DF, primarySoft #EBF0E2 (#E8F0E2 no mockup da logística),
  warning #A66825, info #386E93, danger #B64242.
- Fonte indicada: SF Pro (Apple). Não existe no Google Fonts. A proposta é usar Inter.

## Pontos em aberto, enviados ao usuário
1. Os mockups não têm Onboarding nem Paywall, mas o CLAUDE.md define o fluxo Onboarding → Paywall → Auth.
2. Os mockups não têm tela de escolha de perfil.
3. Executar em 4 lotes (um por perfil) ou tudo de uma vez.
4. Fonte Inter.
5. Dependências que o expo-router e o lucide exigem: expo-linking, expo-constants, react-native-screens,
   react-native-svg, expo-font, expo-splash-screen, @expo-google-fonts/inter e eslint (via `npx expo lint`).

O plano completo foi enviado no chat.
