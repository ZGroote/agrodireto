# 001 — Setup do CLAUDE.md, memoria.md e DOC

**Data:** 2026-11-05

## Pedido
Criar o `CLAUDE.md` com as regras do projeto AGRODIRETO, um `memoria.md` que
guarda sempre a última ação, e uma pasta `DOC/` registrando todos os passos.

## O que foi feito
- `CLAUDE.md` criado na raiz com as regras fornecidas.
- Adicionada a seção "Memória e documentação" ao `CLAUDE.md`, para que a
  atualização do `memoria.md` e do `DOC/` aconteça em toda sessão.
- Adicionados `mockups/`, `DOC/` e `memoria.md` à seção "Estrutura".
- `memoria.md` criado com a ação atual.
- `DOC/README.md` (índice) e este registro criados.

## Arquivos alterados
- `CLAUDE.md` (novo)
- `memoria.md` (novo)
- `DOC/README.md` (novo)
- `DOC/2026-11-05_001_setup-claude-md.md` (novo)

## Verificação
Ainda não há projeto Expo, então `tsc`/lint não se aplicam.

## Decisões fora do pedido
- Formato de nome dos arquivos do DOC (`AAAA-MM-DD_NNN_titulo.md`) e índice `README.md`.
- `memoria.md` guarda só a última ação (sobrescrito); o histórico fica no `DOC/`.
