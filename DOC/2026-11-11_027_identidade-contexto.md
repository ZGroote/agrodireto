# B01 — Etapa 1: membros e contrato de contexto auditado

Data: 11/11/2026. Frente Identidade, ramo `frente/identidade`, atualizado com `main` em `613f1c8` antes desta etapa.

## Pedido e plano aprovado

Completar primeiro o contrato de servidor de B01, reutilizando as organizações existentes e `agrodireto_privado.e_titular` do DOC 025. O Maestro aprovou expressamente a escrita da migration `20261111150000`, do teste SQL e deste DOC, antes da implementação.

Ajustes aprovados: uma única tabela `trocas_contexto`; contexto atual derivado da última troca por usuário/perfil; inclusão por e-mail com resposta igual para conta existente ou inexistente; nenhum convite ou promoção; reenvio do comprador exclusivo do titular. Integração de telas fica para planos posteriores, um perfil por vez.

## Arquivos e contrato

- `supabase/migrations/20261111150000_identidade_contexto.sql` (novo).
- `supabase/tests/identidade_contexto.sql` (novo, transação com rollback).
- Este DOC. Nenhum app, pacote compartilhado ou migration anterior foi alterado.

### Inclusão de membros

`incluir_membro(p_organizacao uuid, p_email text) → void`: exige sessão e titular da organização, reutilizando `e_titular`. Compara e-mail sem distinguir maiúsculas, removendo espaços externos. Se a conta existir, insere `membro`; repetição não altera o vínculo, inclusive quando a conta já é titular. E-mail ausente, vazio, nulo ou já vinculado recebe a mesma resposta vazia. Não retorna UUID, e-mail ou indicador de existência. Não envia convite e não muda `equipe_agrodireto`.

A consulta a `auth.users` fica dentro da função com `security definer` e `search_path` vazio. Grants de escrita direta em `membros_organizacao` continuam negados. A RLS existente continua mostrando apenas o próprio vínculo ao usuário comum, inclusive titular; não se abriu uma lista de destinatários para inferir a existência de e-mails. A futura UI deve usar confirmação neutra, por exemplo: “Solicitação processada. Se a conta existir, o vínculo estará disponível.”

### Vínculos e aprovação

`listar_meus_vinculos() → tabela`: retorna somente vínculos de `auth.uid()`, com `organizacao_id`, `nome`, `perfil`, `papel`, `status_cadastro` e `propriedades_aprovadas`.

`status_cadastro` vem do cadastro do comprador/transportadora; para produtor é nulo porque a aprovação pertence a cada propriedade. `propriedades_aprovadas` é a contagem de propriedades aprovadas da organização, não uma autorização para operar qualquer propriedade. Nenhum estado de aprovação é inventado ou copiado para a organização.

### Contexto e histórico

`trocas_contexto` contém somente `usuario`, `perfil`, `organizacao_origem`, `organizacao_destino` e `em`. Chave primária `(usuario, perfil, em)` atende também à busca da última troca. RLS permite ao usuário ler apenas suas trocas. Cliente não insere, altera ou apaga linhas diretamente; apenas `trocar_contexto` grava eventos. A equipe não ganha leitura adicional nesta etapa.

`trocar_contexto(p_perfil text, p_organizacao uuid) → uuid`: aceita `produtor`, `comprador` ou `transportadora`; exige vínculo atual e tipo compatível. O destino não precisa estar aprovado, pois o usuário precisa selecionar o cadastro para acompanhar/corrigir a análise. A aprovação continua sendo exigida por cada operação sensível.

O servidor determina usuário, origem e data. A primeira troca tem origem nula. Repetir o destino atual não duplica evento. Um advisory lock por usuário/perfil serializa trocas concorrentes; o horário avança no mínimo um microssegundo em relação ao anterior para desempate. O vínculo e a organização de destino são bloqueados para leitura durante a gravação. Concorrência real entre duas conexões ainda requer ensaio no banco; o teste SQL de uma conexão cobre sequência, repetição e invariantes.

