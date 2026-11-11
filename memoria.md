# Memória — última ação

Em 11/11/2026, à tarde, o trabalho foi dividido em três frentes paralelas no Maestri (regras em `DOC/2026-11-11_020_frentes-paralelas.md`). Cada frente tem um andar (worktree) com ramo próprio, criado a partir do `main`:

| Agente | Conta | Ramo | Primeira tarefa |
|---|---|---|---|
| Oferta (Claude Code, effort medium) | jaogroote | `frente/oferta-midia` | D01 |
| Logistica (Claude Code, effort medium; a conta Codex "trabalho" estava com menos de 5% do limite semanal) | Padrão (Claude) | `frente/logistica` | G03 |
| Identidade (Codex, reasoning medium) | Padrão | `frente/identidade` | C04 |

Os andares ficam em `../.maestri/floors/`. O Maestri copiou o `node_modules` sem as pastas `dist` (que estão no `.gitignore`), por isso cada andar foi reinstalado com `npm ci`. Os testes do worker passaram em todos (43/43).

Arquivos: `DOC/2026-11-11_020_frentes-paralelas.md`, `DOC/README.md` e este arquivo.

Status: D01 (Oferta) juntada no `main` (typecheck, lint e testes 18 + 43 passando); a migration `20261111100000_culturas.sql` ainda NÃO foi aplicada no `agro` e `supabase/tests/culturas.sql` nunca rodou. O catálogo de culturas está vazio até o usuário escolher as culturas do piloto. G03 (Logística) e C04 (Identidade) em andamento. Próximo passo: aplicar a migration e rodar o teste quando o usuário fizer login no Supabase.
