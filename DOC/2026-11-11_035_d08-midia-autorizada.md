# D08 — Validar e exibir mídia autorizada

**Frente:** Oferta e mídia, ramo `frente/oferta-midia`. Duas entregas, com commits separados.

**Estado:**
- **Entrega 1** (backend, worker e Administrador): concluída no ramo. O SQL ainda não foi executado; o Maestro aplica e roda no `agro`.
- **Entrega 2** (Agricultor e Cliente): concluída no ramo. Não tem SQL próprio; depende da migration da Entrega 1.

## Pedido e plano aprovado

Aceite: o Administrador valida ou rejeita; o comprador vê a mídia permitida com o status correto e reprodução compatível com os aparelhos do piloto. Verificação: pendência aparece como "Não verificado"; rejeitada ou privada não vaza; links expiram; testar vídeo real e falha de reprodução.

O ponto de partida: o fluxo de **foto** do lote já existia de ponta a ponta. Faltavam o **vídeo** e um teste SQL do catálogo.

Plano aprovado pelo Maestro. A mensagem chegou cortada e as perguntas (a) a (d) ficaram sem resposta, então segui as propostas:
- **(a)** O comprador vê só mídia aprovada e autorizada. "Não verificado" é uma etiqueta do detalhe da oferta enquanto o lote não tem mídia aprovada (Entrega 2).
- **(b)** O vídeo abre no player do sistema (`Linking`), sem biblioteca nova.
- **(c)** A mídia da propriedade (`midias`) continua privada nesta tarefa.
- **(d)** A Entrega 1 toca só a tela 06 e `lib/evidencias.ts` do Administrador.

Ajustes do Maestro:
1. **O link de vídeo não pode durar 60 s:** o player busca o vídeo por partes enquanto toca, e um link vencido quebra a reprodução. Por isso o link de vídeo dura **15 minutos (900 s)** e o de foto continua com 60 s. Aplicado na revisão do Administrador (Entrega 1) e no Cliente (Entrega 2). O link de vídeo só é gerado quando a pessoa toca em "Assistir".
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

## Entrega 2 — Agricultor e Cliente

### Agricultor (`lote/EvidenciasPublicadas.tsx`)

- A evidência aprovada pela equipe, **foto ou vídeo**, pode ser autorizada e retirada do catálogo ("Autorizar vídeo no catálogo" / "Retirar vídeo do catálogo").
- O aviso de cópia disponível ou aguardando preparo vale para os dois tipos.
- Nenhuma outra mudança no fluxo de `evidencias_lote`.

### Cliente (`components/FotosCatalogo.tsx`, usado no detalhe da oferta)

- **Galeria "Fotos e vídeos do lote":** só mostra o que `listar_fotos_catalogo` devolve (aprovado pela equipe e autorizado pelo produtor, com oferta vigente). Pendente, rejeitado ou privado nunca chega ao app.
- **Foto:** link de 60 s, como antes.
- **Vídeo:**
  - botão "Assistir vídeo N" que gera o link de **15 min** no toque e abre no player do sistema;
  - se o link não sair ou o player não abrir: "Não foi possível abrir o vídeo." e "Recarregar".
- **"Não verificado" (pergunta (a)):** quando o lote não tem nenhuma foto ou vídeo verificado e autorizado, aparece a etiqueta "Não verificado" com o texto "Este lote ainda não tem fotos ou vídeos verificados pela equipe AgroDireto."
- **Erros:** se a lista falhar ou alguma foto não carregar, aparece a mensagem e o botão "Recarregar".

### Verificação da Entrega 2

- `npx tsc --noEmit -p apps/cliente` e `-p apps/agricultor`, `npm run typecheck` (todos os workspaces) e `npx eslint .`: passaram.
- `npm test`: todos passando (Agricultor 18, domínio 18, worker 46 e os demais pacotes).
- Exportação web do Cliente (`expo export --platform web`): gerou `dist/d08` sem erro de bundle.
- `git diff --check`: passou.
- O Cliente não tem testes automáticos. A regra do que o comprador vê é do banco e está coberta por `catalogo_midias.sql`.

### Limites da Entrega 2

- **Falha de reprodução depois que o player abre não é detectada** (pergunta (b), sem `expo-video`). O app só percebe a falha ao gerar o link ou ao abrir o player. Por isso a cópia é sempre H.264 + AAC + faststart, que tem a maior compatibilidade.
- **Sem miniatura de vídeo:** o vídeo aparece como botão. A miniatura exigiria o worker gerar um quadro (ponto de evolução).
- **A mídia da propriedade (`midias`) continua privada** (pergunta (c)). O seletor de visibilidade da tela 05 do Agricultor volta quando houver decisão sobre o que o comprador vê da propriedade.

## Roteiro da jornada com sessões reais (Admin, Agricultor, worker e Cliente)

Pré-requisitos:
- migrations aplicadas no `agro`, até `20261111220000`;
- catálogo de homologação habilitado;
- uma conta de produtor com propriedade aprovada e oferta publicada;
- uma conta de comprador autorizada;
- uma conta da equipe com papel `geral` ou `cadastral` e MFA.

1. **Agricultor:** no detalhe do lote publicado, enviar uma foto (JPG) e um vídeo (MP4 ou MOV de até 6 MiB e até 60 s), depois tocar em "Enviar à equipe para revisão" nos dois.
2. **Comprador:** abrir a oferta. Deve aparecer "Não verificado" e nenhuma mídia.
3. **Administrador (tela 06):**
   - a foto mostra prévia; o vídeo abre em "Assistir vídeo";
   - aprovar a foto e o vídeo;
   - com uma terceira evidência, rejeitar com motivo.
4. **Agricultor:** "Autorizar foto no catálogo" e "Autorizar vídeo no catálogo". A evidência rejeitada mostra o motivo e não tem o botão.
5. **Worker:** `npm run preparar-foto-catalogo -- --pendentes`. Deve gerar `lote/chave.webp` e `lote/chave.mp4` em `fotos-catalogo`.
6. **Comprador (aparelhos do piloto, Android e iPhone):**
   - abrir a oferta: a foto aparece e "Assistir vídeo 1" toca no player do sistema;
   - deixar o vídeo tocando e voltar a ele depois de 2 minutos: deve continuar tocando, porque o link dura 15 min;
   - a rejeitada nunca aparece.
7. **Revogação:** o produtor retira o vídeo do catálogo; o comprador recarrega e o vídeo some. Um link já aberto continua válido até expirar (no máximo 15 min); depois disso, o vídeo não abre mais.
8. **Falha de reprodução:** em modo avião, tocar em "Assistir vídeo" deve mostrar "Não foi possível abrir o vídeo."
