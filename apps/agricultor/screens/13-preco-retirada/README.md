# 13 · Preço e retirada (3/3)

**App:** Agricultor · **Rota:** `/lote/preco` · **Arquivo:** `PrecoRetiradaScreen.tsx`
**Referência visual:** `mockups/1-agricultor.jpeg` (tela 13)

## Objetivo
Preço, colheita, retirada, condições e validade.

## Conexões
- **Chega de:** 12 Padrão do lote
- **Vai para:** 14 Revisar oferta

## Dados
Lidos por `hooks/dados.ts` (LoteDraftContext). Hoje vêm de dados-demo (fictício).

## Observações
Retirada em um campo só ("05/11 a 06/11/2026"), como no mockup. Datas digitadas até haver seletor de data.
Pop-ups de calendário: "Data da colheita" e "Validade da oferta" escolhem um dia; "Retirada" escolhe um período (primeiro toque = início, segundo = fim).
