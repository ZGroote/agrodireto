# Aplicação no agro e catálogo de culturas

**Pedido:** o usuário ligou o portal do Supabase no Maestri e deixou a lista de culturas numa nota; pediu para aplicar no `agro` (ponto 1) e montar o catálogo (ponto 2).

## Feito

- Ensaio (migrations + cada teste entre `begin` e `rollback`), aplicação e testes no `agro`. Detalhes no DOC 027.
- `supabase/migrations/20261111160000_catalogo_culturas_ibge.sql`: carga idempotente das 63 culturas nomeadas na lista PAM/IBGE 2025 da nota (a lista cita 37 + 33, mas nomeia 35 + 28). Aplicada: hortifrúti 37, grãos 19, agroindústria 7.
- `supabase/tests/culturas.sql` passou a contar só as linhas de teste do catálogo, para continuar válido com o catálogo cheio.

## Classificação (decisão do Maestro, ajustar por `update` se precisar)

- Grãos e sementes (soja, milho, café, cacau, feijão…): `kg`, `t`.
- Matéria-prima de agroindústria (cana, algodão, fumo, borracha, sisal, dendê, erva-mate): `kg`, `t`.
- Hortaliças, raízes e frutas: `kg`, `cx`, `t`.
- Nomes sem o detalhe do IBGE ("Soja" em vez de "Soja (em grão)"). "Milho" e "Milho verde" são entradas separadas.
- Região do piloto não entra no catálogo; continua decisão de operação.

## Bloqueio: e-mail de recuperação

O modelo padrão "Reset password" do Supabase manda **só o link**, sem `{{ .Token }}`, e o painel só deixa editar modelos com **SMTP próprio**. Até configurar o SMTP, a recuperação por código dos apps Logística, Agricultor e Cliente (DOC 025 e 026) não funciona. Precisa de um provedor e credenciais do usuário.
