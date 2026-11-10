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
- **Nunca entrega maior que o original.** Se não ficar menor, o original é mantido (`mantida`).
- **Sem metadados.** EXIF e GPS saem (o local exato da propriedade não pode vazar). A orientação da câmera é aplicada antes.
- **Vetoriais** (SVG, PDF) ficam como estão. **RAW de foto, R3D, BRAW, ARI e CRM** sem leitor: o original é mantido.
- Formatos aceitos e limites vêm de `@agrodireto/dominio` (a mesma fonte do app).

## Resultado

Cada arquivo termina em `pronta`, `mantida` ou `falhou`, com os tamanhos antes e depois, as notas de qualidade e o motivo.

## Rodar

```
npm install                      # na raiz do repositório
npm test -w @agrodireto/midia-worker
npm run otimizar -w @agrodireto/midia-worker -- caminho/foto.heic ./saida
npm start -w @agrodireto/midia-worker           # servidor (precisa das variáveis do .env.example)
```

Vídeo precisa do `ffmpeg` e do `ffprobe` no PATH, com libx265 e libvmaf (a imagem Docker já traz). Sem eles, os testes de vídeo com FFmpeg real são pulados.

## Servidor

- `GET /saude` — saúde.
- `POST /webhook` — aviso de mídia nova (`Authorization: Bearer WORKER_TOKEN`), corpo `{ midiaId, bucket, caminho, nomeOriginal }`. Responde 202 e processa em segundo plano, com fila (`CONCORRENCIA`).
- O adaptador `src/supabase.ts` grava o otimizado em um caminho exclusivo e confirma a atualização em `midias`. O original é preservado por padrão. Com `APAGAR_ORIGINAL_APOS_OTIMIZAR=true`, a remoção ocorre após a confirmação.
- Com as variáveis do ambiente de desenvolvimento configuradas no worker, `npm run preparar-storage -w @agrodireto/midia-worker` cria ou confirma o bucket privado `midias`. O comando encerra com erro se encontrar um bucket público com o mesmo nome. Políticas de acesso, cotas e upload dependem da integração dos cadastros e lotes.

## O que NÃO foi testado

- O adaptador do Supabase (o banco ainda não existe).
- A imagem Docker (não foi construída nesta máquina).
- O FFmpeg real, a nota VMAF real e o tempo de codificação: os testes de vídeo usam um FFmpeg simulado para a lógica de decisão.
- Upload de arquivos muito grandes: o adaptador usa upload comum; acima de ~50 MB deve passar a usar upload retomável (tus).
