# Memória — última ação

Em 11/11/2026, à noite, como Maestro das frentes paralelas (regras em `DOC/2026-11-11_020_frentes-paralelas.md`), juntei no `main`: D01 (021), G03 (022), C04 (023), D02 (024), B04 restante (025), B02/B03 recuperar acesso (026) B01 etapa 1 (027), D03 (029) e B01 etapa 2 no Agricultor (030). Typecheck, lint e testes (12 Agricultor + 18 domínio + 44 worker) passam. Ao juntar a D02, igualei o limite de preço do rascunho ao do lote publicado (1.000.000.000 centavos).

Aplicado no `agro` em 11/11 (ensaio com rollback antes): `20261111100000` a `20261111150000` a carga do catálogo `20261111160000` (63 culturas), `20261111170000` (mídia privada; corrigi um `case` dentro de `if`) e `20261111180000` (propriedade na organização). Os 11 testes de `supabase/tests/` passaram no banco real. Detalhes no DOC 027 e 028.

BLOQUEIO: o modelo "Reset password" padrão manda só link; editar exige SMTP próprio. A recuperação por código dos apps não funciona até o usuário fornecer um SMTP.

Agentes (18:30): Oferta no Claude "jaogroote" (D03, plano) e Identidade no Claude "Padrão" (B01 etapa 2, plano); Logística (Claude "Padrão") pausada, porque o que sobra dela depende de F03. Codex "Padrão" volta às 21:55 e Codex "trabalho" está com menos de 5% na semana. As rotinas das 22:00 foram pausadas.

Pendências do usuário: SMTP próprio (provedor e credenciais; modelo e passo a passo prontos em `supabase/templates/recuperar-senha.html` e DOC 028); ensaio em aparelho (roteiros nos DOC 025 e 026). Inclusão de membro: só por e-mail por enquanto, convite no futuro (caminho no DOC 027).

Próximo passo: Oferta segue para D03/D07 e Identidade para a B01 etapa 2 (seletor de contexto e inclusão de membros nas telas).
