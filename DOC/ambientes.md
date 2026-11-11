# Ambientes AgroDireto

| Ambiente | Uso | Estado |
|---|---|---|
| Desenvolvimento local | Migrations, Auth e testes de acesso, com contas de teste | Configuração local versionada; Supabase CLI e runtime de contêiner ainda indisponíveis neste host |
| Integração hospedada / homologação | Testar o fluxo em aparelhos com contas de teste | Projeto `agro` ativo, com Auth, propriedades e bucket privado `midias`. Segundo fator administrativo temporariamente desligado |
| Piloto | Operação com participantes reais | Projeto Supabase separado, a provisionar após homologação |

O projeto de integração está na organização `agro`, com referência `owwghcuhioabmpkgsszt`. A configuração local continua em `supabase/config.toml` com identificador próprio.

Quando houver [Supabase CLI e runtime de contêiner](https://supabase.com/docs/guides/local-development), execute `supabase start` e `supabase status` na raiz. Versione as migrations e valide primeiro localmente. Use a [separação de ambientes do Supabase](https://supabase.com/docs/guides/deployment/managing-environments) como referência.

Copie `.env.example` para `apps/<perfil>/.env.local` e preencha somente URL e chave pública do ambiente correspondente. Agricultor e Administrador já usam essas variáveis. Não coloque chaves privilegiadas em variáveis `EXPO_PUBLIC_*`. O worker usa seu próprio `.env.example`, com segredos mantidos apenas no servidor. Não iniciar o worker com uploads reais até concluir as correções do backlog.

A configuração de segundo fator da equipe é privada no banco. O padrão de um novo ambiente é exigir MFA. Veja o procedimento de reativação e os testes no [registro de identidade e propriedades](2026-11-11_001_identidade-e-propriedades.md).
