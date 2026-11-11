# Ajustes no cadastro e acesso em homologação

O usuário pediu para seguir com o cadastro e deixar o segundo fator desligado até chegar o primeiro cliente. O projeto `agro` já estava com a exigência desligada. O teste no Supabase confirmou essa configuração e exercitou a revisão com uma sessão de equipe sem segundo fator.

A migração `20261111020000_ajustes_propriedade.sql` foi aplicada no SQL Editor. O Administrador pode pedir ajustes com um motivo. O Agricultor vê o motivo, abre os dados já enviados, corrige e reenvia a propriedade. A nova versão retorna à fila de análise. A operação de revisão usada pelo app confere a versão recebida antes de gravar a decisão.

A tela de recuperação do Agricultor agora informa que a função está indisponível. A tela da Logística identifica o acesso atual como prévia, sem simular um envio de código. Cliente e Logística ainda aguardam integração do login.

O teste no Supabase usou contas temporárias em uma transação revertida. Verificou motivo visível ao produtor, bloqueio de revisão da própria propriedade, reenvio, bloqueio da versão antiga e aprovação da versão atual. A checagem de tipos e o lint passaram. Ainda falta o ensaio pelas telas com duas contas.

Quando chegar o primeiro cliente, reative o segundo fator conforme o [procedimento de homologação](2026-11-11_001_identidade-e-propriedades.md).
