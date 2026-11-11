# B01 — Etapa 2: organização e membros no Agricultor (produtor)

Data: 11/11/2026. Frente Identidade, ramo `frente/identidade`, com `main` mesclado em `a6cc03c` antes desta etapa.

## Pedido e plano aprovado

Seleção explícita de organização e inclusão de membro pelas telas, um perfil por vez. O Maestro aprovou começar pelo produtor (Agricultor) e incluir nesta entrega a correção de `enviar_propriedade`, que ignorava a organização escolhida.

## Feito

### Banco

`supabase/migrations/20261111180000_propriedade_na_organizacao.sql`. A migration remove a versão antiga de `enviar_propriedade(text,text,text,numeric,text)` e cria `enviar_propriedade(..., p_organizacao uuid default null)` com os mesmos grants: `revoke` de `public`, `anon` e `authenticated`, e `execute` para `authenticated`. O `drop` evita que a versão antiga continue existindo ao lado da nova.

- **Com `p_organizacao`:** exige que o usuário tenha vínculo (titular ou membro, a mesma regra do `reenviar_propriedade`) com uma organização do tipo `produtor`. A organização fica bloqueada (`for share`) durante o envio. Se a organização não existir, se o usuário não tiver vínculo ou se ela não for de produtor, o erro é `insufficient_privilege`. A propriedade é gravada nessa organização.
- **Sem `p_organizacao`:** o comportamento continua o de antes. Usa a primeira organização em que o usuário é titular ou cria uma nova, com o mesmo advisory lock.

As chamadas com cinco argumentos (testes `compradores`, `culturas`, `rascunhos_lote` e `transportadoras`) continuam válidas pelo default.

`supabase/tests/propriedades.sql`:
- Uma 4ª conta (C) entra como membro, incluída pelo titular via `incluir_membro`.
- Casos novos:
  - o titular grava na organização escolhida;
  - uma organização inexistente é recusada;
  - o membro grava na organização do titular sem que isso crie outra;
  - o envio do membro sem organização mantém o comportamento antigo (cria a organização dele, como titular);
  - um terceiro (B) é recusado na organização alheia;
  - o titular vê as 4 propriedades da organização.
- A conferência de grant para `anon` passou para a nova assinatura.
- O teste não chama `agrodireto_privado.*` no papel `authenticated`. A titularidade é conferida por `listar_meus_vinculos()`.

### App Agricultor

- `lib/organizacoes.ts` (novo): `listarVinculos` (só perfil produtor), `contextoAtual`, `organizacaoEmUso`, `trocarContexto` e `incluirMembro`. `incluirMembro` valida o formato do e-mail antes de chamar o servidor e devolve sempre a mesma mensagem.
- `lib/propriedadeRemota.ts`:
  - A leitura filtra por `organizacao_id` da organização escolhida. Sem escolha e sem vínculo, retorna nulo. Sem escolha e com vínculo, pede a escolha e não lê nem grava.
  - O envio passa `p_organizacao`.
  - No primeiro envio, quando o usuário ainda não tem organização, o app chama `trocar_contexto` para a organização criada, porque o próprio envio é a escolha do usuário.
- `screens/46-organizacao` + rota `/perfil/organizacao`:
  - Lista as organizações com papel e propriedades aprovadas, e marca "Em uso".
  - Um toque troca a organização. A troca é auditada no servidor.
  - O titular da organização em uso vê o campo de e-mail. A confirmação é neutra: "Solicitação processada. Se a conta existir, o vínculo estará disponível."
  - Sem vínculo, a tela mostra o estado vazio.
- `ConfiguracoesScreen`: linha nova "Organização".
- `MinhaPropriedadeScreen`: mostra "Escolha a organização em Perfil > Organização." quando falta a escolha.
- Os dados do contexto anterior são descartados porque as telas de propriedade consultam de novo a cada foco.
- `test/organizacao.test.cjs` (novo, 5 casos):
  - leitura filtrada pela organização escolhida;
  - pedido de escolha sem chamar o servidor de propriedades;
  - primeiro envio seguido de troca de contexto;
  - envio na organização escolhida sem troca;
  - vínculos só de produtor e validação de e-mail.

## Verificação

- `npm test` na raiz: Agricultor 12/12, domínio 18/18, worker 43/43.
- `npx eslint .` passou.
- `npm run typecheck` passou. Os tipos de rota do Expo foram regenerados subindo o Expo offline por um instante (o arquivo `.expo` é ignorado no git), como no DOC 027.
- `git diff --check` não apontou problemas.
- **SQL não executado nesta sessão** (sem banco local). A aplicação da `20261111180000`, o `propriedades.sql` e o ensaio com 2 contas no `agro` ficam com o Maestro. O ensaio em aparelho fica com o usuário.

## Decisões fora do pedido e pendências

- Com `p_organizacao`, a regra é a de **vínculo** (titular ou membro), não só titular, igual ao `reenviar_propriedade`. Se o envio de propriedade nova tiver que ser exclusivo do titular, basta trocar a condição.
- A linha "Organização" em Configurações não mostra o nome da organização atual, para não fazer outra consulta nessa tela. O nome aparece na tela 46.
- `SeuCadastroScreen` ainda mostra "Consulta indisponível" quando falta escolher a organização. Só a tela 04 traz a mensagem de escolha.
- Usuários que já enviaram propriedade antes desta versão não têm troca registrada. Na primeira abertura, o app pede que escolham a organização uma vez.
- Lotes, rascunhos e culturas continuam por `produtor_id` (frente Oferta) e não seguem o contexto. **B01 continua não concluída:** faltam o Cliente (comprador) e a Logística (transportadora), as sessões reais e a troca concorrente em duas conexões.
