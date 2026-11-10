# 11 · Torre logística

**Perfil:** Administrador · **Rota:** `/operacao` · **Arquivo:** `TorreLogisticaScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 11)

## Objetivo
Visão das cargas em andamento.

## Elementos
Título, Ativas/Atrasos, mapa, carga selecionada (estado vazio), Ver carga. Tab bar.

## Conexões
- **Chega de:** tab Operação · 03 Início
- **Vai para:** 12 Pedido e carga

## Dados (fase de integração)
Cargas + posição/ETA (Realtime).

## Pendências e observações
Mapa exige react-native-maps. Mockup mostra voltar e não mostra tab bar; por ser raiz de tab, aqui tem tab bar e não tem voltar.
