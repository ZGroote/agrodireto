# Memória — última ação

Em 11/11/2026, à tarde, o trabalho foi dividido em três frentes paralelas no Maestri (regras em `DOC/2026-11-11_020_frentes-paralelas.md`). Cada frente tem um andar (worktree) com ramo próprio, criado a partir do `main`:

| Agente | Conta | Ramo | Primeira tarefa |
|---|---|---|---|
| Oferta (Claude Code, effort medium) | jaogroote | `frente/oferta-midia` | D01 |
| Logistica (Claude Code, effort medium; a conta Codex "trabalho" estava com menos de 5% do limite semanal) | Padrão (Claude) | `frente/logistica` | G03 |
| Identidade (Codex, reasoning medium) | Padrão | `frente/identidade` | C04 |

Os andares ficam em `../.maestri/floors/`. O Maestri copiou o `node_modules` sem as pastas `dist` (que estão no `.gitignore`), por isso cada andar foi reinstalado com `npm ci`. Os testes do worker passaram em todos (43/43).

Arquivos: `DOC/2026-11-11_020_frentes-paralelas.md`, `DOC/README.md` e este arquivo.

Status: D01 (Oferta), G03 e o restante da B04 (Logística) juntados no `main` (typecheck, lint e testes 18 + 43 passando). NÃO aplicadas no `agro`: `20261111100000_culturas.sql`, `20261111110000_veiculos_motoristas.sql` e `20261111140000_papel_transportadora.sql`. Testes a rodar depois: `culturas.sql`, `veiculos_motoristas.sql`, `papel_transportadora.sql` e de novo `transportadoras.sql`. Também falta pôr `{{ .Token }}` no template "Reset Password" do Auth. Catálogo de culturas vazio até o usuário escolher as culturas do piloto. C04 (Identidade) e D02 (Oferta) em andamento. Próximo passo: aplicar tudo isso quando o usuário fizer login no Supabase.
