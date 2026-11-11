# B02/B03 — recuperar acesso no Agricultor e no Cliente

**Pedido:** levar para o Agricultor (B02) e para o Cliente (B03) a recuperação de acesso feita na 01c da Logística (DOC 025). As duas tarefas passaram da frente Identidade para a frente Logística, que pode mexer só nas telas e rotas de sessão desses apps.

**Plano aprovado pelo Maestro:**
- Uma cópia da tela por app. A lógica usa `supabase.auth`, que não vai para `packages/ui`, que é só visual.
- Apagar a tela 46 Verificar código do Agricultor (sobra da demo de OTP), conferindo com grep que nada mais aponta para ela.
- Sem migration.

## O que foi feito

- **Agricultor:**
  - A tela 42 Recuperar acesso (`/recuperar-acesso`) deixou de mostrar "indisponível". Agora pede o e-mail (`resetPasswordForEmail`) e, depois, o código e a nova senha (`verifyOtp` do tipo `recovery`, seguido de `updateUser`). Ao terminar, segue para 03 Seu cadastro, como o login.
  - A 01 Entrar ganhou o link "Esqueci minha senha".
  - A tela 46 Verificar código foi apagada: a rota `app/(pre-auth)/verificar-codigo.tsx`, a pasta `screens/46-verificar-codigo/`, `rotasAgricultor.verificarCodigo` e a entrada 46 do catálogo. Um grep em `apps` e `packages` não encontra mais referência a ela, e as rotas tipadas regeneradas também não a listam.
- **Cliente:**
  - Tela nova 27 Recuperar acesso (`/recuperar-acesso`), com o mesmo fluxo. Ao terminar, segue a regra do login: comprador autorizado vai para Ofertas; caso contrário, para o cadastro da empresa. Se a consulta falhar, vai para o cadastro da empresa, porque a senha já foi trocada.
  - Entraram `app/(pre-auth)/recuperar-acesso.tsx`, `rotasCliente.recuperarAcesso`, a entrada 27 no catálogo e o link na 01 Entrar.
- Nos dois apps, a resposta ao pedido de código é a mesma exista a conta ou não; só o limite de envio (429) é avisado.

## Arquivos

- `apps/agricultor/screens/42-recuperar-acesso/RecuperarAcessoScreen.tsx`, `README.md`
- `apps/agricultor/screens/01-entrar/EntrarScreen.tsx`, `README.md`
- `apps/agricultor/routes.ts`
- Removidos: `apps/agricultor/app/(pre-auth)/verificar-codigo.tsx`, `apps/agricultor/screens/46-verificar-codigo/`
- `apps/cliente/screens/27-recuperar-acesso/RecuperarAcessoScreen.tsx` (novo), `apps/cliente/app/(pre-auth)/recuperar-acesso.tsx` (novo)
- `apps/cliente/screens/01-entrar/EntrarScreen.tsx`, `apps/cliente/routes.ts`

## Verificação

- `npm run typecheck`: limpo. As rotas tipadas foram regeneradas abrindo o Expo uma vez em cada app.
- `npx eslint .`: limpo.
- `npm test`: 18 testes do domínio e 43 do worker passaram.
- `expo export --platform web` do Agricultor e do Cliente: os dois bundles fecham sem erro.
- **Pendente, fica com o usuário:** ensaio em aparelho nos dois apps. Roteiro: recuperar a senha pelo código, entrar com a nova, reiniciar o app e ver a sessão restaurada, testar código inválido e abrir a URL direta de uma rota protegida sem sessão. Depende do modelo "Reset Password" com `{{ .Token }}` e, para usuários reais, de SMTP próprio (I04), ambos registrados no DOC 025.

## Decisões fora do pedido

- O Cliente não tem README por tela (a 25 e a 26 também não têm), então a 27 ficou sem.
- O código está repetido nos três apps (Logística, Agricultor e Cliente), como aprovado. Se o fluxo mudar, a mudança tem de ser feita nas três telas.
