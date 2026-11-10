# 004 — Lote B: Logística

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ · eslint ✅ · bundle Android (`expo export`) ✅

## Pedido
O usuário aprovou o Lote A e pediu para seguir ("ok continue"), seguindo o plano 002: um lote por perfil.
O Lote B são as 24 telas do mockup `2-logistica.jpeg`, mais Onboarding e Paywall.

## O que foi feito
- **`features/logistica/`:**
  - `routes.ts`: `rotasLogistica` e o catálogo `telasLogistica`.
  - `README.md`: mapa de conexões, onde a tab bar aparece e conexões com outros perfis.
  - 26 pastas em `screens/`, cada uma com `*Screen.tsx` e `README.md`.
- **`app/`:** 29 arquivos de rota fina:
  - `(pre-auth)/logistica/` (onboarding, paywall, entrar);
  - `(app)/logistica/`: Stack, Tabs (Início · Cargas · Agenda · Mensagens · Perfil), `perfil/` com Stack (22 e 23), `cadastro/`, `carga`, `viagem/`, `historico`, `repasses`, `sem-conexao`.
- **Integração:**
  - `features/perfis.ts`: Logística aponta para `/logistica/onboarding`, então o "Em breve" sai da escolha de perfil.
  - O Mapa de telas (dev) ganhou o grupo Logística.
- **Tema:** novo token `sizes.iconHero = 48`, para os ícones grandes das telas 14 e 24.
- **Docs:** `DOC/navegacao.md` (árvore e status das tabs) e `DOC/design-system.md` (iconHero).

## Arquivos alterados
`features/logistica/**` (novo), `app/(pre-auth)/logistica/**` (novo), `app/(app)/logistica/**` (novo),
`features/perfis.ts`, `features/compartilhado/mapa-telas/MapaTelasScreen.tsx`, `theme/spacing.ts`,
`DOC/navegacao.md`, `DOC/design-system.md`, `DOC/README.md`, `memoria.md`.

## Verificação
- `npx tsc --noEmit`: OK. Os tipos de rota foram regenerados e todos os caminhos de `routes.ts` existem.
- `npx eslint .`: OK.
- `npx expo export --platform android`: bundle gerado sem erro.
- **Não verificado:** visual em aparelho ou simulador.

## Decisões fora do pedido
1. **Criar conta → 02 Transportadora:** o mockup não tem uma tela de criar conta.
2. **Cadastro em sequência:** 02 Salvar → 03 → 04 → 05. O mockup não liga essas telas, então adicionei "Continuar" (03 e 04) e "Concluir cadastro" (05) como botões secundários.
3. **15 Em trânsito:**
   - "Atualizar status" leva à 17.
   - O link "Registrar ocorrência" foi adicionado, porque sem ele não há acesso à 16.
4. **22 Configurações:**
   - Adicionei "Histórico de viagens", "Repasses" e "Sair". Fora do fluxo da viagem, não há outro acesso à 19 e à 20.
   - "Conta" abre a 02.
5. **09 Agenda:** a seta de voltar saiu, por ser raiz de tab (mesma regra do Lote A). O seletor de dia funciona e começa no dia de hoje.
6. **Localização e permissões (11, 13, 18, 23):**
   - O mockup mostra a permissão concedida, mas sem expo-location o estado real é "não autorizada" (aviso em laranja).
   - Os toggles da 23 começam desligados.
7. **Botões obrigatórios do fluxo da viagem:**
   - Na 13, "Confirmar coleta" exige só "Coletado por"; na 18, "Confirmar entrega" exige só "Recebido por". Foto e assinatura ainda não são capturáveis.
   - A 12 exige os 3 itens marcados.
   - Na 16, "Enviar" exige tipo, gravidade e descrição.
8. **Fim da viagem (18):** fecha o fluxo 10–18 e abre o Histórico.
9. **Status sem dados:**
   - 15 mostra "Em trânsito", porque é o estado do próprio fluxo.
   - 20 não mostra "Aguardando conferência" sem dados.
10. **Catálogos da 16:** os tipos de ocorrência e as gravidades são catálogo do produto, para revisar com o negócio.
11. **24 Sem conexão:** só abre pelo Mapa de telas até a fase offline.
