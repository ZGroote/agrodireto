# 19 · Conferir recebimento

**Perfil:** Cliente · **Rota:** `/recebimento?pedido=` · **Arquivo:** `ConferirRecebimentoScreen.tsx`
**Referência visual:** `mockups/3-cliente.jpeg` (tela 19)

## Objetivo
Conferir a carga recebida.

## Elementos
Voltar, PED, Declarado x Recebido, Embalagem conforme, Aparência conforme, Sem avarias, Evidência (opcional), Confirmar recebimento, Registrar divergência.

## Conexões
- **Chega de:** 17 Detalhe do pedido
- **Vai para:** 21 Avaliar entrega · 20 Registrar divergência

## Dados (fase de integração)
Conferência do recebimento.

## Pendências e observações
Confirmar habilita com os 3 itens. "Registrar divergência" não está no mockup (único acesso à 20). Foto exige expo-image-picker.
