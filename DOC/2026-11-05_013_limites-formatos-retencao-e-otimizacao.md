# 013 — Limites, formatos, retenção e otimização automática de mídia

**Data:** 2026-11-05
**Status:** Concluído, com partes ainda não testadas (listadas abaixo). tsc ✅ · eslint ✅ · 41 testes passam (15 do contrato, 26 do worker).

## Pedido (parâmetros dados pelo usuário)
- Até **100 imagens e 100 vídeos por produto**.
- Quando a produção terminar, as mídias são **apagadas do banco** (sem acumular itens sem uso).
- **52 formatos de imagem e 37 de vídeo** (mais 20 codecs) aceitos.
- Escolher, entre 8 repositórios, os que servem para **reduzir o peso sem perder a resolução, de forma automática**, no momento do envio.

## O que foi feito
- **Aprovação do `expo-image-picker`:** instalado (versão 58.0.10) e configurado em `apps/agricultor/app.json` (permissões de galeria, câmera e microfone em português).
- **`@agrodireto/dominio`:** `formatos.ts` (as duas listas e `classificarArquivo`), limites (`LIMITES_MIDIA`, `validarNovasMidias`), retenção (`RETENCAO_DIAS_APOS_ENCERRAMENTO`, `calcularExpiracao`), estado de otimização e tamanhos na mídia.
- **Agricultor:**
  - 05 Fotos e vídeos: galeria com seleção múltipla, câmera, vídeo de drone, contadores, lista de formatos aceitos e aviso dos arquivos recusados.
  - 12 Padrão do lote: evidências reais (fotos e vídeos, até 100 de cada) e a nota "apagadas 30 dias depois do encerramento".
  - 30 Cadastrar cultura: foto real da cultura, com validação de formato.
  - Prévia real das fotos; vídeo mostra a ilustração (a miniatura vem do processamento).
- **Análise dos repositórios e regra de retenção:** `DOC/midias-compartilhadas.md`.

## Decisões do usuário (2026-11-06)
- **Onde roda a otimização:** worker próprio (exceção à regra "sem servidor próprio" do CLAUDE.md).
- **Codec de saída do vídeo:** deixado para mim. Escolhi **H.265 (HEVC)**, com AV1 (SVT-AV1) opcional por configuração.
- **Carência de apagamento:** 30 dias.

## Worker de otimização (`services/midia-worker`)
- **Imagens (sharp/libvips):** WebP na mesma resolução, orientação da câmera aplicada, EXIF e GPS removidos. Confere o PSNR (mínimo 38 dB); se não passar, sobe a qualidade e por fim usa WebP sem perda. Vetoriais (SVG, PDF) e formatos sem leitor ficam como vieram.
- **Vídeos (FFmpeg + x265/SVT-AV1):** recodifica sem mudar resolução nem taxa de quadros, sem metadados. Mede o **VMAF**; abaixo de 95, baixa o CRF e tenta de novo (até 3 vezes). Se nada servir, mantém o original.
- **Nunca entrega maior que o original.**
- Fila com concorrência configurável, servidor com `/saude` e `/webhook` (token), adaptador do Supabase (baixa, otimiza, sobe, atualiza a tabela e apaga o original), `Dockerfile` que falha o build se o FFmpeg não tiver x265, SVT-AV1 e VMAF.

## Verificação
- `tsc --noEmit` em todos os apps e pacotes: OK. `eslint`: OK.
- **Contrato (`@agrodireto/dominio`): 15 testes passam** — os 52 formatos de imagem e os 37 de vídeo, o limite de 100 (a 101ª foto é recusada e o vídeo ainda cabe), o apagamento 30 dias depois e a visibilidade por app.
- **Worker: 26 testes passam**, executando o código de verdade:
  - imagem: JPEG vira WebP menor, na mesma resolução, com PSNR acima do mínimo; EXIF removido; orientação da câmera respeitada; PNG com transparência preservada; SVG e RAW mantidos; nunca maior que o original;
  - vídeo (com FFmpeg simulado): CRF padrão, nova tentativa com CRF menor, recusa quando o VMAF não chega, nada de lixo no disco, formato sem decodificador mantido;
  - servidor: saúde, token (401), corpo inválido (400) e aceite (202).
- **Não verificado (precisa de outro ambiente):**
  - a abertura real da câmera e da galeria (precisa de um aparelho);
  - o **FFmpeg de verdade**, a nota VMAF real e o tempo de codificação (não há FFmpeg nesta máquina);
  - a **imagem Docker** (não foi construída: exige baixar a imagem base do Node e o FFmpeg do Debian);
  - o **adaptador do Supabase** (o banco ainda não existe);
  - o envio retomável (tus) do app ao Storage.

## Decisões fora do pedido
1. **"Por produto" = por escopo:** o limite de 100 vale para cada lote, cada cultura e a propriedade, separadamente.
2. **Mídia da propriedade não expira**, só a de lote e de cultura.
3. **Sem recompressão no aparelho:** o app manda o original e a otimização acontece no servidor, para não degradar duas vezes.
4. **EXIF e GPS são removidos** das fotos e dos vídeos: o local exato da propriedade não pode vazar (o app só mostra "cidade · UF").
5. **Foto em WebP** (não AVIF), por compatibilidade com os celulares.
6. **Original apagado depois de otimizar** (configurável): é o que evita acumular volume. A trava de qualidade (PSNR e VMAF) é o que torna isso seguro.
7. **R3D, BRAW, ARI e CRM** (câmeras de cinema) e **RAW de foto** são aceitos, mas ficam como vieram (sem leitor).
8. **Squoosh e ffmpeg.wasm não são usados** no celular (só rodam em navegador).
9. **`@agrodireto/dominio` virou módulo ES** (`type: module`, imports com `.ts`), para o servidor usar exatamente as mesmas regras do app.

## Pendências
- **Autorizar** a construção da imagem Docker e um teste com FFmpeg real (baixa a imagem base do Node, cerca de 250 MB, e o FFmpeg do Debian, cerca de 150 MB).
- Hospedagem do worker e criação do banco, do Storage e do webhook (fase do Supabase).
- Envio retomável com tus-js-client no app, com limites de tamanho do arquivo.
- Tarefa diária de apagamento (pg_cron + Edge Function).
- Mostrar no app o resultado da otimização (tamanho antes e depois) e os arquivos "Original mantido".
- Sugestão para o CLAUDE.md (não editei): registrar a exceção do worker na decisão de arquitetura "Backend é só Supabase".
