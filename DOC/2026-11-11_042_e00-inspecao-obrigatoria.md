# E00 — Regra de inspeção obrigatória

Data: 11/11/2026, fluxo acelerado (cerca de 45 min). Frente Identidade, ramo `frente/identidade`, com `main` mesclado em `a17e91f`.

## Pedido

Regra do DOC 039, item 6, aprovada pelo usuário em 11/11 às 20h. Publicar um lote exige inspeção concluída e aprovada quando for:
- o 1º lote da organização produtora;
- um lote de valor (quantidade × preço) acima de R$ 20.000;
- um lote do segmento pecuária.

Nos demais casos, o lote sai marcado como "Declarado pelo produtor". O escopo pedido: servidor (função de publicação, na versão mais recente), teste SQL e mensagem no Agricultor.

## Desenho

A inspeção (`concluir_inspecao_lote`) só existe sobre um lote já gravado em `ofertas_lote`. Por isso a regra virou:
- o lote é gravado com `verificacao = 'inspecao_obrigatoria'` e só entra no catálogo do comprador depois de uma inspeção com resultado `aprovado`;
- "ressalvas" e "reprovado" não liberam;
- os demais lotes ficam `verificacao = 'declarado'`.

O Maestro aprovou esse plano, e esta frente ficou dona de `publicar_oferta_lote` e de `consultar_catalogo` nesta rodada.

## Migration `20261111240000_inspecao_obrigatoria.sql`

Aplica-se depois da `230000` da Oferta (D09).

- **`ofertas_lote.verificacao`:** `text not null default 'declarado'`, com `check` em `('declarado', 'inspecao_obrigatoria')`. Os lotes existentes ficam `declarado`. O client continua sem escrita direta.
- **`publicar_oferta_lote`:** copiada da versão mais recente, `20261111080000_organizacoes.sql`, por script. Só entram a variável `v_verificacao`, o `IF` da regra (sem `CASE`) e a coluna no `insert`.
  - **1º lote:** não há nenhum lote em propriedades da mesma organização. Duas publicações simultâneas no 1º lote podem ambas exigir inspeção; o erro fica no lado seguro.
  - **Valor:** `p_quantidade * p_preco_centavos > 2000000`, ou seja, acima de R$ 20.000. Exatamente R$ 20.000 fica declarado.
  - **Pecuária:** o produto tem o mesmo nome (sem maiúsculas e espaços externos) de uma cultura do segmento `pecuaria` em `catalogo_culturas`.
  - Republicar o mesmo rascunho devolve o mesmo lote, sem reavaliar.
  - O corpo não valida unidade por lista (a checagem é da tabela), então não foi preciso acrescentar `sc` aqui; a D09 cuida disso no `check`.
- **`consultar_catalogo`:** copiada da versão mais recente, `20261111085000_compradores.sql`. Só entra no `where`: `verificacao = 'declarado'` ou existe `inspecoes_lote` com `resultado = 'aprovado'`. O retorno não muda. `ler_resultado_inspecao_lote` usa `consultar_catalogo` e segue o mesmo filtro.

## Teste `supabase/tests/inspecao_obrigatoria.sql`

Montagem: organização, membro titular, propriedade aprovada, comprador da lista de homologação, equipe com papel `cadastral` e uma cultura de pecuária de teste.

- **Marcação:**
  - 1º lote: obrigatória;
  - 2º lote comum: declarado;
  - 100 × R$ 200,01: obrigatória;
  - 100 × R$ 200,00 (exatamente R$ 20.000): declarado;
  - pecuária (nome com maiúsculas e espaços): obrigatória;
  - republicar não duplica;
  - o produtor não altera `verificacao` direto.
- **Catálogo antes da inspeção:** só os declarados; o lote obrigatório não aparece nem buscado por id.
- **Depois da inspeção:**
  - `aprovado` libera;
  - `ressalvas` não libera;
  - pecuária sem inspeção continua escondida;
  - declarado continua visível.
- O teste não chama `agrodireto_privado.*` no papel `authenticated` (as inserções em `agrodireto_privado` são feitas antes do `set role`). Tudo roda numa transação com rollback.

## Agricultor

- **`lib/ofertas.ts`:**
  - `lerPublicacao` passa a ler `verificacao`;
  - novo tipo `VerificacaoLote`;
  - textos em `avisoVerificacao`.
- **14 Revisar oferta:** depois de publicar, aparece:
  - para lote obrigatório: "Este lote precisa de inspeção da equipe AgroDireto antes de aparecer no catálogo (1º lote, valor acima de R$ 20.000 ou pecuária).";
  - para os demais: "Publicado como "Declarado pelo produtor": o checklist do lote é o que você informou."

## Verificação

- `npm test` na raiz: Administrador 4, Agricultor 22, Cliente 5, Logística 4, domínio 18, worker 46, sem falhas.
- `npx eslint .` e `npm run typecheck` passaram.
- `git diff --check` não apontou problemas.
- **SQL não executado aqui** (sem banco local). Aplicar no `agro` a `20261111240000`, depois da `230000`. Rodar `inspecao_obrigatoria.sql` e os testes que tocam publicação e catálogo: `propriedades`, `inspecoes_lote`, `compradores`, `culturas`, `rascunhos_lote`, `catalogo_midias` e `midias_privadas`.

## O que faltou (registrado)

- **Selo para o comprador:** o retorno de `consultar_catalogo` não mudou, então o Cliente ainda não mostra "Declarado pelo produtor" nem "Inspecionado". Para mostrar, é preciso acrescentar a coluna no retorno (`drop` + `create`) e a tela do Cliente (frente Oferta).
- **Fotos e vídeos do catálogo:** `pode_ver_foto_catalogo` (085000) e as funções de vídeo (220000) ainda liberam a mídia de um lote aguardando inspeção para o comprador autorizado que tiver o caminho. O lote não aparece na lista, mas a mídia não está bloqueada. Fica para a próxima rodada: o mesmo filtro dessas funções.
- **Detalhe do lote no Agricultor (15):** ainda não mostra "Aguardando inspeção" ou "Declarado". Só a 14 mostra, logo depois de publicar.
- **Lotes antigos:** ficam `declarado` (default), inclusive um eventual 1º lote antigo. Se o usuário quiser reclassificar, é um `update` pontual da operação.
