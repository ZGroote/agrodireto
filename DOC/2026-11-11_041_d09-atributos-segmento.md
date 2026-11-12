# D09 — Atributos do lote por segmento (Onda 1: hortifrúti e grãos)

**Frente:** Oferta e mídia, ramo `frente/oferta-midia`. Fluxo acelerado (cerca de 1 h): plano de 5 linhas enviado e implementação logo em seguida.

**Estado:** servidor e Agricultor concluídos no ramo; verificações locais passando. **O SQL não foi executado;** o Maestro aplica e roda no `agro`.

## Pedido

Decisão do usuário (11/11, 20h): aprovadas as recomendações do DOC 038 (§4.2 e D09.1/D09.2); região SP intraestadual.

- **Grãos:** `origem_classificacao`, `tipo_grao`, `umidade_max_pct`, `impurezas_max_pct`, `acondicionamento`.
- **Hortifrúti:** `padrao_qualidade`, `calibre`, `embalagem` e `peso_medio_embalagem_kg`, este obrigatório quando a unidade é `cx`.
- **Unidade `sc`** (saca de 60 kg) para grãos.
- **Validação no servidor** em `salvar_rascunho_lote`: campo de outro segmento é recusado.
- **Formulário:** mostra só os campos do segmento.
- **Agroindústria e pecuária:** só a estrutura pronta, sem campos.

Alertas do Maestro durante o trabalho:
1. Nova assinatura com drop da antiga e permissões iguais. **Feito**, e conferido no teste SQL que não sobrou outra versão da função.
2. Procurar outras checagens de unidade.
3. **Exceção autorizada:** acrescentar `sc` ao tipo de unidade em `packages/dominio`. **Feito, só em `packages/dominio/ofertas.ts`** (`unidade: 'kg' | 'cx' | 't' | 'sc'`).

Coordenação: `publicar_oferta_lote` e `consultar_catalogo` são da frente Identidade nesta rodada e **não foram tocadas**.

## Checagens de unidade encontradas (alerta 2)

- **Banco:** os checks de `catalogo_culturas.unidades`, `culturas.unidade`, `rascunhos_lote.unidade` e `ofertas_lote.unidade`. Os quatro foram trocados nesta migration.
- **`publicar_oferta_lote`:** a versão mais recente está em `20261111080000_organizacoes.sql:188` e **não tem checagem própria de unidade**. Ela só insere em `ofertas_lote`, cujo check agora aceita `sc`. **Não há linha para a Identidade mudar.**
- **`salvar_previsao`/`salvar_cultura`:** conferem a unidade contra o catálogo, que agora tem `sc` nos grãos. Não mudaram.
- **Apps:**
  - `apps/agricultor/lib/culturas.ts` (tipo `Unidade`);
  - `lote/rascunhosLote.ts` (tipo e leitura do aparelho);
  - `lib/rascunhosRemotos.ts` (validação);
  - `lote/LoteDraftContext.tsx` (lista de unidades);
  - tela 09 (rótulo "Sacas de 60 kg (sc)").

  Todos aceitam `sc`. Nenhum outro app tem checagem de unidade além do tipo do domínio.

## Servidor — `supabase/migrations/20261111230000_atributos_segmento.sql`

- **Checks de unidade:** passam a aceitar `sc`. O catálogo aceita até 4 unidades. As 19 culturas de grãos ganham `sc`.
- **`rascunhos_lote.atributos`:** nova coluna `jsonb not null default '{}'`, que precisa ser um objeto.
- **`agrodireto_privado.validar_atributos_lote(segmento, unidade, etapa, atributos)`:**
  - recusa chave de outro segmento (PT422 com o nome do campo);
  - recusa valor fora das listas do DOC 038 §4.2;
  - números: confere que é número antes do cast, com os limites umidade 0–30, impurezas 0–15 e peso 0 < x ≤ 1000;
  - **obrigatórios só a partir da etapa `preco`**, porque o rascunho pode ser parcial (D02): em grãos, os cinco campos; em hortifrúti, `padrao_qualidade`, `embalagem` e o peso quando `cx`;
  - agroindústria e pecuária: ramo pronto que só aceita `{}`.
