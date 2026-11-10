# Mídias compartilhadas entre os apps

Foto, vídeo e drone são **uma entidade só**, usada pelos quatro apps. O contrato (tipos, rótulos e regra de visibilidade) está em `packages/dominio/midia.ts` (`@agrodireto/dominio`) e é importado por qualquer app.

## Quem faz o quê

| App | Papel na mídia |
|---|---|
| **Agricultor** | Envia foto e vídeo (tela 05, e a foto da cultura na tela 30). Escolhe a visibilidade. Vê tudo o que enviou |
| **Administrador** | Valida ou rejeita (tela 06 · Documentos e mídias). Vê tudo |
| **Cliente** | Vê a mídia da propriedade e do lote conforme a visibilidade (tela Fornecedor e Detalhe da oferta). Mídia ainda não validada aparece com a etiqueta "Não verificado" |
| **Logística** | Não vê mídia da propriedade. Tem as próprias evidências de coleta e entrega (outra entidade, com o mesmo padrão de Storage) |

## Fluxo

```
Agricultor envia ──► status "pendente" ──► Administrador valida ──► "verificada"
                                                  └──► rejeita ──► "rejeitada" (some para o Cliente)
Cliente: pendente e verificada aparecem se a visibilidade permitir; rejeitada nunca.
```

## Regra de visibilidade (`podeVerMidia`)

| Visibilidade | Agricultor (dono) | Administrador | Cliente |
|---|---|---|---|
| Privado | vê | vê | não vê |
| Compradores aprovados | vê | vê | vê só se o comprador foi aprovado |
| Público na plataforma | vê | vê | vê |

Mídia **rejeitada** nunca aparece para o Cliente. A Logística nunca vê mídia da propriedade.

## O que já existe

- Contrato em `packages/dominio` (tipos, rótulos, `podeVerMidia`, `podeValidarMidia`, `formatarDuracao`, `dataCurta`).
- **Agricultor:** tela 05 com campos de envio de Foto e de Vídeo (inclui drone), lista "Mídias da propriedade", visibilidade por mídia e aviso de compartilhamento. A prévia do perfil público (tela 45) usa a mesma regra do Cliente.
- A foto da cultura (tela 30) é uma mídia de escopo "cultura" e vira o ícone da cultura.

## O que falta para funcionar de verdade

1. **Captura e envio do arquivo:** biblioteca `expo-image-picker` (aprovação pendente) e envio para o Storage.
2. **Servidor (Supabase):** é lá que a regra de visibilidade vale de verdade. O app nunca é a barreira de segurança.
3. **Apps Administrador e Cliente** passam a consumir o contrato quando forem refinados.

## Proposta para o Supabase (referência, não implementado)

Tabela `midias`:

| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | |
| escopo_tipo / escopo_id | text / uuid | propriedade, lote ou cultura |
| tipo | text | foto, video, drone |
| arquivo | text | caminho no Storage |
| duracao_seg | int | só vídeo e drone |
| capturada_em | date | |
| autor_id | uuid | agricultor que enviou |
| local_aproximado | text | cidade · UF, nunca o endereço exato |
| status | text | pendente, verificada, rejeitada |
| visibilidade | text | privado, aprovados, publico |
| motivo_rejeicao | text | |
| criada_em | timestamptz | |

Armazenamento: bucket privado `midias`, pasta `{propriedade_id}/{id}`. O app lê por **URL assinada**, gerada por Edge Function depois de checar a regra acima.
Políticas de acesso (RLS): o dono lê e insere; só o Administrador altera `status`; o Cliente lê conforme `visibilidade` e `status`.
A mudança de status é feita por Edge Function, que também grava a Auditoria e avisa o Agricultor.

---

# Limites, formatos, retenção e otimização automática

## Limites e formatos (regras do negócio, implementadas em `@agrodireto/dominio`)

- **Até 100 fotos e até 100 vídeos por produto** (lote, cultura ou propriedade). Drone conta como vídeo.
- Formatos aceitos: **52 de imagem** e **37 de vídeo** (mais 20 codecs), conforme a lista do negócio. A lista completa está em `packages/dominio/formatos.ts`. O app descobre o tipo pela extensão e, se ela faltar, pelo MIME.
- Arquivo fora da lista, ou acima do limite, é recusado na hora com o motivo (aviso vermelho na tela).
- Testado: os 52 + 37 formatos são reconhecidos, o limite de 100 vale, e extensões inválidas são recusadas.
- Os limites e as listas **também precisam ser aplicados no servidor** (o app nunca é a barreira).

## Retenção: apagar o que não serve mais

