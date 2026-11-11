# B01 — Etapa 2: empresa e equipe no Cliente (comprador)

Data: 11/11/2026. Frente Identidade, ramo `frente/identidade`, com `main` mesclado em `969930e` antes desta etapa.

## Pedido e plano aprovado

Mesmo padrão do Agricultor (DOC 030), agora para o comprador: escolher explicitamente a empresa em uso e o titular incluir membro por e-mail. O Maestro aprovou o plano e pediu que `lib/organizacoes.ts` fique copiado no app, porque usa o supabase do app; `packages/dominio` é só contrato.

## Feito (só `apps/cliente`; sem migration)

O servidor já atendia, sem mudança:
- `enviar_cadastro_comprador` devolve o id da empresa e só cria empresa nova para quem ainda não é titular de outra.
- `reenviar_cadastro_comprador` é exclusivo do titular desde a migration `20261111150000`.

A faixa `2026111120xxxx` não foi usada.

- `lib/organizacoes.ts` (novo): cópia da versão do Agricultor para o perfil `comprador`. O vínculo traz `status_cadastro`.
- `lib/cadastroComprador.ts`:
  - `lerCadastroComprador` lê só a empresa em uso (`organizacao_id`). Sem escolha e com vínculo, pede a escolha. Sem vínculo, retorna nulo, e a tela abre o formulário de empresa nova.
  - No primeiro envio, o app chama `trocar_contexto` para a empresa criada.
  - Quando um membro tenta reenviar (`42501`), o app mostra "Só o titular corrige o cadastro da empresa."
- **28 Trocar empresa** (`/empresas`):
  - Lista as empresas com papel e situação do cadastro, e marca "Em uso".
  - Um toque troca a empresa. A troca é auditada no servidor.
  - Sem empresa, a tela mostra o estado vazio.
- **29 Equipe e permissões** (`/equipe`):
  - O titular da empresa em uso inclui membro por e-mail. A resposta é sempre neutra: "Solicitação processada. Se a conta existir, o vínculo estará disponível."
  - O membro vê "Só o titular da empresa inclui membros." Sem empresa escolhida, a tela manda escolher.
  - A tela não lista os membros, porque a RLS não expõe essa lista, de propósito (DOC 027).
- **24 Configurações:**
  - As linhas "Equipe e permissões" e "Trocar empresa", que já estavam no mockup sem ação, abrem as telas 29 e 28.
  - O cabeçalho, que antes mostrava `EMPTY`, mostra a razão social da empresa em uso e o papel.
- **26 Cadastro da empresa:** quando falta escolher, mostra a mensagem e o botão "Escolher empresa", que leva à 28. A tela 26 não tem tab bar, então sem o botão o usuário não teria como chegar lá.
- `test/organizacao.test.cjs` (novo, 5 casos) e script `test` no `package.json` do Cliente, igual ao Agricultor.

## Verificação

- `npm test` na raiz: Agricultor 12, Cliente 5 (novos), domínio 18, worker 44, sem falhas.
- `npx eslint .` passou.
- `npm run typecheck` passou. Os tipos de rota do Expo foram regenerados subindo o Expo offline por um instante (arquivo `.expo` ignorado).
- `git diff --check` não apontou problemas.
- O SQL não mudou. O ensaio com 2 contas no `agro` fica com o Maestro; o ensaio em aparelho, com o usuário.

## Regra para F01–F03 (decisão do Maestro, 11/11)

**Cotação e pedido recebem `organizacao_id` explícito, e o servidor confere a aprovação DESSA empresa.**

Hoje `sou_comprador_autorizado` e o catálogo liberam por usuário: basta qualquer empresa aprovada da qual ele faça parte. Por isso, um membro de empresa aprovada vê o catálogo mesmo com uma empresa em análise selecionada. Para leitura do catálogo, isso é aceitável. Para cotação e pedido, não: essas operações não podem usar a empresa em uso nem "qualquer empresa aprovada". Precisam receber o id da empresa e conferir, no servidor, o vínculo e a aprovação dela.

## Pendências registradas (para depois)

- **(b)** Quem é membro de uma empresa alheia e quer cadastrar a própria empresa não tem caminho na tela 26, porque ela mostra a empresa em uso.
- **(c)** Entrar e Recuperar acesso continuam decidindo o destino por `compradorAutorizado` (qualquer empresa aprovada), sem considerar a empresa em uso.

## Decisões fora do pedido

- As rotas ficaram `/empresas` e `/equipe`, telas cheias em `app/(app)/`, e não `/perfil/...` como estava no plano. No Cliente, a aba Perfil é um arquivo único, não uma pilha de telas, como `faturas`.
- A tela 26 ganhou o botão "Escolher empresa" (motivo acima).
- **B01 continua não concluída:** falta a Logística (transportadora), as sessões reais e a troca simultânea em duas conexões.
