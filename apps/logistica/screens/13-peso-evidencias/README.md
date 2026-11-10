# 13 · Peso e evidências

**Perfil:** Logística · **Rota:** `/viagem/evidencias?carga=` · **Arquivo:** `PesoEvidenciasScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 13)

## Objetivo
Prova da coleta.

## Elementos
Voltar, Peso total, Quantidade, Evidência (foto), Coletado por, Assinatura, horário, localização, Confirmar coleta.

## Conexões
- **Chega de:** 12 Conferir coleta
- **Vai para:** 14 Iniciar transporte

## Dados (fase de integração)
Evidências (foto, assinatura, horário, posição).

## Pendências e observações
Foto e assinatura exigem libs (aprovação). Por isso só "Coletado por" é obrigatório. Exige expo-location (aprovação pendente): hoje mostra "não autorizada".