- Quando a produção é **encerrada**, as mídias do **lote** e da **cultura** são apagadas do banco e do Storage.
- **Carência de 30 dias** depois do encerramento (valor provisório, `RETENCAO_DIAS_APOS_ENCERRAMENTO`), para resolver disputas e devoluções. O app avisa isso em cada tela.
- A mídia da **propriedade** (perfil) **não expira**: é institucional e fica enquanto a conta existir.
- Cada mídia de lote ou cultura recebe `expira_em = encerramento + carência`.
- Execução no Supabase: uma tarefa agendada (`pg_cron`) chama uma Edge Function todo dia. A função apaga os arquivos do Storage das mídias vencidas, depois as linhas da tabela, e grava a Auditoria. Se o lote for reaberto antes do prazo, `expira_em` é limpo.

## Otimização automática: o que cada repositório faz

| Repositório | Veredito | Para quê |
|---|---|---|
| **sharp** + **libvips** | **Usar** | Motor das **imagens**. Mantém as dimensões e regrava em WebP ou AVIF de alta qualidade (e PNG com compressão sem perda). O libvips, com os leitores extras, cobre a maior parte da lista de formatos |
| **FFmpeg** | **Usar** | Motor dos **vídeos**: lê quase todos os contêineres e codecs da lista e regrava sem mudar a resolução |
| **SVT-AV1** | **Usar** (dentro do FFmpeg) | Codificador AV1: o menor arquivo para a mesma qualidade visual |
| **VMAF** | **Usar** | **Trava de qualidade**: mede a diferença entre o original e o otimizado. Se a nota ficar abaixo do limite (95), o sistema refaz com menos compressão. É o que garante "sem perder qualidade" |
| **tus-js-client** | **Usar no app** | Envio **retomável** de arquivos grandes (o Storage do Supabase aceita o protocolo tus). Importante no campo, onde a internet cai: o envio continua de onde parou |
| **Squoosh** | Só como referência | É um aplicativo web, não uma biblioteca. Seus codecs rodam em WebAssembly no navegador, que o app de celular (Hermes) não tem. Os ajustes dele servem de guia para o sharp |
| **ffmpeg.wasm** | Não usar no celular | Roda só em navegador, é lento e limitado em memória. Pode servir no painel web da equipe, se um dia houver |

### Limites honestos
- Os formatos profissionais de câmera de cinema **R3D (RED), BRAW (Blackmagic), ARI (ARRI) e CRM (Canon)** exigem SDKs proprietários que o FFmpeg não tem. O arquivo é **aceito e guardado como veio**, marcado como "sem otimização".
- RAW de foto (CR2, NEF, ARW, DNG…), PSD, AI, EPS e PDF dependem de leitores extras no libvips; entram na lista de testes do worker.
- Otimizar **não deve aumentar** o arquivo: se o resultado ficar maior ou a nota ficar baixa, mantém-se o original.

## Onde isso roda: worker próprio (decidido em 2026-11-06)

Codificar vídeo é pesado demais para as Edge Functions do Supabase (limite de CPU e de memória, sem FFmpeg). O usuário aprovou um **worker próprio**, o que abre uma **exceção** à regra do CLAUDE.md "backend é só Supabase, sem servidor próprio". O restante da lógica sensível continua nas Edge Functions.

O worker está em `services/midia-worker` (README próprio). Fluxo:

```
App ── envio (tus) ──► Storage (original)
                          │ aviso (webhook, com token)
                          ▼
                     midia-worker ── baixa ─► sharp/libvips (foto) ou FFmpeg (vídeo)
                          │                    └─ confere PSNR (foto) ou VMAF ≥ 95 (vídeo)
                          ├─ sobe o otimizado (WebP ou MP4) em caminho exclusivo
                          └─ confirma `midias` antes da remoção opcional do original
```

Decisões do projeto para a otimização:
- **Vídeo em H.265 (HEVC)** por padrão: bem menor que H.264 e toca em quase todo celular. O AV1 (SVT-AV1) fica como opção por configuração (`CODEC_VIDEO=av1`), porque celulares mais antigos tocam mal.
- **Foto em WebP** (com perda em qualidade alta, conferida por PSNR, ou sem perda). Mesmas dimensões, sem EXIF/GPS.
- Nada é entregue maior que o original; se não ficar menor ou não passar na nota, o original é mantido.

Colunas a mais na tabela `midias`: `processamento` (aguardando, otimizando, pronta, mantida, falhou), `tamanho_original_bytes`, `tamanho_final_bytes`, `motivo_processamento`, `expira_em`.

## O que já está pronto no app

- Seletor real de câmera e galeria (`expo-image-picker`), com seleção múltipla e sem recompressão no aparelho (a qualidade original vai ao envio).
- Contadores `Fotos x/100 · Vídeos y/100`, formatos aceitos na tela, avisos de arquivo recusado.
- Campo `processamento` na mídia (`aguardando`, `otimizando`, `pronta`, `falhou`) e os tamanhos antes e depois, para a tela mostrar o resultado quando o worker existir.
