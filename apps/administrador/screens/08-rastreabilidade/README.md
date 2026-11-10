# 08 · Rastreabilidade

**Perfil:** Administrador · **Rota:** `/rastreabilidade?id=` · **Arquivo:** `RastreabilidadeScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 08)

## Objetivo
Rastrear e, se preciso, bloquear o lote.

## Elementos
Voltar, código + QR, Origem/Coleta/Recebimento, pedidos afetados, Motivo do bloqueio (obrigatório), Bloquear lote.

## Conexões
- **Chega de:** 07 Revisão de lotes
- **Vai para:** 12 Pedido e carga · volta (Bloquear)

## Dados (fase de integração)
Eventos do lote, pedidos vinculados.

## Pendências e observações
Bloquear habilita com motivo. QR exige lib. Motivos são catálogo — revisar.
