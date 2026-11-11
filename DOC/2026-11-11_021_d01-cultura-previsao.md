# D01 — Cultura e previsão básica no Supabase

**Frente:** Oferta e mídia (ramo `frente/oferta-midia`).

**Pedido:** fechar o que falta para o aceite da D01: persistir cultura, unidade e previsão do catálogo do piloto, sem faixa ±10% assumida. Verificação: cadastrar e reabrir, recusar unidade inválida e não perder campos ao anexar foto.

## Plano aprovado pelo Maestro (com ajustes)

- Tabela de catálogo **vazia, sem seed**: região e culturas do piloto ainda são decisão do usuário (plan.md §4). O catálogo fica mínimo (nome, segmento, unidades, ativo); atributos por segmento são da D09.
- As culturas antigas do AsyncStorage são ignoradas (não há usuário real) e `culturasLocais.ts` sai.
- RPCs `security definer` com `search_path` fixo e `execute` só para `authenticated`.

## O que foi feito

- **Migration `supabase/migrations/20261111100000_culturas.sql`** (escrita no ramo, ainda **não aplicada**):
  - `public.catalogo_culturas`: `nome`, `segmento` (hortifruti, graos, pecuaria, agroindustria), `unidades` (subconjunto de kg, cx, t) e `ativo`. Nome único por segmento. Leitura para `authenticated`; nenhuma escrita pelo app.
  - `public.culturas`: propriedade, item do catálogo, variedade, área (ha), plantio, etapa, previsão (unidade, estimativa, mínimo, máximo, colheita), `criado_por`, `atualizado_por` e datas. Os checks exigem quantidade inteira entre 1 e 1 bilhão, previsão completa ou ausente, os dois limites juntos e mínimo ≤ estimativa ≤ máximo. A RLS libera leitura para membros da organização da propriedade e para a equipe autorizada.
  - `salvar_cultura(...)`: cria ou edita. Recusa propriedade de outra organização (42501), cultura fora do catálogo ou inativa (PT422), cultura de outro (PT404) e troca de cultura que deixaria a previsão com unidade inválida (PT422).
  - `salvar_previsao(...)`: recusa unidade fora das unidades da cultura no catálogo (PT422) e cultura de outro (PT404). Os checks recusam valores inválidos (23514).
- **App Agricultor:**
  - `lib/culturas.ts` (novo): catálogo, propriedades, culturas e chamadas às RPCs, com a mesma validação do banco e mensagens por código de erro. Também guarda `lerDataColheita`, que antes ficava em `culturasLocais.ts`.
  - Tela 30: a cultura é escolhida do catálogo, com estado vazio "O catálogo de culturas do piloto ainda não foi publicado". A propriedade só aparece para escolha quando há mais de uma. Sem propriedade enviada, a tela pede o cadastro dela. A foto continua só como prévia.
  - Tela 09: a unidade vem do catálogo (já marcada quando há uma só), e a estimativa e a faixa usam essa unidade.
  - Tela 08, lote (`useCulturasLote`), tela 13 e `lib/ofertas.ts` passaram a ler de `lib/culturas.ts`, e a quantidade aparece com a unidade.
  - `lib/culturasLocais.ts` removido.

## Verificação

- `npx tsc --noEmit -p apps/agricultor`, `npm run typecheck` e `npx eslint .` passaram sem erro.
- `npm test`: 18 + 43 passaram.
- **`supabase/tests/culturas.sql` ainda não foi rodado.** Ele depende da migration aplicada no `agro`, que é tarefa do Maestro. O teste roda em `begin ... rollback`, cria o próprio catálogo e cobre:
  - cadastrar, reabrir e editar mantendo a autoria;
  - cultura inativa ou fora do catálogo e área zero;
  - unidade fora da cultura e unidade inexistente;
  - estimativa zero, faixa invertida, faixa pela metade e previsão sem colheita;
  - previsão válida em cx com faixa, e regravação em kg sem faixa;
  - troca de cultura incompatível com a unidade gravada;
  - escrita direta em `culturas` e no catálogo;
  - leitura e escrita por outra organização;
  - privilégios de `anon`.
- **Não perder campos ao anexar foto:** verificado lendo o código. Os campos e a foto ficam em estados separados do mesmo componente, e escolher a foto não remonta a tela nem relê os dados. Isso ainda não foi ensaiado num aparelho.

## Arquivos

- `supabase/migrations/20261111100000_culturas.sql` (novo)
- `supabase/tests/culturas.sql` (novo)
- `apps/agricultor/lib/culturas.ts` (novo); `apps/agricultor/lib/culturasLocais.ts` (removido)
- `apps/agricultor/screens/30-cadastrar-cultura/CadastrarCulturaScreen.tsx` e `README.md`
- `apps/agricultor/screens/09-previsao-safra/PrevisaoSafraScreen.tsx` e `README.md`
- `apps/agricultor/screens/08-minha-producao/MinhaProducaoScreen.tsx`
- `apps/agricultor/screens/13-preco-retirada/PrecoRetiradaScreen.tsx`
- `apps/agricultor/lote/useCulturasLote.ts`, `apps/agricultor/lib/ofertas.ts`

## Decisões fora do pedido

- O `segmento` aceita só os quatro segmentos do plan.md §12.1. Um segmento novo exige migration.
- `criado_por` e `atualizado_por` não têm FK para `auth.users`, para não travar a exclusão de usuário. O histórico completo de alterações fica para depois.
- Na edição, uma cultura desativada no catálogo continua aparecendo para não perder o valor. Um cadastro novo não consegue escolhê-la.
- A etapa continua vindo de `hooks/dados.ts` (lista fixa que já existia) e é gravada como texto livre de até 60 caracteres no banco.
- Rascunhos de lote que apontavam para culturas locais (`culturaId` antigo) deixam de achar a cultura. Isso só afeta dados de teste no aparelho.
- O app Agricultor não tem runner de testes. A validação fica coberta pelo teste de banco, que é a fonte da verdade, e pelo typecheck.
