# D08 — Validar e exibir mídia autorizada

**Frente:** Oferta e mídia, ramo `frente/oferta-midia`. Duas entregas, com commits separados.

**Estado:**
- **Entrega 1** (backend, worker e Administrador): concluída no ramo. O SQL ainda não foi executado; o Maestro aplica e roda no `agro`.
- **Entrega 2** (Agricultor e Cliente): ainda não começou.

## Pedido e plano aprovado

Aceite: o Administrador valida ou rejeita; o comprador vê a mídia permitida com o status correto e reprodução compatível com os aparelhos do piloto. Verificação: pendência aparece como "Não verificado"; rejeitada ou privada não vaza; links expiram; testar vídeo real e falha de reprodução.

O ponto de partida: o fluxo de **foto** do lote já existia de ponta a ponta. Faltavam o **vídeo** e um teste SQL do catálogo.

Plano aprovado pelo Maestro. A mensagem chegou cortada e as perguntas (a) a (d) ficaram sem resposta, então segui as propostas:
- **(a)** O comprador vê só mídia aprovada e autorizada. "Não verificado" é uma etiqueta do detalhe da oferta enquanto o lote não tem mídia aprovada (Entrega 2).
- **(b)** O vídeo abre no player do sistema (`Linking`), sem biblioteca nova.
- **(c)** A mídia da propriedade (`midias`) continua privada nesta tarefa.
- **(d)** A Entrega 1 toca só a tela 06 e `lib/evidencias.ts` do Administrador.

Ajustes do Maestro:
1. **O link de vídeo não pode durar 60 s:** o player busca o vídeo por partes enquanto toca, e um link vencido quebra a reprodução. Por isso o link de vídeo dura **15 minutos (900 s)** e o de foto continua com 60 s. Aplicado na revisão do Administrador (Entrega 1) e aplicado também no Cliente (Entrega 2).
2. **`listar_fotos_catalogo` recriada com as mesmas permissões:** `revoke` de `public`, `anon` e `authenticated` e `grant execute` só para `authenticated`. Conferido no teste SQL, inclusive que não há grant para `PUBLIC`.
3. **`autorizar_foto_catalogo` aceita vídeo** e tem um comentário sobre o nome legado; não foi renomeada.

## Entrega 1 — backend, worker e Administrador

### Migration `supabase/migrations/20261111220000_catalogo_videos.sql`

- **Bucket `fotos-catalogo`:** aceita `image/webp` e `video/mp4`; continua privado.
- **Check `foto_catalogo_caminho`:** a cópia de foto é `lote/chave.webp` e a de vídeo é `lote/chave.mp4`.
- **`autorizar_foto_catalogo`:** a restrição a foto saiu; as outras regras continuam iguais (só a equipe aprova, só o produtor autoriza, oferta não retirada). Mensagem: "Mídia indisponível para compartilhamento."
- **`listar_fotos_catalogo(p_lote)`:** passa a devolver `(arquivo, tipo)`. Foi recriada (drop e create) com as permissões de antes.
- **`agrodireto_privado.pode_ver_foto_catalogo` não mudou.** Ela exige catálogo habilitado, comprador autorizado, mídia aprovada e autorizada, propriedade aprovada e oferta vigente e não retirada.

### Worker

- **`video.ts` — `prepararCopiaVideo` e `argsCopiaCatalogo`:**
  - recodifica em **H.264 8 bits (`yuv420p`) + AAC, com `+faststart`**, o par que toca em qualquer celular e navegador;
  - remove os metadados, os capítulos e as faixas de dados e legenda (onde o drone grava o GPS).
  - Falha com motivo, sem gerar cópia, quando: o vídeo passa de 60 s (duração real, ffprobe), não tem faixa de vídeo ou não há decodificador.
  - O arquivo otimizado da DOC 013 continua em HEVC; o H.264 vale só para a cópia do catálogo.
- **`fotoCatalogo.ts`:**
  - as funções com nome legado ("foto") passam a preparar também vídeo (comentado no código);
  - a extensão do original é conferida por tipo (foto: jpg/png/webp; vídeo: mp4/mov) e a cópia sobe com `video/mp4`;
  - a busca de pendentes deixa de filtrar por `tipo = 'foto'`.
- **`Dockerfile`:** o build também exige `libx264`.
- **Testes:** atualizei o servidor simulado da foto, porque agora ele devolve o `tipo`. Dois testes novos:
  - vídeo acima de 60 s e vídeo sem faixa de vídeo falham sem codificar;
  - **FFmpeg real:** a entrada é HEVC 10 bits com GPS no metadado e uma faixa de legenda com coordenadas. A saída é H.264 `yuv420p` + AAC, só com áudio e vídeo, sem a coordenada, e com o índice (`moov`) antes dos dados.

### Administrador (tela 06, `lib/evidencias.ts`)

- **`linkRevisao`:** gera um link temporário de 60 s para foto e de 15 min para vídeo.
- **Na tela:** a foto selecionada aparece em prévia e o vídeo tem "Assistir vídeo", que abre no player do sistema. Se falhar, aparece a mensagem para baixar.
- O botão "Baixar para revisão" e as RPCs não mudaram.

### Teste SQL `supabase/tests/catalogo_midias.sql` (novo, `begin`/`rollback`)

- **Permissões:** `listar_fotos_catalogo` só para `authenticated`, sem `anon` e sem `PUBLIC`. O bucket aceita vídeo e continua privado. Cópia de vídeo só `.mp4` e de foto só `.webp`.
- **Comprador autorizado:** vê exatamente a foto e o vídeo aprovados e autorizados, com o tipo. No Storage lê só esses dois objetos. Oferta retirada não exibe nada.
- **Usuário sem cadastro de comprador:** não vê nada.
- **Produtor:** não autoriza vídeo pendente nem foto rejeitada. Revogar o vídeo tira da lista e do Storage; autorizar de novo devolve.
- **Equipe:** o papel `comercial` não revisa (`insufficient_privilege`). O papel `cadastral` (`revisar_ofertas`) vê o vídeo pendente na fila e o rejeita, e o rejeitado não aparece ao comprador.
- **Oferta vencida:** some da lista e do Storage.

### Verificação da Entrega 1

- `npm run typecheck` (todos os workspaces) e `npx tsc --noEmit -p apps/administrador`: passaram. Os tipos de rota gerados (`.expo`, fora do git) estavam desatualizados para rotas novas da main e foram regenerados.
- `npx eslint .`: passou.
- `npm test`: todos passando (worker 46, incluindo os 2 novos).
- `git diff --check`: passou.
- **Não executados:**
  - `catalogo_midias.sql` (Maestro);
  - a jornada pelas telas com sessões reais (roteiro no fim deste DOC, completado na Entrega 2);
  - a reprodução do vídeo na revisão em aparelho.

## Decisões fora do pedido e limites (Entrega 1)

- **O bucket continua `fotos-catalogo`,** mesmo guardando vídeo. Renomear exigiria migrar objetos e políticas.
- **Original de vídeo em MOV/HEVC:** na revisão do Administrador, o player de alguns Androids pode não abrir. Nesse caso fica o "Baixar para revisão". A cópia do comprador é sempre H.264.
- **Sem teste do caminho de vídeo em `prepararFotoCatalogo` com o Supabase simulado.** A conversão está coberta pelo teste com FFmpeg real e a escolha do caminho é uma tabela de três linhas. O ensaio com o worker contra o `agro` cobre isso.
- **Vídeo com mais de 60 s aprovado e autorizado fica sem cópia.** A falha aparece no relatório do `preparar-foto-catalogo --pendentes`. O produtor não recebe aviso nesta entrega.
