# 18 · Prova de entrega

**Perfil:** Logística · **Rota:** `/viagem/prova-entrega?carga=` · **Arquivo:** `ProvaEntregaScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 18)

## Objetivo
Comprovar a entrega.

## Elementos
Voltar, carga, peso/caixas, Recebido por, Evidência, Assinatura, horário, localização, Confirmar entrega.

## Conexões
- **Chega de:** 17 Chegada ao comprador
- **Vai para:** 19 Histórico (fecha o fluxo da viagem)

## Dados (fase de integração)
Evidências da entrega; gera repasse.

## Pendências e observações
Foto e assinatura exigem libs. Só "Recebido por" é obrigatório. Exige expo-location (aprovação pendente): hoje mostra "não autorizada".
