# B05 — Etapa 2: papéis no app Administrador

Data: 11/11/2026. Frente Identidade, ramo `frente/identidade`, com `main` mesclado em `19e6693` antes desta etapa.

## Pedido e plano aprovado

Usar no app os papéis da etapa 1 (DOC 034). O plano aprovado:
- a tela 18 mostra o que cada papel pode, só para leitura;
- um bloco fora do mockup concede, troca e revoga acesso por e-mail;
- menus e abas escondem o que o papel não pode.

Decisões do Maestro:
- **(a)** Telas que ainda não chamam o servidor ficam só para o geral (menor privilégio), até a ação delas entrar na matriz.
- **(b)** Os toggles e o botão "Salvar" do mockup viram "Pode/Não pode" só de leitura, com o desvio registrado aqui.

## Feito (só `apps/administrador`; sem migration)

- **`lib/equipe.ts` (novo):**
  - Listas de papéis e de ações.
  - `MATRIZ`: cópia da matriz de `equipe_pode`, usada só para esconder telas e para a tela 18. Quem decide é o servidor.
  - `pode(papel, ação)`. A ação `sem_acao_no_servidor` vale só para o geral, como no `equipe_pode`, que dá a ação desconhecida apenas ao geral.
  - `papelEquipe()` (via `papel_equipe`), `listarEquipe`, `concederAcesso` e `revogarAcesso`.
- **`components/PapelEquipe.tsx` (novo):**
  - O contexto com o papel da conta.
  - `usePode()`.
  - `Permitido`: quem abre uma tela fora do papel pela URL direta vê "Sem permissão para esta área". O servidor nega de qualquer jeito.
- **`app/(app)/_layout.tsx`:** passa a ler `papel_equipe()` em vez de só `acesso_equipe()`. Papel nulo significa sem acesso autorizado, inclusive sem segundo fator quando ele é exigido, e manda para Entrar como antes. Entrar e Verificação não mudaram.
- **Rotas envolvidas por `Permitido`:**

| Tela | Ação |
|---|---|
| Cadastros (aba) e 05 Analisar cadastro | `ler_cadastros` (todos) |
| 06 Documentos e mídias, 09 Inspeções, 10 Inspecionar | `revisar_ofertas` |
| 18 Papéis e permissões | `ler_equipe` (geral e auditor) |
| Operação, Alertas, 07, 08, 12, 14, 15, 16, 17, 19–23 | `sem_acao_no_servidor` (só geral) |

- **Abas:** Operação e Alertas somem (`href: null`) para quem não é geral.
- **03 Início:** atalhos só para o papel que pode.
- **24 Configurações:** a seção "Administração" mostra "Papéis e permissões" para geral e auditor, e o resto só para o geral.
- **05 Analisar cadastro:** os botões de aprovar e pedir ajustes aparecem só com `escrever_cadastros`. Os demais papéis veem "Seu papel permite consultar, mas não aprovar ou pedir ajustes."
- **18 Papéis e permissões:**
  - "Função" lista os 7 papéis reais. Para o papel escolhido, cada ação aparece com "Pode" ou "Não pode".
  - Bloco "Equipe" (fora do mockup): lista e-mail, papel e data.
  - Só o geral vê o formulário (e-mail + papel + "Conceder acesso") e o botão "Revogar" em cada linha, nunca na própria conta. O auditor só consulta.
  - Mensagens: "Acesso concedido." e "Nenhuma conta com este e-mail.". Os erros `42501` e `PT422` têm texto próprio.
- **`test/equipe.test.cjs` (novo, 4 casos)** e script `test` no `package.json` do Administrador:
  - paridade `MATRIZ` × migration: lê o `CASE` da `20261111210000` e compara com a cópia do app;
  - `pode`;
  - `papelEquipe` só com papéis conhecidos;
  - conceder e revogar.

## Desvio do mockup (aprovado)

Na tela 18, o mockup mostra toggles por permissão e o botão "Salvar permissões". Eles saíram, porque a matriz é fixa no servidor (`equipe_pode`) e editar pela tela daria a falsa impressão de mudar permissões. No lugar ficou "Pode/Não pode" só de leitura para as 7 ações reais. "Função" e o layout da seção "Permissões" seguem o mockup.

## Ajustes em relação ao plano

- **06 Documentos e mídias** ficou com `revisar_ofertas`, não `ler_ofertas`: a fila da tela usa `listar_evidencias_pendentes`, que exige `revisar_ofertas`. Com `ler_ofertas`, o comercial abriria a tela e receberia erro.
- **07, 08, Operação/11–13 e 23 Auditoria** ficaram só para o geral, não com `ler_ofertas`, `ler_frota` ou `ler_equipe`. Essas telas ainda não chamam o servidor, e a regra (a) diz só geral. Quando forem integradas, cada uma passa para a ação real.

## Verificação

- `npm test` na raiz: Administrador 4 (novos), Agricultor 18, Cliente 5, Logística 4, domínio 18, worker 44, sem falhas.
- O teste de paridade foi conferido: com uma alteração temporária na `MATRIZ` (financeiro com `ler_frota`), ele falhou; depois foi revertido.
- `npx eslint .` passou.
- `npm run typecheck` passou. Os tipos de rota do Expo foram regenerados subindo o Expo offline por um instante.
- `git diff --check` não apontou problemas.
- O SQL não mudou. O ensaio com contas de papéis diferentes no `agro` fica com o Maestro; o ensaio em aparelho, com o usuário. Pontos do ensaio:
  - o comercial não vê Inspeções e não tem os botões de aprovar;
  - o auditor vê a equipe sem formulário;
  - o geral não consegue revogar a si mesmo;
  - a conta revogada cai para Entrar na próxima validação.

## Pendências

- Telas sem ação no servidor passam para o papel certo quando forem integradas: negociação (F), logística (G) e financeiro.
- **B05:** falta ligar o segundo fator no `agro` (decisão do usuário, no primeiro cliente) e fazer o ensaio com contas reais.
