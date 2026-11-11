# D07 — Conectar seleção a upload persistente

**Frente:** Oferta e mídia, ramo `frente/oferta-midia`.

**Estado:** implementação e verificações locais concluídas. **O ensaio em aparelho não foi feito:** não há aparelho nesta frente; o roteiro está abaixo. A D07 só fica aceita depois dele.

## Pedido e plano aprovado

Aceite: enviar arquivo real, mostrar progresso e status, recuperar depois de reiniciar; nova tentativa não cria mídia duplicada; usar lote ou propriedade reais.

Plano enviado por `maestri ask "Claude Code"` e aprovado. A resposta chegou cortada, sem resposta às duas perguntas; segui o que propus:
- **(a) Escopo:** só a mídia da **propriedade** (tela 05) vai para `midias`. O lote continua em `evidencias_lote`.
- **(b) Visibilidade e drone:** o seletor de visibilidade saiu e o drone é guardado como vídeo, sem migration.

Condições do Maestro:
1. A tela 05 deixa de usar dados de demonstração.
2. O caminho `evidencias_lote`/`EvidenciasPublicadas` da D08 fica intacto.
3. Confirmar no teste que a URL de envio só sai para o autor com reserva pendente.
4. Vídeo acima de 6 MiB entra no roteiro de ensaio em aparelho.

## O que foi feito

- **`apps/agricultor/lib/midiasRemotas.ts` (novo):**
  - **Fila local por conta:** fica no AsyncStorage (`@agrodireto/agricultor/midias-pendentes/v1/<conta>`). O arquivo é copiado para a pasta do app antes de qualquer rede, e as gravações da fila são feitas uma de cada vez.
  - **Envio:**
    1. `reservar_midia`;
    2. `confirmar_midia` (se o arquivo já subiu numa tentativa anterior, só confirma);
    3. `createSignedUploadUrl`;
    4. PUT do arquivo;
    5. `confirmar_midia`.

    `enviada` ou `recusada` tira a mídia da fila e apaga a cópia local. Qualquer falha a mantém na fila com o motivo.
  - **Também:** listagem de `midias` por propriedade e links temporários de 10 minutos para as prévias (usa a cópia sem metadados quando existe).
- **`lote/arquivosEvidencia.ts` e `.web.ts`:**
  - Ganharam só `enviarArquivoLocal`. No aparelho, o PUT sai de `File.upload` do `expo-file-system` 58: o arquivo vai direto do disco, com progresso, sem carregar na memória e sem o limite de 6 MiB. No navegador, `fetch` com o Blob do IndexedDB, sem progresso intermediário.
  - As funções que `EvidenciasPublicadas`/`evidenciasRemotas` usam não mudaram (condição 2).
- **Tela 05 (`FotosVideosScreen.tsx`):**
  - Sem dados de demonstração (condição 1); `useMidias`/`useAgricultor` saíram desta tela.
  - Propriedade real (`lerPropriedades`), com escolha quando há mais de uma. Aviso quando não há propriedade cadastrada ou quando a leitura falha; lista vazia quando não há mídia.
  - A lista junta o que está no servidor e o que está na fila do aparelho; enquanto o envio não for confirmado, vale a cópia do aparelho.
  - Barra "Enviando… N%" real.
  - Etiquetas: "Privada", "Na fila de envio", "Enviando", "Falha no envio" (com o motivo e "Tentar de novo"), "Recusada", "Envio não concluído" (reserva sem confirmação, por exemplo de outro aparelho) e o status de processamento com o motivo do worker.
  - O botão do rodapé envia toda a fila, uma mídia por vez. O X só aparece em mídia que ainda está na fila.
- **`components/MidiaPreview.tsx`:** aceita só `tipo`, `uri` e `duracaoSeg`; sem `uri`, mostra a ilustração.
- **README da tela 05:** atualizado.
- **`supabase/tests/midias_privadas.sql` (condição 3):**
  - Novo caso: **membro da organização que não é o autor** não consegue inserir no caminho reservado de outro.
  - Os casos que já existiam continuam: terceiro, caminho sem reserva e caminho já confirmado.
  - O `createSignedUploadUrl` do Storage passa por essa mesma policy de insert (`midias_storage_envio`), então a URL só sai para o autor com reserva pendente.

## Verificação

- `npx tsc --noEmit -p apps/agricultor` e `npm run typecheck` (todos os workspaces): passaram.
  - Neste worktree, os tipos de rota gerados (`.expo/types/router.d.ts`, fora do git) estavam desatualizados para rotas que vieram da main (`/perfil/organizacao`, `/recuperar-acesso`).
  - Regenerei subindo o Metro por alguns segundos em cada app. Nenhum arquivo versionado mudou.
