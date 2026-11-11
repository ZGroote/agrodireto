# Frentes paralelas no Maestri

**Pedido:** dividir o trabalho em frentes com agentes em paralelo, em nível médio de raciocínio, usando as contas que ainda têm limite. A outra pessoa não vai usar o git por enquanto.

## Estrutura

Um Maestro (Claude Code, andar térreo) e um agente por andar. Cada andar é um worktree com ramo próprio, criado a partir do `main`.

| Frente | Tarefas | Pode mexer em |
|---|---|---|
| Oferta e mídia | D01, D02, D07, D08, E00, E01, E02 | `apps/agricultor`, `apps/cliente`, `services/midia-worker` |
| Logística | G03, G04, G05, G06, G08 (e o que falta de B04) | `apps/logistica` |
| Identidade e operação | B01, B05, C01, C04 (B02 e B03 passaram para a Logística em 11/11) | `apps/administrador`, telas de sessão dos apps |

Ficam fora por enquanto: negociação (F) e pagamento (G01, G02, G07), que dependem de lote publicado (E01).

## Regras

1. Uma tarefa por vez. Antes de codar, mostrar o plano curto ao Maestro.
2. `supabase/`, `packages/dominio` e `packages/ui`: só o Maestro altera. Migration de tabela nova da própria frente pode ser escrita no ramo, mas quem aplica no Supabase `agro` é o Maestro. Mudança em tabela compartilhada (organizações, perfis, propriedades) é pedida ao Maestro.
3. Tarefa pronta = aceite do `tasks/todo.md` demonstrado + `npx tsc --noEmit`, `npx eslint .` e testes passando, com commit no ramo do andar. Quem junta no `main` é o Maestro.
4. Não editar `tasks/todo.md`, `memoria.md` nem `DOC/README.md` (o Maestro atualiza ao juntar). O registro da tarefa vai num DOC novo com o número que o Maestro indicar.
5. Não instalar biblioteca sem aprovação.
6. Ao terminar ou travar, avisar o Maestro com `maestri ask "Claude Code" "<resultado>"`.
