# Pesquisa das decisões do piloto ampliado

**Data:** 11/11/2026 (America/Sao_Paulo).
**Pedido:** pesquisar e organizar, com fontes oficiais, as decisões de negócio e regulatórias que travam o piloto ampliado (tabela de `tasks/plan.md` §12.4 e tarefa A01 de `tasks/todo.md`). Sem escrever código.

## Plano

Levantar cinco temas: documentos obrigatórios por segmento, PSPs com split, fontes de preço de referência, PAA/PNAE e critério legal de pequeno produtor para ODS. Para cada um, trazer opções, recomendação, o que precisa de profissional e links.

## O que foi feito

- Pesquisa em fontes oficiais (Planalto, gov.br, MAPA, FNDE, Conab, CEAGESP, documentação dos PSPs). Páginas bloqueadas ou não lidas ficaram marcadas como **[Busca]** ou **[Não verificado]** no documento.
- Documento único com a pesquisa: [pesquisa-decisoes-piloto-ampliado.md](pesquisa-decisoes-piloto-ampliado.md). O usuário aprovou o documento em 11/11/2026.

Resumo das recomendações:

- **Documentos por segmento:** guardar como configuração (nome, quando exige, validade, quem confere); a plataforma nunca declara o vendedor regular. Em pecuária, começar só por produto de origem animal com inspeção registrada; animal vivo depois.
- **PSP:** pedir proposta por escrito a Asaas e Pagar.me. Antes, um advogado de pagamentos precisa confirmar que "sem custódia" fica fora das regras do Banco Central (Resolução BCB 150/2021). Nenhuma tarifa ficou confirmada.
- **Preço de referência:** começar pela Conab; CEAGESP e Cepea só com autorização escrita.
- **PAA/PNAE:** a plataforma organiza documentos, vencimento do CAF e limite indicativo; nunca mostra "elegível".
- **Pequeno produtor e ODS:** usar "vendedores com CAF ativo" (Lei 11.326 e Decreto 9.064); não calcular os indicadores oficiais 2.3.1 e 2.3.2.

## Arquivos alterados

- `DOC/pesquisa-decisoes-piloto-ampliado.md` (novo)
- `DOC/2026-11-11_016_pesquisa-decisoes-piloto-ampliado.md` (este registro)
- `DOC/README.md` (uma linha no índice)
- `memoria.md` (última ação)

## Verificação

Mudança só de documentação; nenhum código foi alterado, então `tsc` e lint não se aplicam. Os links do documento vêm das páginas consultadas; não foi feita checagem automática de links.

## Decisões fora do pedido

- O pedido original dizia para não editar `DOC/README.md`, `memoria.md` nem `tasks/` porque outra sessão trabalhava na pasta. Os dois primeiros foram atualizados agora a pedido direto do usuário. `tasks/` não foi tocado: A01 e as demais tarefas continuam sem referência a esta pesquisa.
- Oito leituras de página foram feitas por subagentes de leitura; nenhum alterou arquivos do projeto.
- Não pesquisados: tributação (ICMS, Funrural, ISS da comissão), contratos de commodities, CPR, armazenagem, LGPD em profundidade e a política de dados públicos do QR (H05).
- Nenhuma conta foi criada em PSP e nenhum dado foi enviado a serviço externo.
