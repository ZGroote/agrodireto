# 15 · Em trânsito

**Perfil:** Logística · **Rota:** `/viagem/em-transito?carga=` · **Arquivo:** `EmTransitoScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 15)

## Objetivo
Acompanhar a viagem até o comprador.

## Elementos
Voltar, mapa, carga, origem → destino, Chegada prevista, Atualizado em, status Em trânsito, Atualizar status, Registrar ocorrência.

## Conexões
- **Chega de:** 14 Iniciar transporte
- **Vai para:** 17 Chegada ao comprador (Atualizar status) · 16 Registrar ocorrência

## Dados (fase de integração)
Posição/ETA (rastreamento).

## Pendências e observações
Mapa exige react-native-maps. "Registrar ocorrência" não está no mockup (único acesso à 16).