`contexto_atual(p_perfil text) → uuid ou null`: lê a última troca e confirma vínculo/tipo atuais. Sem seleção anterior ou depois de perder o vínculo, retorna nulo; não faz fallback para organizações antigas. Nenhuma sessão retorna erro, não contexto público. Trocas de um perfil não mudam outros perfis.

Contexto é preferência de seleção persistida por conta/perfil, portanto compartilhada entre dispositivos. **Não é autorização**: as operações devem continuar recebendo IDs explícitos e verificando vínculo/papel no servidor. As telas futuras devem descartar dados do contexto anterior e tratar perda de vínculo. Não foi implementada inferência de contexto por “primeiro cadastro”.

As FKs de origem/destino não apagam histórico em cascata quando uma organização é excluída: a exclusão fica impedida enquanto houver referências. Não foi criado fluxo de exclusão/retenção; H01 deve coordenar essa política. A exclusão da conta segue `ON DELETE CASCADE`, como os vínculos existentes.

### Reenvio do comprador

`reenviar_cadastro_comprador` foi substituída com `create or replace`, mantendo assinatura e grants. Membro sem titularidade recebe `insufficient_privilege`; terceiro/sem sessão conserva PT409 genérico. Titular mantém o ciclo de correção, versão enviada e atualização do nome da organização, como no contrato anterior. A transportadora já usa essa regra na migration `20261111140000`.

## Verificação

- `npm test`: 61 testes existentes passaram, 18 de domínio e 43 do worker, incluindo FFmpeg real. Executado fora do sandbox conforme autorização já existente para subprocessos Node.
- `npx eslint .` na raiz: passou.
- `npm run typecheck`: passou em todos os workspaces. A primeira execução encontrou tipos locais do Expo desatualizados para `/recuperar-acesso` em Cliente/Logística, após o merge. Regenerados iniciando Expo offline nos dois apps, conforme DOC 025; só arquivos `.expo` ignorados foram atualizados. Os servidores temporários foram encerrados após a geração.
- `git diff --check`: sem problemas.
- Não houve mudança de app/build; export web não necessário nesta etapa SQL.
- **SQL não executado nesta sessão:** sem Postgres/Docker local ou conector Supabase. A migration não foi aplicada no `agro` por este agente. Aplicação e testes ficam com o Maestro; testes unitários existentes não comprovam o SQL novo.

O teste novo cobre inclusão por e-mail normalizado, resposta neutra, idempotência, preservação de titular, vínculo múltiplo, recusa a membro/terceiro/sem sessão, RLS entre contas, bloqueio de promoção e de escrita direta, contextos independentes por perfil, autor/origem/destino/data, repetição sem evento, perfil inválido/incompatível, revogação sem fallback, reenvio do comprador por titular e versão antiga, grants e atributos das funções.

Roteiro do Maestro: aplicar a migration após a `20261111140000`; executar `identidade_contexto.sql`, `compradores.sql`, `transportadoras.sql`, `papel_transportadora.sql` e `propriedades.sql`. Cada teste utiliza dados temporários e rollback. Validar também duas trocas concorrentes do mesmo usuário/perfil em conexões separadas antes de liberar a integração.

## Dependências e decisões

Entrega somente da etapa 1; **B01 não está concluída**. Ainda faltam UI de inclusão por e-mail e seleção explícita, integração de contexto por perfil, testes com sessões reais e demonstração entre apps.

Conforme DOC 015 e aprovação do Maestro, esta entrega não abre lotes/evidências de terceiros para membros. Esses fluxos ainda usam `produtor_id`; a frente Oferta deve coordenar a passagem para permissões organizacionais antes de liberar gestão coletiva. Acesso aos cadastros/propriedades já permitido pela RLS existente não foi ampliado nesta migration.

Sem alteração de esquema de `organizacoes`, `membros_organizacao` ou `equipe_agrodireto`; inclusão em `membros_organizacao` só pela RPC aprovada. Sem novas bibliotecas, convites, remoção de membros, transferência de titularidade ou promoção administrativa. `tasks/todo.md`, `memoria.md` e `DOC/README.md` permanecem sob responsabilidade do Maestro.
