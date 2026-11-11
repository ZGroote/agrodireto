# Organizações e várias propriedades

**Data:** 11/11/2026 (America/Sao_Paulo).
**Pedido:** primeiro passo do piloto ampliado (B01/C01): permitir organizações e várias propriedades por usuário antes de existir dado real.

## O que foi feito

A migração `20261111080000_organizacoes.sql` foi aplicada no Supabase `agro` pelo SQL Editor. Antes, um ensaio rodou a migração e os dois testes dentro de uma transação desfeita no final; depois da aplicação, os testes rodaram de novo no banco real. A homologação tinha 0 propriedades e 0 lotes, então não houve dado a migrar.

- Tabelas novas `organizacoes` e `membros_organizacao` (papel `titular` ou `membro`), com RLS. O app não consegue incluir membros.
- `propriedades` ganha `id` como chave primária e `organizacao_id`; `usuario_id` passa a ser quem enviou. Nome único dentro da organização.
- `ofertas_lote` ganha `propriedade_id`; `produtor_id` continua sendo quem publicou.
- `enviar_propriedade` cria a organização no primeiro envio e devolve o id da propriedade; reenviar com o mesmo nome não duplica, nome novo cria outra propriedade na mesma organização.
- `reenviar_propriedade`, `revisar_propriedade` e `aprovar_propriedade` passam a receber o id da propriedade.
- `publicar_oferta_lote` aceita `p_propriedade_id` opcional; sem ele, usa a única propriedade aprovada e pede escolha quando há mais de uma.
- Catálogo, fotos do catálogo e evidências ligam o lote à propriedade pelo id. Com `usuario_id` deixando de ser único, a junção antiga repetiria lotes.
- Apps: `packages/dominio/propriedades.ts`, `apps/agricultor/lib/propriedadeRemota.ts`, `apps/administrador/lib/propriedades.ts` e as telas 04 e 05 do Administrador.

## Verificação

- `supabase/tests/propriedades.sql`: duas propriedades na mesma organização, reenvio idempotente, bloqueio entre organizações, inclusão de membro negada, lote ligado à propriedade aprovada, MFA e acesso anônimo.
- `supabase/tests/inspecoes_lote.sql`: ajustado ao novo modelo e aprovado.
- `npm run typecheck`, `npm run lint` e `npm test` (15 + 34) aprovados.

## Decisões fora do pedido

- A organização nasce com o nome da primeira propriedade. Renomear fica para quando houver tela de organização.
- O Agricultor continua mostrando uma propriedade (a primeira enviada). Escolher entre várias fica para a tela de propriedades.
- Gerir lotes e evidências continua sendo de quem publicou (`produtor_id`). Como ainda não há como incluir membros, isso equivale à organização; passar a checar membros quando a inclusão existir.
- O conector Supabase desta máquina aponta para outra conta, por isso a aplicação foi feita pelo SQL Editor com o login do usuário. O painel salvou o SQL como consulta privada "Untitled query".

## Próximo passo

Organização do comprador e da transportadora (C02/C03) ou catálogo por segmento (D09), conforme a ordem do plano.
