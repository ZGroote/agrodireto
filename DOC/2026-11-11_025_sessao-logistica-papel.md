# B04 (restante) — recuperar acesso e ações por papel no app Logística

**Pedido:** frente Logística, terminar a B04: recuperar acesso e proteger ações por papel. A G04 até a G06 ficam de fora, porque dependem do pedido (F03).

**Plano aprovado pelo Maestro** com estas decisões:
- (a) A senha é recuperada por código enviado por e-mail, sem link para o app. A mudança no modelo "Reset Password" do Supabase é do Maestro e vale para os quatro apps.
- (b) Só o titular reenvia o cadastro; a frota fica aberta a qualquer membro.
- (c) O papel "motorista" fica para a G04/G05.
- (d) O ensaio em aparelho fica para o usuário.
- Ajuste pedido: `agrodireto_privado.e_titular(org)` é genérico (serve para qualquer organização), `stable`, com `search_path` fixo e execução só para `authenticated`. A frente Identidade vai reutilizar a função no B01.

## O que foi feito

- **Migration `20261111140000_papel_transportadora.sql`** (só funções, nenhuma tabela):
  - `agrodireto_privado.e_titular(uuid)`: diz se a conta é titular da organização, para qualquer tipo de organização.
  - `reenviar_cadastro_transportadora` passa a exigir titular (`create or replace`, mesma assinatura, os grants continuam). Um membro que não é titular recebe `insufficient_privilege` com uma mensagem clara. Quem é de fora continua recebendo PT409, para não revelar que a organização existe; o teste `transportadoras.sql` continua valendo.
- **Teste `supabase/tests/papel_transportadora.sql`** (`begin ... rollback`). Cobre:
  - `e_titular` para o titular, o membro e outra organização;
  - membro grava veículo e motorista, mas não reenvia o cadastro;
  - membro não grava na frota de outra empresa;
  - outra empresa recebe PT409 no reenvio;
  - **sem sessão** (claims sem `sub`, que é como chega um token expirado): enviar, reenviar, `salvar_veiculo` e `salvar_motorista` são todos recusados;
  - o titular reenvia;
  - privilégios e atributos (`stable`, `search_path`) de `e_titular` e do reenvio.
  - Ainda não existe fluxo para incluir membro (B01), então o teste insere o membro direto como dono do banco.
- **App Logística:**
  - Nova tela 01c Recuperar acesso (`/recuperar-acesso`), aberta pelo link "Esqueci minha senha" na Entrar. Primeiro pede o e-mail (`resetPasswordForEmail`); depois, o código e a nova senha (`verifyOtp` do tipo `recovery`, seguido de `updateUser`). Ao terminar, segue para o Início ou para o cadastro, como o login. A resposta é a mesma exista a conta ou não; só o limite de envio (429) é avisado.
  - `lib/supabase.ts`: `exigirSessao()` antes de cada gravação (envio do cadastro, veículo, motorista). O `getSession` renova o token; se não houver sessão válida, a gravação não sai e o Auth emite SIGNED_OUT, que o layout `(app)` já leva para Entrar.
  - `lib/transportadora.ts` passa a devolver o papel da conta. A tela 02 só deixa corrigir e reenviar para o titular; o membro vê o motivo do ajuste e o aviso de que só o titular reenvia.

## Arquivos

- `supabase/migrations/20261111140000_papel_transportadora.sql` (novo)
- `supabase/tests/papel_transportadora.sql` (novo)
- `apps/logistica/app/(pre-auth)/recuperar-acesso.tsx` (novo), `screens/01c-recuperar-acesso/` (novo: tela e README)
- `apps/logistica/routes.ts`, `screens/01-entrar/EntrarScreen.tsx` e `README.md`
- `apps/logistica/lib/supabase.ts`, `lib/transportadora.ts`, `lib/frota.ts`
- `apps/logistica/screens/02-transportadora/TransportadoraScreen.tsx`

## Verificação

- `npm run typecheck`: limpo nos workspaces. As rotas tipadas (`.expo/types`, que o git ignora) só reconhecem `/recuperar-acesso` depois de um `expo start`; quem rodar o typecheck num clone novo precisa abrir o Expo uma vez.
- `npx eslint .`: limpo.
- `npm test`: 18 testes do domínio e 43 do worker passaram.
- `expo export --platform web` do Logística: o bundle fecha sem erro.
- **Não rodado:** os testes SQL, porque esta máquina não tem Postgres nem Docker. Rodam no SQL Editor depois de aplicar a 110000 (G03) e a 140000.
- **Ensaio em aparelho: pendente, fica com o usuário** depois das migrations aplicadas e do modelo de e-mail ajustado. Roteiro:
  1. Criar conta.
  2. Cadastrar a transportadora.
  3. Cadastrar veículo e motorista.
  4. Sair e recuperar a senha pelo código.
  5. Entrar com a nova senha.
  6. Deixar o app parado até a sessão expirar, ou revogá-la no painel, e tentar salvar: o app deve voltar para Entrar.

## Pré-requisitos no Supabase `agro` (Maestro)

- O modelo de e-mail **"Reset Password"** precisa trazer `{{ .Token }}`. Sem isso o e-mail chega só com o link, e o app não tem como usá-lo.
- **SMTP:** o SMTP padrão do Supabase só envia para poucos endereços e tem limite baixo de e-mails por hora. Serve para homologação, não para usuários reais. **Um SMTP próprio é pré-requisito do piloto (I04)**, para recuperação de senha e confirmação de conta nos quatro apps.

## Decisões fora do pedido

- O membro que não é titular recebe uma recusa clara no reenvio; quem é de fora continua com PT409 genérico.
- O campo do código aceita de 6 a 10 dígitos, porque o tamanho do código de e-mail é configurável no Supabase. Não usei o `OTPInput`, que tem tamanho fixo.
- A 01c não entrou no catálogo de telas do mockup em `routes.ts`, assim como a 01b.
- Quem confirma o código já fica logado, mesmo que saia antes de trocar a senha. É o comportamento padrão do Supabase.
- Gravação sem rede: o `exigirSessao` mostra "sessão expirou" e não volta para Entrar, porque o Auth não encerra a sessão por falha de rede.
