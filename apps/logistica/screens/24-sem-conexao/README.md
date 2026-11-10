# 24 · Sem conexão

**Perfil:** Logística · **Rota:** `/sem-conexao` · **Arquivo:** `SemConexaoScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 24)

## Objetivo
Estado offline com fila local.

## Elementos
Ícone, título, coleta salva, evidências pendentes, última sincronização, Tentar sincronizar.

## Conexões
- **Chega de:** (automático, fase offline) · Mapa de telas
- **Vai para:** volta à tela anterior (ou Início)

## Dados (fase de integração)
Fila de sincronização no AsyncStorage.

## Pendências e observações
Ainda não abre sozinha: falta detectar rede (fase offline).
