# 007 — Abrir o app no Expo Go (túnel)

**Data:** 2026-11-05
**Status:** Servidor rodando.

## Pedido
Acessar o app no Expo Go para começar o refinamento visual.

## O que foi feito
- Rodei `npx expo start --tunnel` (comando do CLAUDE.md).
- O túnel subiu em `http://c-m241-77e5hz-mw3gv5z11q7wlnx6.on.expo.app` (respondeu HTTP 301).
- No Expo Go, abrir o endereço `exp://c-m241-77e5hz-mw3gv5z11q7wlnx6.on.expo.app`.

## Observações
- O endereço muda a cada vez que o servidor reinicia.
- O servidor roda dentro da sessão do Claude Code. Se a sessão fechar, rode de novo `npx expo start --tunnel` no terminal; o QR code aparece lá.
- O Expo Go precisa ser a versão compatível com o SDK 58 (a da loja, atualizada).

## Incidente
- A primeira tentativa caiu com `Error: Unexpected server response: 409` (conflito no túnel do Expo). Não havia outro servidor rodando.
- A segunda tentativa subiu com um endereço novo, que é o registrado acima. Ficou estável no teste (HTTP 301).
- Se o 409 voltar: pare o servidor, espere alguns segundos e rode `npx expo start --tunnel` de novo.

## Mudança para rede local (LAN)
- A segunda tentativa de túnel também caiu (exit 7). Pedido do usuário: verificar as portas livres e liberar o acesso local.
- **Portas livres:** 8081, 8082, 8083 e 19000–19006. IP no Wi-Fi: `192.168.0.102`. VPN McAfee ativa (`10.0.7.61`).
- **Bloqueio:** o firewall do Windows está ligado e o Wi-Fi está como rede **Pública**. A sessão não é admin.
- A criação automática da regra de firewall foi **bloqueada pelo Claude Code** (enfraquece a segurança). O usuário precisa criá-la como administrador:
  `New-NetFirewallRule -DisplayName 'AgroDireto Expo Metro 8081 (rede local)' -Direction Inbound -Protocol TCP -LocalPort 8081 -RemoteAddress LocalSubnet -Action Allow -Profile Any`
  - Para remover depois: `Remove-NetFirewallRule -DisplayName 'AgroDireto Expo Metro 8081 (rede local)'`
- Servidor iniciado com `npx expo start --lan --port 8081` e respondendo `packager-status:running` em `192.168.0.102:8081`.
- **Endereço no Expo Go:** `exp://192.168.0.102:8081` (o celular precisa estar no mesmo Wi-Fi).