- **`salvar_rascunho_lote`:**
  - recriada com `p_atributos jsonb default '{}'`, drop e create com a mesma regra de antes e `revoke`/`grant` iguais;
  - recusa o calibre em texto fora do hortifrúti;
  - chama a validação acima.
- **`supabase/tests/atributos_segmento.sql` (novo):**
  - `sc` só em grãos e uma única assinatura, com permissões corretas;
  - grãos em `sc` completo; rascunho parcial aceito e barrado na etapa de preço;
  - campos de outro segmento recusados nos dois sentidos, incluindo o calibre em texto;
  - limites, tipo e lista; `sc` recusado em hortifrúti;
  - caixa sem peso e peso zero recusados;
  - agroindústria só com `{}`; atributos fora do formato de objeto recusados.
- **Testes antigos ajustados:**
  - `rascunhos_lote.sql`: a assinatura do `has_function_privilege` passou a ter 16 parâmetros;
  - `rascunhos_lote.sql` e `culturas.sql`: a "unidade inexistente" passou de `sc` para `dz`.

## Agricultor

- **`lote/atributosSegmento.ts` (novo):**
  - configuração dos campos por segmento (rótulo, tipo, opções e obrigatoriedade);
  - `atributosParaServidor` envia só as chaves do segmento, com números convertidos, e monta os textos legíveis de padrão, calibre e embalagem, que a publicação e o catálogo já exibem. Exemplo: "Tipo 1 · umidade até 14% · impurezas até 1% · Declarada pelo vendedor".
- **Rascunho:** ganhou `segmento` e `atributos`, que o aparelho guarda e relê. A leitura remota traz `atributos` e o segmento do catálogo.
- **Tela 11:**
  - a unidade `sc` aparece quando a cultura a tem;
  - trocar a cultura para outro segmento limpa os atributos e os textos.
- **Tela 12 (padrão do lote):**
  - saíram os seletores com dados de demonstração (`useCatalogo`);
  - agora mostra só os campos do segmento (lista ou texto/número);
  - "Continuar" fica bloqueado com aviso enquanto falta um obrigatório.
  - Os textos de padrão, calibre e embalagem do rascunho ficam em dia, então a tela 14 e `lib/ofertas.ts` (publicação) continuam iguais.
- **Teste Node** (`test/rascunhosLote.test.cjs`), dois casos novos:
  - só as chaves do segmento vão ao servidor, com números e textos legíveis; limites e listas; peso obrigatório em `cx`;
  - segmento, atributos e `sc` sobrevivem ao reinício.

## Verificação

- `npm run typecheck` (todos os workspaces), `npx tsc --noEmit -p apps/agricultor`, `npx eslint .`, `npm test` (todos passando; Agricultor 24) e `git diff --check`: passaram.
- **Não executados:** `atributos_segmento.sql`, `rascunhos_lote.sql` e `culturas.sql` no `agro` (Maestro), e o ensaio pelas telas.

## O que aplicar no `agro`

1. Migration `20261111230000_atributos_segmento.sql`, **antes** da `240000` da Identidade.
2. Rodar `supabase/tests/atributos_segmento.sql`, `rascunhos_lote.sql` e `culturas.sql`.

## Decisões fora do pedido e o que faltou

- **Obrigatórios só a partir da etapa de preço** (o rascunho continua podendo ser parcial).
- **Atributos fora da publicação:** os atributos estruturados ficam no rascunho. `ofertas_lote` continua recebendo os textos de padrão, calibre e embalagem (sem coluna nova, porque `publicar_oferta_lote` é da Identidade). Levar os atributos estruturados para a oferta fica para a próxima rodada, com a Identidade.
- **Fora da Onda 1:** do DOC 038 §4.2 não entraram `grau_maturacao`, `temperatura_recomendada_c`, `codigo_lote_origem`, `avariados_max_pct` e `safra`; não foram pedidos.
- **Laudo CGC/MAPA:** "Classificação certificada" ainda não exige o laudo; isso é D10.
- **Atributos da cultura (DOC 038 §3.2):** não feitos; o pedido era do lote.
- **Rascunhos antigos sem segmento:** continuam enviando os textos antigos. Se forem de grãos com calibre preenchido, o servidor recusa e a pessoa precisa limpar o calibre (dados de teste).
- **Exceção em `packages/dominio`:** só o tipo da unidade em `ofertas.ts`, como autorizado.
