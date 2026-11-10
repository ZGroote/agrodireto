# Perfil · Cliente

Referência visual: `mockups/3-cliente.jpeg` (24 telas). Mais Onboarding e Paywall, que não têm mockup.

## Pastas

| Pasta | Conteúdo |
|---|---|
| `routes.ts` | Rotas do perfil (fonte única) e catálogo das telas |
| `screens/NN-nome/` | Uma pasta por tela: `*Screen.tsx` + `README.md` |

As telas navegam sempre por `rotasCliente`, nunca por caminho escrito à mão.

## Mapa de conexões

```
Seleção de perfil
  └─ 00a Onboarding → 00b Paywall → 01 Entrar (e-mail + senha) → 02 Início (tabs)

Tabs: Início · Ofertas · Pedidos · Mensagens · Perfil

02 Início ─┬─ busca / Ver ofertas → 03 Ofertas
           ├─ entregas hoje → 16 Meus pedidos
           ├─ cotações abertas → 09 Minhas cotações
           └─ Próxima entrega → 17 Detalhe do pedido

03 Ofertas ─┬─ filtros → 04 Mapa e filtros
            ├─ ♥ → 11 Favoritos
            ├─ Comparar ofertas → 07 Comparar → 12 Resumo
            └─ item → 06 Detalhe da oferta → 08 Solicitar cotação → 09 Minhas cotações

09 Minhas cotações → 10 Negociação ─ Aceitar → 12 Resumo da compra → 13 Entrega
                                    → 14 Confirmar pedido → 15 Pedido confirmado → 17 Detalhe do pedido

16 Meus pedidos → 17 Detalhe do pedido ─┬─ 18 Rastrear entrega
                                        ├─ 19 Conferir recebimento ─┬─ 21 Avaliar entrega → 16
                                        │                           └─ 20 Registrar divergência (volta à 19)
                                        └─ Mensagens → 23

24 Perfil ─┬─ Faturas e financeiro → 22
           └─ Sair → Seleção de perfil

05 Fornecedor ← Agricultor 04 · Ver perfil público ─ Ver lotes → 03 Ofertas
```

## Onde a tab bar aparece

- **Com tab bar** (como no mockup): 02, 03, 09, 11, 16, 17, 23, 24.
- **Sem tab bar** (fluxos em tela cheia): 04–08, 10, 12–15, 18–22.

## Conexões com outros perfis

| Origem | Destino | Status |
|---|---|---|
| Agricultor 04 · Ver perfil público | 05 · Fornecedor | Feito (Lote C) |
| 06 · Inspeções | resultado gravado pelo Administrador 10 (aqui só leitura) | fase de dados |
| 20 · Divergência | Administrador 13 · Ocorrências / 14 · Disputa | fase de dados |
| 08 · Solicitar cotação | Agricultor 16/17 · Cotações e negociação | fase de dados |
