# midia-worker

Serviço que **otimiza automaticamente** as fotos e os vídeos que os usuários enviam: reduz o tamanho **sem diminuir a resolução** e confere a qualidade antes de entregar. Roda fora do Supabase porque codificar vídeo é pesado demais para uma Edge Function.

> Decisão registrada: o CLAUDE.md dizia "backend é só Supabase, sem servidor próprio". Este worker é a exceção aprovada pelo usuário em 2026-11-06 (ver `DOC/2026-11-05_013_...`).

## O que cada repositório faz aqui

| Repositório | Papel |
|---|---|
| **sharp / libvips** | Imagens: lê o arquivo, aplica a orientação da câmera e grava WebP |
| **FFmpeg** | Vídeos: decodifica quase todos os contêineres e codecs da lista e recodifica |
| **x265 (H.265)** · **SVT-AV1** | Codificadores de vídeo (`CODEC_VIDEO=hevc` é o padrão; `av1` é opcional) |
| **VMAF** | Nota de qualidade 0–100 entre o original e o vídeo otimizado. Mínimo 95 |

## Regras (todas testadas)

- **Resolução nunca diminui.** Vídeo: sem filtro de escala e com `-fps_mode passthrough`. Imagem: mesmas dimensões; acima de 16383 px (limite do WebP) o original é mantido.
- **Qualidade é conferida.** Imagem: PSNR ≥ 38 dB contra o original, senão sobe a qualidade e por fim usa WebP sem perda. Vídeo: VMAF ≥ 95, senão baixa o CRF (menos compressão) e tenta de novo, até 3 vezes.
- **Sanitizar é obrigatório; comprimir, não.** EXIF e GPS saem sempre (o local exato da propriedade não pode vazar), e a orientação da câmera é aplicada antes. A compressão só é usada se ficar menor. Sem ganho, a foto vira WebP sem perda e o vídeo é reempacotado sem recodificar, só com a 1ª faixa de vídeo e a 1ª de áudio. As duas cópias saem sem metadados e podem ficar maiores que o original.
- **O que não dá para sanitizar fica privado** (`mantida`): vetoriais (SVG, PDF), imagens acima de 16383 px, **RAW de foto, R3D, BRAW, ARI e CRM** sem leitor, e vídeo cuja cópia falha. O original pode ter GPS e nunca é publicado.
- Formatos aceitos e limites vêm de `@agrodireto/dominio` (a mesma fonte do app).

## Resultado

Cada arquivo termina em `pronta` (cópia sem metadados em `arquivo_publicado`), `mantida` (privada) ou `falhou`, com os tamanhos antes e depois, as notas de qualidade e o motivo.

## Rodar

```
npm install                      # na raiz do repositório
npm test -w @agrodireto/midia-worker
npm run otimizar -w @agrodireto/midia-worker -- caminho/foto.heic ./saida
npm run otimizar -w @agrodireto/midia-worker -- --copia-foto caminho/foto.jpg ./saida
npm start -w @agrodireto/midia-worker           # servidor (precisa das variáveis do .env.example)
```

Vídeo precisa do `ffmpeg` e do `ffprobe` no PATH, com libx265 e libvmaf (a imagem Docker já traz). Sem eles, os testes de vídeo com FFmpeg real são pulados.

`--copia-foto` prepara um WebP sem perda e sem EXIF, XMP ou IPTC a partir de JPEG, PNG ou WebP estático, até 6 MiB e 16 megapixels. A cópia pode ficar maior. O comando preserva o original e recusa sobrescrever uma cópia existente. Ele roda localmente, sem publicar no catálogo.

## Preparar foto para o catálogo

No detalhe do lote, o produtor compartilha a foto depois da aprovação da equipe. Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente privado do worker e execute na raiz.

```sh
npm run preparar-foto-catalogo -w @agrodireto/midia-worker -- --pendentes
npm run preparar-foto-catalogo -w @agrodireto/midia-worker -- <uuid-do-lote> <chave-da-foto>
```

O modo `--pendentes` percorre as fotos aprovadas e autorizadas que ainda precisam de cópia. Uma falha é informada com a chave da foto, e as seguintes são processadas. O comando sai com código 1 se houver alguma falha. Na próxima execução, as cópias registradas são ignoradas e as fotos ainda pendentes podem ser tentadas novamente.

O modo individual retorna o caminho no bucket privado `fotos-catalogo`, inclusive quando a cópia já está registrada.

## Servidor

- `GET /saude` — saúde.
- `POST /webhook` — aviso de mídia nova (`Authorization: Bearer WORKER_TOKEN`), corpo JSON qualquer. Responde 202.
- **A fila mora no banco** (`supabase/migrations/20261111090000_midias_fila.sql`). A linha em `midias` nasce `aguardando` e é o registro durável. O aviso só faz o worker conferir a fila na hora. Ele também confere ao subir e a cada `INTERVALO_FILA_SEG`.
- O worker assume uma mídia por vez com `assumir_proxima_midia`, até `CONCORRENCIA`. Se cair, a mídia volta à fila quando vence o prazo (`PRAZO_TRABALHO_MIN` + 5 min). `falhou` é tentado de novo após 5 min, até 3 tentativas.
- Cada execução só grava se a linha ainda estiver na tentativa dela. Uma execução antiga não sobrescreve a nova, e o arquivo que ela enviou é removido.
- Ao fim de `PRAZO_TRABALHO_MIN`, o FFmpeg é encerrado e a mídia fica `falhou`.
- O otimizado vai para um caminho exclusivo, e o original é preservado por padrão. Com `APAGAR_ORIGINAL_APOS_OTIMIZAR=true`, a remoção ocorre após a confirmação. A linha continua apontando para o original removido.
- Com as variáveis do ambiente de desenvolvimento configuradas no worker, `npm run preparar-storage -w @agrodireto/midia-worker` cria ou confirma o bucket privado `midias`. O comando encerra com erro se encontrar um bucket público com o mesmo nome. Políticas de acesso, cotas e upload dependem da integração dos cadastros e lotes.

## O que NÃO foi testado

- A migration da fila e o adaptador contra um Supabase real: os testes usam um PostgREST simulado, e o teste SQL (`supabase/tests/midias_fila.sql`) não rodou nesta máquina, que não tem Postgres.
- Quem cria a linha em `midias` e o envio pelo app (D07). Também falta o reprocessamento pela equipe, que precisa voltar a linha para `aguardando` e zerar as tentativas.
- A imagem Docker (não foi construída nesta máquina).
- O FFmpeg real, a nota VMAF real e o tempo de codificação: os testes de vídeo usam um FFmpeg simulado para a lógica de decisão.
- Upload de arquivos muito grandes: o adaptador usa upload comum; acima de ~50 MB deve passar a usar upload retomável (tus).
