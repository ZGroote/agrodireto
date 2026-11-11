# Ampliação do piloto

**Data:** 11/11/2026 (America/Sao_Paulo).
**Pedido:** ampliar o piloto a partir do *Documento Mestre de Evolução e Expansão* (v1.1, 10/11/2026), produzido no ChatGPT e compartilhado pelo usuário.

## Escopo escolhido pelo usuário

- **Segmentos:** hortifrúti, grãos e commodities, pecuária e origem animal, agroindústria.
- **Comercial:** demandas do comprador com matching, AgroDireto Pay com split, compras recorrentes.
- **Rastreabilidade e inteligência:** QR de rastreabilidade, inteligência de mercado, indicadores de ODS, compras institucionais.
- **Base de dados:** organizações com membros e papéis e várias propriedades por organização, com a mudança feita agora.
- **Fica fora:** lotes coletivos.

## O que foi feito

- `tasks/plan.md`: aviso na seção 3 e seção 12 nova, com escopo, impacto na base já construída, ordem sugerida, decisões novas e riscos.
- `tasks/todo.md`: ajustados A01, B01, B05, C01 e G01. Tarefas novas: D09, D10, D11, E03, E04, F05, G07, G08 e H05, além da etapa 5A com J01, J02 e J03. O backlog passa de 43 para 55 tarefas.

Nenhum código ou migration foi alterado. A implementação depende da aprovação deste plano, conforme o `CLAUDE.md`.

## Decisões fora do pedido

- Organização e várias propriedades por usuário foram encaixadas nas tarefas B01 e C01, que já previam empresa e membro, em vez de virar tarefa nova duplicada.
- A troca de `propriedades.usuario_id` (chave primária) deve ser uma migration nova. As anteriores podem já estar aplicadas na homologação.
- Recomendação a confirmar com a operação: liberar os segmentos a usuários reais em ondas (primeiro hortifrúti e grãos, depois pecuária/origem animal e agroindústria). A plataforma suporta os quatro desde o início.
- O documento mestre não foi copiado para o repositório. Ele está no link compartilhado e circula no grupo do projeto.

## Verificação

Mudança só de documentação. Typecheck do Administrador conferido: zero erros.

## Próximo passo

Aprovar o plano revisado. Depois, B01/C01: migration de organizações e várias propriedades, antes de existir dado real.
