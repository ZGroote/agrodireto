# Worker de mídia: gravação segura, sanitização e fila recuperável (D04–D06)

## Pedido

Fechar D04, D05 e D06 de `tasks/todo.md` mexendo só no worker, nos tipos de mídia do `dominio` e, como a sessão principal liberou depois, em uma migration nova. O plano foi aprovado com duas decisões:
- entregar a cópia sem metadados mesmo quando ela fica maior que o original;
- implementar a fila no banco já nesta entrega.

Ramo `worker/d04-d06-recuperavel`, em worktree próprio, sem push.

## O que faltava (levantado no código)

- **D04:** a gravação já era segura (caminho exclusivo, `upsert: false`, erros verificados, remoção só após confirmar). Faltavam testes de falha no envio e no download, e o otimizado ficava órfão quando nenhuma linha confirmava.
- **D05:** todo resultado `mantida` deixava o original com EXIF/GPS como o arquivo da mídia.
- **D06:** a fila existia só em memória, o 202 não garantia nada após reinício, e uma queda deixava a mídia em `otimizando` para sempre. Também não havia limite de tempo no FFmpeg. A tabela `midias` não existia em nenhuma migration.

## O que foi feito

- **D04:** quando o banco responde sem ambiguidade que nenhuma linha foi confirmada, o otimizado enviado é removido. Testes novos cobrem falha no download, falha no envio, referência perdida e nomes iguais com extensões diferentes.
- **D05:** se a compressão não ficar menor, a foto vira WebP sem perda e o vídeo é reempacotado sem recodificar. Nos dois casos saem sem metadados. O vídeo leva só a 1ª faixa de vídeo e a 1ª de áudio, o que derruba as faixas de dados e legenda em que drones gravam GPS. O que não dá para sanitizar (vetorial, sem decodificador, acima de 16383 px, cópia que falha) fica `mantida`, com motivo "Fica privada". O comentário de `StatusProcessamento` no `dominio` registra o contrato: `mantida` nunca é publicada.
- **D06, migration:** a `20261111090000_midias_fila.sql` cria `midias` com dois arquivos:
  - `arquivo`: o original, privado;
  - `arquivo_publicado`: a cópia sem metadados, a única publicável, obrigatória quando a mídia está `pronta`.

  A mídia se liga a `ofertas_lote(id)` ou a `propriedades(id)`, exatamente um dos dois. A migration também cria `assumir_proxima_midia(prazo)`, que só o `service_role` executa e que:
  - entrega uma mídia por vez, em ordem de chegada, com `for update skip locked`;
  - retoma `otimizando` com o prazo vencido e tenta `falhou` de novo após 5 min;
  - limita a 3 tentativas e marca as esgotadas como `falhou`.

  O teste `supabase/tests/midias_fila.sql` segue o formato `begin ... rollback`.
- **D06, worker:**
  - O servidor assume trabalho pela fila do banco ao subir, a cada aviso do webhook e a cada `INTERVALO_FILA_SEG`. O corpo do webhook não importa mais.
  - Cada gravação vale só para a tentativa daquela execução.
  - O FFmpeg recebe o sinal de `PRAZO_TRABALHO_MIN` e é encerrado com SIGKILL; a mídia fica `falhou`.

## Arquivos

- `services/midia-worker/src/`: `supabase.ts`, `fila.ts`, `servidor.ts`, `imagem.ts`, `video.ts`, `config.ts`
- `services/midia-worker/test/`: `supabase.test.ts`, `imagem.test.ts`, `video.test.ts`, `servidor.test.ts`, `recuperacao.test.ts` (novo), `supabaseSimulado.ts` (novo)
- `services/midia-worker/README.md`, `services/midia-worker/.env.example`
- `packages/dominio/midia.ts` (só comentário)
- `supabase/migrations/20261111090000_midias_fila.sql`, `supabase/tests/midias_fila.sql` (novos)

## Verificação

- Testes do worker: 43 passam (eram 34), incluindo o FFmpeg real. Os novos cobrem:
  - falha parcial em download, envio, atualização e limpeza;
  - job repetido: a execução antiga não sobrescreve a nova e o arquivo dela é removido;
  - trabalho travado: o prazo encerra o processo e registra a falha;
  - reinício: um processo real é morto no meio do download, e o novo processo retoma a mídia sozinho na tentativa 2, gravando uma vez só;
  - EXIF/GPS, orientação e transparência no fallback de foto;
  - localização e faixa de legenda removidas de um vídeo real.
- Os testes de reinício e de prazo rodaram 3 vezes seguidas, sem falha.
- `npm run typecheck` e `eslint` em `services` e `packages`: limpos.
- **Não verificado:** o SQL. Não há Postgres nem Docker nesta máquina. A migration e o teste SQL rodam quando a sessão principal aplicar `20261111080000` e `20261111090000` no SQL Editor.

## Decisões fora do pedido

- `arquivo_publicado` separado de `arquivo`. Antes, o worker trocava `arquivo` pelo otimizado e perdia a referência ao original, que o PRD pede guardar para disputas.
- O webhook virou só um aviso; o trabalho é sempre lido do banco. Assim um aviso perdido ou repetido não muda nada.
- Prazo de trabalho de 45 min e prazo da fila de 50 min. `falhou` volta após 5 min. Até 3 tentativas, valor fixo no SQL.
- A imagem (sharp) não tem limite de tempo: o limite de pixels do sharp já protege contra arquivos-bomba. O download depende dos limites padrão do `fetch` do Node.
- Com `APAGAR_ORIGINAL_APOS_OTIMIZAR=true`, a linha continua apontando para o original removido. A opção segue desligada por padrão.

## Pendências

- D07: criar a linha em `midias` a partir do app, com política de inserção do dono, e criar o bucket `midias` (já existe `npm run preparar-storage`).
- D08: leitura do comprador só de `processamento = 'pronta'`, usando `arquivo_publicado`.
- Reprocessar pela equipe: voltar a linha para `aguardando` e zerar as tentativas.
- Homologar no Supabase hospedado.

## Aplicação no banco

Em 11/11, `20261111090000_midias_fila.sql` foi aplicada no Supabase `agro` pelo SQL Editor, depois de um ensaio desfeito. `supabase/tests/midias_fila.sql` passou no banco real. O worker ainda não roda contra o hospedado.
