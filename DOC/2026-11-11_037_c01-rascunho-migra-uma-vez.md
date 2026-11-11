# C01 — Rascunho de propriedade migra uma vez

Data: 11/11/2026. Frente Identidade, ramo `frente/identidade`, com `main` mesclado em `8bcb4bf` antes desta etapa.

## Pedido

Fechar o item "rascunho antes do cadastro migra uma vez" da C01. Os dados de propriedade feitos antes do cadastro vão para o servidor uma única vez, sem duplicar e sem apagar antes de confirmar.

## O que o código mostrava

- **Não há coleta de propriedade antes do cadastro.** Onboarding e Paywall não pedem dados. A tela 26 (Editar propriedade) fica em `(app)`, com sessão, e `lerRascunhoPropriedade` exige sessão.
- **Único dado sem conta:** a chave antiga `@agrodireto/agricultor/propriedade-rascunho/v1`, de versões anteriores. `lerRascunhoPropriedade` já a copia para a primeira conta que lê, com trava `dono-legado`, e só depois apaga a chave antiga. Isso é local → local.
- **Ida ao banco:** só pelo botão "Enviar para análise" (`enviar_propriedade`, idempotente por organização + nome). O rascunho local nunca era apagado depois do envio.

## Decisão (Maestro, 11/11)

**Opção (1) aprovada.** O rascunho do aparelho, inclusive o herdado da chave antiga, conta como o "rascunho antes do cadastro":
- vai ao servidor pelo envio, que continua manual;
- é apagado só depois de o servidor confirmar.

A condição do Maestro: depois que o local for apagado, a correção após "ajustes solicitados" tem de abrir os dados do servidor.

**Opção (2): decisão pendente do usuário.** Uma tela nova no pré-auth (por exemplo, "Sua propriedade" depois do Onboarding) gravaria na chave sem conta, e o app enviaria para análise automaticamente logo após criar a conta, marcando como migrado. Isso muda o fluxo Onboarding → Paywall → Auth, não tem mockup e manda para análise sem o usuário tocar em "Enviar". Fica para o usuário decidir; nada disso foi feito.

## Feito (só `apps/agricultor`; sem migration)

- **`lib/rascunhoPropriedade.ts`:** `removerRascunhoPropriedade()`, que remove só a chave da conta.
- **`lib/propriedadeRemota.ts`:**
  - `enviarRascunhoPropriedade(rascunho)`: chama `enviarPropriedade`. Só se ele concluir sem erro (o servidor devolveu o id e, no primeiro envio, a troca de contexto deu certo), apaga o local.
  - Qualquer falha antes disso mantém o local: rede, validação, `23514`, troca de contexto.
  - Se a remoção falhar depois do envio confirmado, o erro é ignorado; a tela passa a mostrar a propriedade enviada.
  - `lerFormularioPropriedade(corrigir)`: com `corrigir`, lê a propriedade do **servidor** (`lerPropriedadeEnviada`) e devolve os campos e a revisão (`enviada_em`); se o status não for "ajustes solicitados", devolve `null` e a tela volta. Sem `corrigir`, devolve o rascunho local ou o formulário vazio.
- **04 Minha propriedade:** o botão "Enviar propriedade para análise" usa `enviarRascunhoPropriedade`.
- **26 Editar propriedade:** usa `lerFormularioPropriedade`. O comportamento é o de antes: a correção já lia do servidor, e agora isso fica na `lib`, coberto por teste.
- **`test/rascunhoPropriedade.test.cjs` (novo, 4 casos):** o código real, com AsyncStorage em memória e Supabase falso.
  - A chave antiga vai para a primeira conta e não para a segunda. Se a cópia falhar, a chave antiga continua, porque nada é apagado antes.
  - O envio confirmado apaga o local. Falha no envio (`XX000`, `23514`) ou na troca de contexto do primeiro envio mantém.
  - Uma nova tentativa repete organização e nome. Com isso o servidor devolve a mesma propriedade (`on conflict (organizacao_id, lower(nome))`, já coberto em `supabase/tests/propriedades.sql`).
  - Correção após ajustes, **sem nenhum rascunho local**, abre os dados do servidor com a revisão. Sem ajustes, volta. Formulário novo vem vazio.
- **`test/organizacao.test.cjs`:** ganhou um stub de `./rascunhoPropriedade`, porque `propriedadeRemota.ts` agora importa funções desse módulo, e não só o tipo.

## Verificação

- `npm test` na raiz: Administrador 4, Agricultor 22 (4 novos), Cliente 5, Logística 4, domínio 18, worker 44, sem falhas.
- `npx eslint .` e `npm run typecheck` passaram.
- `git diff --check` não apontou problemas.
- O SQL não mudou.
- **Ensaio em aparelho (usuário):**
  1. editar e fechar o app (o rascunho continua);
  2. enviar sem rede (o rascunho continua);
  3. enviar com rede (o rascunho some e a propriedade aparece em análise);
  4. depois de "ajustes solicitados", Corrigir abre os dados enviados.

## Pendências da C01

- Opção (2) (coleta antes do cadastro): decisão do usuário.
- Tela para escolher entre várias propriedades da organização: a 04 ainda mostra a primeira.
- Ensaio completo pela interface.
