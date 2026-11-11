# C04 — Aprovação de cadastros empresariais

Pedido: completar a operação de cadastros de comprador e transportadora no Administrador, no ramo `frente/identidade`.

Plano enviado ao Claude Code pelo Maestri e aprovado antes de codar: integrar transportadoras à lista e análise; aproveitar a aprovação de comprador existente; mostrar autor e data da última decisão; verificar tipos, lint, testes e export web. Sem migration ou bibliotecas novas.

## Implementação

- Lista consulta propriedades, compradores e transportadoras reais pendentes; estado vazio considera os três grupos.
- Transportadora mostra CNPJ, contato, sede, estados atendidos e tipos de carga; aprova ou solicita ajustes pela RPC existente, com motivo obrigatório apenas nos ajustes.
- Comprador e transportadora mostram autor (UUID real) e data local da última decisão retornada pelo banco, além do motivo dos ajustes. Não há nome de autor inventado nem acesso adicional a perfis.
- Após revisar, a tela relê o cadastro para mostrar a decisão persistida. Caso essa leitura falhe, informa que a revisão foi salva e impede novo envio. Conflitos PT409 continuam orientando reabrir a versão atual.
- Trocar tipo/ID reinicia o formulário; tipo desconhecido não cai no fluxo de propriedade. Propriedade mantém o fluxo anterior.

Arquivos: `apps/administrador/lib/compradores.ts`, `lib/transportadoras.ts` (novo), `routes.ts`, `screens/04-cadastros/CadastrosScreen.tsx` e `screens/05-analisar-cadastro/AnalisarCadastroScreen.tsx`.

## Contrato e limites do aceite

`cadastros_comprador` e `cadastros_transportadora` já têm `aprovada_por`, `aprovada_em`, `ajuste_solicitado_por`, `ajuste_solicitado_em` e `motivo_ajuste`. As RPCs `revisar_cadastro_comprador` e `revisar_cadastro_transportadora` usam identidade/data do servidor, exigem acesso de equipe e comparam estado e versão enviada. Não houve alteração de banco ou dos pacotes compartilhados.

Decisão expressa do Maestro: aprovação não exige motivo; ajustes exigem. Histórico permanente após reenvio pertence a H01. Ao reenviar, o contrato atual apaga a decisão de ajustes anterior; esta entrega mostra a última decisão disponível, não um histórico.

Publicação já exige propriedade aprovada: `supabase/migrations/20261111080000_organizacoes.sql:188–209`, função `publicar_oferta_lote`, filtra propriedade aprovada de organização da qual o usuário é membro e repete a checagem com bloqueio `FOR SHARE`, lançando PT403 se não aprovada. Regra de compra depende de F01; não confundir acesso ao catálogo com autorização de compra.

## Verificação

- `npx tsc --noEmit` em `apps/administrador`: passou.
- `npx eslint apps/administrador` e `npx eslint .` a partir da raiz: passaram. A execução de `npx eslint .` dentro do app acusa 47 aliases não resolvidos porque `eslint.config.js` usa caminhos relativos à raiz; executar o lint na raiz respeita a configuração existente.
- `npm test`: 61 testes passaram (18 domínio, 43 mídia, incluindo FFmpeg real). Primeira tentativa foi bloqueada por `spawn EPERM` no sandbox; repetição autorizada fora dele passou.
- Export web do Administrador com `CI=true`, `EXPO_OFFLINE=1`, `npx expo export --platform web --output-dir dist`: bundle gerado e mensagem `Exported: dist`; artefatos locais ignorados pelo Git.
- Revisão do diff: contratos das RPCs preservados, sem dados fictícios, sem migration e sem mudanças fora da frente.
- Segundo informação do Maestro em 11/11, `supabase/tests/compradores.sql` e `supabase/tests/transportadoras.sql` passaram hoje no `agro` após aplicar as migrations 085000 e 087000. Não foram executados por este agente; o Maestro repetirá ambos junto com o merge.
- Ensaio pela interface com contas reais permanece **pendente de contas de homologação**, conforme orientação expressa. Roteiro: listar pendências dos três tipos; pedir ajustes com motivo; conferir autor/data e status no app de origem; corrigir e reenviar; aprovar; conferir status remoto; testar repetição/versão antiga, usuário comum e falha de conexão. Build e testes unitários não substituem esse ensaio.

## Decisões e entrega

Sem ampliação de escopo. Tipos da transportadora ficam locais ao Administrador para respeitar a propriedade dos pacotes compartilhados. O identificador do autor é exibido como ID. `tasks/todo.md`, `memoria.md` e `DOC/README.md` ficam a cargo do Maestro, conforme DOC 020. Entrega técnica para integração; aceite completo entre perfis depende do ensaio descrito acima e a regra de compra permanece vinculada a F01.
