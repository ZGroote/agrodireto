# B01 — Etapa 2: empresa e equipe na Logística (transportadora)

Data: 11/11/2026. Frente Identidade, ramo `frente/identidade`, com `main` mesclado em `b4609cc` antes desta etapa. A frente Logística está pausada; `apps/logistica` ficou com esta frente só nesta tarefa.

## Pedido e plano aprovado

Mesmo padrão do Agricultor (DOC 030) e do Cliente (DOC 032): escolher explicitamente a transportadora em uso e o titular incluir membro por e-mail. O Maestro aprovou o plano como proposto, incluindo o Card "Empresa" fora do mockup e o registro das lacunas (a) e (b).

## Feito (só `apps/logistica`; sem migration)

- `lib/organizacoes.ts` (novo): cópia da versão do Cliente para o perfil `transportadora`.
- `lib/transportadora.ts`:
  - `lerCadastroTransportadora` deixa de pegar "a primeira transportadora da conta" e lê só a empresa em uso. O papel continua vindo de `membros_organizacao`, agora filtrado por essa organização.
  - Sem escolha e com vínculo, pede a escolha. Sem vínculo, retorna nulo.
  - No primeiro envio, o app chama `trocar_contexto` para a empresa devolvida por `enviar_cadastro_transportadora`.
  - As mensagens de `42501` não mudaram: o reenvio continua só do titular (B04).
- **Frota (03 Veículos, 04 Motoristas):** sem mudança de código nem de regra. As telas já usam o `organizacao_id` do cadastro lido, que agora é o da empresa em uso. Qualquer membro continua salvando, como manda o servidor.
- **25 Trocar empresa** (`/perfil/empresas`) e **26 Equipe e permissões** (`/perfil/equipe`): iguais às telas 28 e 29 do Cliente, dentro da pilha do Perfil e com tab bar.
- **22 Configurações:**
  - Ganhou um Card com "Trocar empresa" e "Equipe e permissões", comentado como fora do mockup.
  - O cabeçalho, que antes mostrava `EMPTY`, mostra a transportadora em uso e o papel.
- **02 Transportadora:** novo estado "escolher", com a mensagem e o botão "Escolher empresa", que leva à 25. Antes, esse caso cairia em erro de leitura.
- **Entrar** não mudou: quando falta escolher a empresa, a leitura falha e o app vai para a 02, que mostra a escolha.
- `test/organizacao.test.cjs` (novo, 4 casos) e script `test` no `package.json` da Logística.

## Verificação

- `npm test` na raiz: Agricultor 12, Cliente 5, Logística 4 (novos), domínio 18, worker 44, sem falhas.
- `npx eslint .` passou.
- `npm run typecheck` passou. Os tipos de rota do Expo foram regenerados subindo o Expo offline por um instante (arquivo `.expo` ignorado).
- `git diff --check` não apontou problemas.
- O SQL não mudou. O ensaio com 2 contas no `agro` fica com o Maestro; o ensaio em aparelho, com o usuário.

## Lacunas registradas (decisão do Maestro)

- **(a) Cargas e viagens (G03 em diante)** recebem `organizacao_id` explícito, e o servidor confere a aprovação dessa transportadora, como na regra F01–F03 do DOC 032. Não podem usar a empresa em uso nem "qualquer transportadora aprovada".
- **(b)** Quem é membro de uma transportadora alheia e quer cadastrar a própria não tem caminho na tela 02, porque ela mostra a empresa em uso. Fica para depois.

## Decisões fora do pedido

- As telas 03 e 04, quando falta escolher a empresa, mostram o erro de leitura delas, sem o botão de escolha. O caminho normal passa pela 02, que já pede a escolha.
- **B01 etapa 2 está feita nos três perfis.** Ficam pendentes para a B01: as sessões reais, a troca simultânea em duas conexões e o ensaio em aparelho.
