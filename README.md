# AgroDireto

Monorepo dos apps Agricultor, Cliente, Logística e Administrador, com componentes compartilhados e um worker de mídia.

Use Node.js 24.15.0 (veja `.nvmrc`). Na raiz:

```sh
npm ci --no-audit --no-fund
npm run verify
```

`verify` checa tipos, lint, testes e exporta os quatro apps web para uma pasta temporária. Os testes informam se o caso de FFmpeg real foi executado ou pulado; ele requer `ffmpeg` com `libx265` e `libvmaf`, além de `ffprobe`. As checagens de interface não exigem credenciais.

Para rodar a interface do Agricultor: `npm run web -w @agrodireto/agricultor`. Substitua o nome do workspace para abrir outro perfil.

- [Ambientes e configuração](DOC/ambientes.md)
- [Recorte do piloto](DOC/piloto.md)
- [Plano e backlog](tasks/plan.md)
