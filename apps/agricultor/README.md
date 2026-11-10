# App · Agricultor

Aplicativo **só do agricultor** (AgroDireto Agricultor, `com.agrodireto.agricultor`).
Referência visual: `mockups/1-agricultor.jpeg` (24 telas). Além delas, o app tem as telas que o mockup referencia e não desenha, e Onboarding, Paywall e verificação de código.

Total: **47 telas**. Cada uma tem pasta e README em `screens/NN-nome/`. O catálogo completo está em `routes.ts` (`telasAgricultor`) e no "Mapa de telas (dev)".

## Fluxo de entrada

```
Onboarding → Paywall → Entrar ─┬─ Receber código → Verificar código → Início (tabs)
                               ├─ Criar conta → Seu cadastro → … → Início
                               └─ Recuperar acesso → Verificar código
```

## Tabs

Início · Produção · Pedidos · Mensagens · Perfil

```
07 Início ─┬─ 28 Notificações (sino)
           ├─ 22 Financeiro ── 36 Detalhe do repasse ── 25 Dados bancários
           ├─ 16 Cotações ── 17 Negociação ─┬─ 33 Contraproposta
           │                                └─ Aceitar → 18 Pedidos
           ├─ 18 Pedidos ── 19 Preparar coleta ── 20 Entregar ao motorista ── 21 Transporte ── 35 Ocorrência
           └─ Publicar lote → 11 Novo lote → 12 Padrão → 13 Preço → 14 Revisar → 15 Detalhe do lote ─┬─ 31 Inspeções
                                                                                                    └─ "..." (folha de ações)

08 Produção ┬─ 09 Previsão de safra
            ├─ 10 Meus lotes ── 15 Detalhe do lote
            ├─ 16 Cotações
            └─ 30 Cadastrar cultura

18 Pedidos ── 34 Todos os pedidos
23 Mensagens ── 37 Conversas · aba Suporte

24 Configurações ┬─ 04 Minha propriedade ┬─ 26 Editar propriedade
                 │                       ├─ 05 Fotos e vídeos
                 │                       └─ 45 Perfil público
                 ├─ 29 Preferências de notificação
                 ├─ 39 Privacidade ── 43 Termos · 44 Política
                 ├─ 40 Segurança
                 ├─ 41 Ajuda ── 23 Suporte
                 └─ Sair → Onboarding

03 Seu cadastro ┬─ 06 Documentos ── 27 Enviar documento
                ├─ 04 Propriedade
                ├─ 25 Dados bancários

```

## Onde a tab bar aparece

- **Com tab bar** (como no mockup): 07, 08, 09, 10, 16, 18, 23, 24, e as telas novas dentro das tabs (29, 34, 37, 39, 40, 41).
- **Sem tab bar:** cadastro (03–06, 25–27), propriedade (04, 26, 45), fluxo de lote (11–15, 31), negociação (17, 33), coleta e transporte (19–21, 35), financeiro (22, 36), notificações (28) e cultura (30).

## Dados fictícios

Os valores vêm de `dados-demo/index.ts` (copiados do mockup) e são lidos por `hooks/dados.ts`.
**Apagar ao integrar o Supabase:** apague a pasta `dados-demo/` e troque o corpo de cada hook por uma consulta. Os tipos (`types.ts`) ficam.
