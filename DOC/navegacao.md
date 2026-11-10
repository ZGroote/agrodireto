# Navegação

Cada perfil é um app separado (ver `arquitetura.md`). Todos seguem o fluxo de entrada do CLAUDE.md:

```
Onboarding → Paywall → Auth (Entrar) → app com tab bar
```

As URLs de cada app começam na raiz (`/onboarding`, `/inicio`…), sem prefixo de perfil. `/` redireciona para o Onboarding.

## Mapa de cada app

| App | Telas | Mapa de conexões |
|---|---|---|
| Agricultor | 47 (24 do mockup + 23 criadas) | `apps/agricultor/README.md` |
| Cliente | 26 (versão do Lote C, a refinar) | `apps/cliente/README.md` |
| Logística | 26 (versão do Lote B, a refinar) | `apps/logistica/README.md` |
| Administrador | 26 (versão do Lote D, a refinar) | `apps/administrador/README.md` |

Os READMEs dos três últimos ainda descrevem a primeira versão e serão refeitos quando cada app for refinado, como foi feito no Agricultor.

## Tab bars

| App | Tabs |
|---|---|
| Agricultor | Início · Produção · Pedidos · Mensagens · Perfil |
| Logística | Início · Cargas · Agenda · Mensagens · Perfil |
| Cliente | Início · Ofertas · Pedidos · Mensagens · Perfil |
| Administrador | Início · Operação · Cadastros · Alertas · Perfil |

Todos usam o mesmo estilo (`tabBarScreenOptions`, em `@agrodireto/ui`). A tab bar só aparece nas telas dentro de `(app)/(tabs)`.

## Botão voltar

- O `ScreenHeader` mostra a seta em toda tela.
- Sem histórico (URL aberta direto, ou depois de um `replace`), a seta leva ao Início do app. Nas telas de pré-login, leva ao Onboarding.
- Só o Início, primeira tela depois do login, fica sem seta (como no mockup).

## Mapa de telas (dev)

Em desenvolvimento, o Onboarding de cada app mostra o link "Mapa de telas (dev)" (rota `/telas`). Ele lista todas as telas do app e abre qualquer uma direto, para conferir com o mockup. Em produção (`__DEV__ = false`), a tela não renderiza.
