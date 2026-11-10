# 14 · Disputa comercial

**Perfil:** Administrador · **Rota:** `/disputa?id=` · **Arquivo:** `DisputaComercialScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 14)

## Objetivo
Decidir uma disputa de pedido.

## Elementos
Voltar, PED, Declarado, Recebido, Evidências, Ajuste, Solução, Motivo (obrigatório), Registrar decisão.

## Conexões
- **Chega de:** 12 Pedido e carga
- **Vai para:** volta (Registrar decisão)

## Dados (fase de integração)
Disputa + decisão via Edge Function + auditoria (23).

## Pendências e observações
Registrar habilita com solução e motivo. Soluções são catálogo — revisar.
