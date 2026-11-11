# Memória — última ação

Em 11/11/2026, à tarde, o trabalho foi dividido em três frentes paralelas no Maestri (regras em `DOC/2026-11-11_020_frentes-paralelas.md`). Cada frente tem um andar (worktree) com ramo próprio, criado a partir do `main`:

| Agente | Conta | Ramo | Primeira tarefa |
|---|---|---|---|
| Oferta (Claude Code, effort medium) | jaogroote | `frente/oferta-midia` | D01 |
| Logistica (Claude Code, effort medium; a conta Codex "trabalho" estava com menos de 5% do limite semanal) | Padrão (Claude) | `frente/logistica` | G03 |
| Identidade (Codex, reasoning medium) | Padrão | `frente/identidade` | C04 |

Os andares ficam em `../.maestri/floors/`. O Maestri copiou o `node_modules` sem as pastas `dist` (que estão no `.gitignore`), por isso cada andar foi reinstalado com `npm ci`. Os testes do worker passaram em todos (43/43).

Arquivos: `DOC/2026-11-11_020_frentes-paralelas.md`, `DOC/README.md` e este arquivo.

Status: D01 (Oferta) e G03 (Logística) juntadas no `main` (typecheck, lint e testes 18 + 43 passando). As migrations `20261111100000_culturas.sql` e `20261111110000_veiculos_motoristas.sql` ainda NÃO foram aplicadas no `agro`, e os testes `supabase/tests/culturas.sql` e `veiculos_motoristas.sql` nunca rodaram. O catálogo de culturas está vazio até o usuário escolher as culturas do piloto. C04 (Identidade) em andamento; D02 (Oferta) em plano. Próximo passo: aplicar as duas migrations e rodar os testes quando o usuário fizer login no Supabase.
