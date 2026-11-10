# 008 — App no SIMULATOR ONGAM (versão web)

**Data:** 2026-11-05
**Status:** Servidor web rodando em `http://localhost:8082`.

## Pedido
O SIMULATOR ONGAM mostrava um JSON em vez do app. O motivo: o servidor servia o manifesto nativo do Expo Go, e não uma página web.

## Decisão do usuário
Instalar as dependências web (aprovado na pergunta "Libs web").

## O que foi feito
- `npx expo install react-dom react-native-web @expo/metro-runtime -- --legacy-peer-deps`:
  - react-dom 19.3.0;
  - react-native-web 0.21.4;
  - @expo/metro-runtime 58.0.17.
- Servidor: `npx expo start --web --port 8082`.
  - A 8081 continua ocupada pelo servidor `--lan` antigo (pid 7804). O Claude Code bloqueou encerrar esse processo.
- Verificação:
  - a página HTML responde em `http://localhost:8082`;
  - bundle web compilado (3.222 módulos, HTTP 200);
  - `tsc` OK, `eslint` OK.

## Observações
- No SIMULATOR ONGAM, apontar para `http://localhost:8082`. **Não** usar `127.0.0.1:8081`, que é o manifesto nativo.
- A versão web é uma aproximação do app nativo: serve para revisar layout, cores, textos e navegação. A validação final continua no Expo Go.
- Para liberar a 8081: fechar o processo antigo (Gerenciador de Tarefas → node.exe) ou reiniciar o VS Code.
