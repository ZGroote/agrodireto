# Memória — última ação

Em 11/11/2026, à noite, como Maestro das frentes paralelas (regras em `DOC/2026-11-11_020_frentes-paralelas.md`), juntei no `main`: D01 (021), G03 (022), C04 (023), D02 (024), B04 restante (025), B02/B03 recuperar acesso (026) B01 etapa 1 (027), D03 (029) B01 etapa 2 no Agricultor (030) , no Cliente (032) e na Logística (033), D07 (031) B05 etapa 1 (034) B05 etapa 2 (036), D08 (035) e C01 (037). Typecheck, lint e testes (4 Administrador + 22 Agricultor + 5 Cliente + 4 Logística + 18 domínio + 46 worker) passam. Ao juntar a D02, igualei o limite de preço do rascunho ao do lote publicado (1.000.000.000 centavos).

Aplicado no `agro` em 11/11 (ensaio com rollback antes): `20261111100000` a `20261111150000` a carga do catálogo `20261111160000` (63 culturas), `20261111170000` (mídia privada; corrigi um `case` dentro de `if`) e `20261111180000` (propriedade na organização) `20261111210000` (papéis da equipe) e `20261111220000` (vídeo no catálogo). Depois da 220000, 10 dos 13 testes rodaram e passaram; `rascunhos_lote`, `transportadoras` e `veiculos_motoristas` ficaram sem rodar porque a sessão do Supabase no portal expirou (precisa do usuário logar de novo). Antes disso, os 12 testes de `supabase/tests/` passaram no banco real. Detalhes no DOC 027 e 028.

BLOQUEIO: o modelo "Reset password" padrão manda só link; editar exige SMTP próprio. A recuperação por código dos apps não funciona até o usuário fornecer um SMTP.

Antigravity ligado em 11/11 à noite (agy 1.5.6 instalado em %LOCALAPPDATA%\agy\bin; andar Administrador; escrevendo as propostas D09 e A01, DOC 038 e 039). Agentes (18:30): Oferta no Claude "jaogroote" (D03, plano) e Identidade no Claude "Padrão" (B01 etapa 2, plano); Logística (Claude "Padrão") pausada, porque o que sobra dela depende de F03. Codex "Padrão" volta às 21:55 e Codex "trabalho" está com menos de 5% na semana. As rotinas das 22:00 foram pausadas.

Pendências do usuário: SMTP próprio (provedor e credenciais; modelo e passo a passo prontos em `supabase/templates/recuperar-senha.html` e DOC 028); ensaio em aparelho (roteiros nos DOC 025 e 026). Inclusão de membro: só por e-mail por enquanto, convite no futuro (caminho no DOC 027).

Próximo passo: Oferta segue para D03/D07 e Identidade para a B01 etapa 2 (seletor de contexto e inclusão de membros nas telas).
