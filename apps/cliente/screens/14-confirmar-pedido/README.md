# 14 · Confirmar pedido

**Perfil:** Cliente · **Rota:** `/compra/confirmar` · **Arquivo:** `ConfirmarPedidoScreen.tsx`
**Referência visual:** `mockups/3-cliente.jpeg` (tela 14)

## Objetivo
Valores, pagamento e aceite.

## Elementos
Voltar, Produtos, Frete, Taxa, Tributos, TOTAL, Pagamento, Responsável pela aprovação, aceite dos termos, Confirmar pedido.

## Conexões
- **Chega de:** 13 Entrega
- **Vai para:** 15 Pedido confirmado

## Dados (fase de integração)
Edge Function cria o pedido e autoriza o pagamento.

## Pendências e observações
Confirmar habilita com o aceite. Escolha do pagamento sem mockup.