- `npx eslint .`: passou.
- `npm test`: **Agricultor 18, domínio 18 e worker 44, todos passando.**
- `apps/agricultor/test/midiasRemotas.test.cjs` (novo, 6 testes, módulo real com armazenamento, sessão, arquivos e Supabase simulados):
  - fila gravada antes da rede, queda no meio do PUT, reinício do app e nova tentativa com uma única reserva; a cópia local é apagada depois da confirmação;
  - rede caindo entre o PUT e a confirmação: a nova tentativa só confirma e não sobe de novo;
  - outra conta não recebe URL para a reserva pendente do autor;
  - arquivo acima do limite volta como recusado e sai da fila;
  - filas separadas por conta e arquivo que não copia fica fora da fila;
  - adições simultâneas não se perdem.
- Exportação web (`expo export --platform web`): gerou `dist/d07` sem erro de bundle.
- `git diff --check`: passou.
- **Não executados:** `midias_privadas.sql` com o caso novo (Maestro) e o ensaio em aparelho (abaixo).

## Roteiro de ensaio em aparelho (Expo Go, conta de produtor com propriedade enviada)

1. **Foto pela câmera:** Fotos e vídeos → Foto → Tirar foto. A foto aparece com "Na fila de envio". Tocar em "Enviar mídia": a barra sobe até 100% e o status vira "Aguardando otimização".
2. **Vídeo acima de 6 MiB (caso que motivou a tarefa, condição 4):**
   - Vídeo → Escolher da galeria → um vídeo de 10 a 45 MB e até 60 s. Enviar: a barra avança aos poucos, sem travar a tela, e termina em "Aguardando otimização".
   - Repetir com um vídeo acima de 50 MB, que deve aparecer como recusado.
   - Repetir com um vídeo de mais de 60 s: o envio passa, e depois o worker marca "Falha na otimização" com o motivo do limite de 60 s.
3. **Rede interrompida:** começar o envio de um vídeo grande e ligar o modo avião no meio. Deve aparecer "Falha no envio" com "Tentar de novo".
4. **Reinício:** fechar o app à força, reabrir, entrar em Fotos e vídeos. O item continua na fila, com a prévia. Desligar o modo avião e tocar em "Tentar de novo": termina sem criar outra mídia.
5. **Backend (alguém com acesso ao `agro`):**
   - conferir em `midias` uma linha por arquivo, com `enviada_em` e `tamanho_original_bytes` preenchidos e o caminho `org/propriedade/<id>/<chave>.<ext>`;
   - conferir em `storage.objects` (bucket `midias`) o objeto;
   - nenhuma linha duplicada para a mesma `chave`.
6. **Outra conta da mesma organização:** abrir a tela e ver as mesmas mídias, sem o X.

## Arquivos

- Novos: `apps/agricultor/lib/midiasRemotas.ts`, `apps/agricultor/test/midiasRemotas.test.cjs`.
- Alterados:
  - `apps/agricultor/screens/05-fotos-videos/FotosVideosScreen.tsx` e `README.md`;
  - `apps/agricultor/components/MidiaPreview.tsx`;
  - `apps/agricultor/lote/arquivosEvidencia.ts` e `.web.ts`;
  - `supabase/tests/midias_privadas.sql`.
- Sem migration e sem dependência nova. Não alterados: `tasks/todo.md`, `memoria.md`, `DOC/README.md` e `packages/*`.

## Decisões fora do pedido e limites

- **Escopo e visibilidade:** as perguntas (a) e (b) ficaram sem resposta e segui a proposta. O lote continua em `evidencias_lote` até a consolidação na D08. Não existe mais seletor de visibilidade: toda mídia é privada.
  - **Decisão do Maestro (11/11, ao juntar):** aceitas as três escolhas (lote em `evidencias_lote`, drone como vídeo, tudo privado por enquanto). O seletor de visibilidade do mockup da tela 05 **volta quando a D08 definir o que o comprador vê**.
- **Envio só por ação do usuário:** é o botão do rodapé ou "Tentar de novo". Não há envio em segundo plano, por timer nem ao reconectar, como na D02. A sessão em segundo plano do iOS pode continuar o PUT, mas a confirmação só acontece na próxima ação do usuário.
- **Remover da fila não desfaz a reserva no servidor:** a reserva continua contando na cota até a retenção, porque não há RPC de descarte de mídia. Para remover mídia já enviada, também falta RPC; ficou fora do escopo.
- **Drone vira vídeo:** a opção "Vídeo de drone" continua no menu, mas grava como vídeo. Não há coluna para essa marca.
- **Textos do limite:** os campos de envio mostram "20 MB" por foto e "50 MB e 60 s" por vídeo (limites da D03).
- **`useMidias`/`useAgricultor`:** continuam em `hooks/dados.ts` porque a tela 45 (perfil público) ainda usa `useMidias` com dados de demonstração. Não mexi nela, por estar fora do escopo, mas ela também viola a regra de "sem dados de demonstração".
- **Web:** sem progresso intermediário (0 → 100%).
- **Formatos sem prévia no aparelho (HEIC, RAW etc.):** podem aparecer em branco antes da otimização. Depois dela, a prévia usa o WebP.
