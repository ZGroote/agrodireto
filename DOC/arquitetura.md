# Arquitetura

## Quatro aplicativos, um repositório

Cada perfil é um **aplicativo independente** (nome, ícone, bundle id, build e loja próprios). O repositório é um monorepo (npm workspaces) com o design system compartilhado.

```
agrodireto/
  apps/
    agricultor/      AgroDireto Agricultor   com.agrodireto.agricultor
    cliente/         AgroDireto Cliente      com.agrodireto.cliente
    logistica/       AgroDireto Logística    com.agrodireto.logistica
    administrador/   AgroDireto Admin        com.agrodireto.administrador
  services/
    midia-worker/    Worker de otimização de fotos e vídeos (Node, sharp, FFmpeg, VMAF)
  packages/
    ui/              @agrodireto/ui — tokens, componentes e templates compartilhados
    dominio/         @agrodireto/dominio — contratos do negócio usados pelos 4 apps (sem UI)
  DOC/  mockups/  CLAUDE.md  memoria.md
```

Cada app tem o seu `package.json`, `app.json`, `tsconfig.json`, `.env` e `assets/`. Nenhum app importa código de outro app.

### Como rodar

Entre na pasta do app. Exemplo:

```
cd apps/agricultor
npx expo start --tunnel        # celular (Expo Go)
npx expo start --web --port 19000   # navegador / SIMULATOR ONGAM
```

Portas sugeridas para web: cliente 8084, logística 8085, administrador 8086. Para o SIMULATOR ONGAM, rode o app em `--port 19006` (uma das portas que a extensão procura: 8081, 8082, 19000, 19006).
Na raiz: `npm run typecheck` (todos os apps) e `npm run lint`.

## Serviços (`services/`)

Componentes de servidor que não cabem nas Edge Functions. Hoje só o `midia-worker` (otimização automática de mídia): exceção aprovada à regra "backend é só Supabase". Ver `services/midia-worker/README.md` e `DOC/midias-compartilhadas.md`.

## Estrutura de um app

| Pasta/arquivo | Papel |
|---|---|
| `app/` | Rotas do expo-router: cada arquivo re-exporta uma tela. Grupos `(pre-auth)` e `(app)` |
| `screens/NN-nome/` | Tela (`*Screen.tsx`) e o `README.md` dela |
| `routes.ts` | Rotas tipadas do app (`rotas<Perfil>`) e catálogo das telas (`telas<Perfil>`) |
| `components/` | Componentes só deste app (ex.: cartão de lote) |
| `hooks/` | Acesso a dados. Hoje devolvem os dados fictícios |
| `dados-demo/` | **Dados fictícios (apagar na integração)**. Só o Agricultor tem |
| `types.ts` | Tipos do domínio do app |
| `lib/` | Utilitários do app |

## Pacote `@agrodireto/dominio`

Tipos, rótulos e regras que **precisam ser iguais nos quatro apps**. Hoje tem a mídia (foto, vídeo e drone: quem envia, quem valida e quem vê). Ver `DOC/midias-compartilhadas.md`.

## Pacote `@agrodireto/ui`

Tokens (`theme/`), componentes (`components/`), formatadores (`format.ts`), templates de Onboarding e Paywall, Mapa de telas (dev), `AppProviders` (fontes Inter, splash, safe area) e o botão voltar com fallback.
O que serve a dois ou mais apps vai para o pacote. O que serve a um só fica no app.

## Regras de navegação

- Use `useRouter()` nos componentes. No SDK 58, o `router` de módulo lança erro antes do primeiro render.
- Nunca escreva caminho de rota à mão. Use `rotas<Perfil>.x`.
- Os tipos de rota são gerados por app (`typedRoutes`). Se um caminho de `routes.ts` não existir, o `tsc` falha.
- Parâmetros (id de lote ou pedido) vão como query opcional (`?id=`).
- **Botão voltar:** o `ScreenHeader` mostra a seta em toda tela. Sem histórico (URL aberta direto), volta ao Início do app (`VoltarProvider`). Só o Início, que é a primeira tela depois do login, fica sem seta.
- A tab bar só aparece nas telas dentro de `(app)/(tabs)`. Telas fora dela (fluxos, formulários) ficam em tela cheia.

## Dados de demonstração (Agricultor)

Para acompanhar o layout dos mockups, o app Agricultor lê dados **fictícios** de `dados-demo/index.ts`, sempre por `hooks/dados.ts`.
Para integrar o Supabase: troque o corpo de cada hook por uma consulta e apague `dados-demo/`. Os tipos em `types.ts` não mudam.
Os outros três apps ainda seguem a regra "sem mock data" (estado vazio e "—").
