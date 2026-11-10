# Ambientes AgroDireto

| Ambiente | Uso | Estado |
|---|---|---|
| Desenvolvimento local | Migrations, Auth e testes de acesso, com contas de teste | Configuração local versionada; Supabase CLI e runtime de contêiner ainda indisponíveis neste host |
| Homologação | Testar o fluxo em aparelhos com contas de teste | Projeto Supabase a provisionar |
| Piloto | Operação com participantes reais | Projeto Supabase separado, a provisionar após homologação |

O usuário confirmou que ainda não há projeto Supabase de desenvolvimento/homologação. A configuração local está em `supabase/config.toml`; o identificador local não aponta para nenhum projeto remoto.

Quando houver [Supabase CLI e runtime de contêiner](https://supabase.com/docs/guides/local-development), execute `supabase start` e `supabase status` na raiz. Para integração hospedada, confirme a organização e a referência do projeto de homologação antes de vinculá-lo. Versione as migrations e valide primeiro localmente; use a [separação de ambientes do Supabase](https://supabase.com/docs/guides/deployment/managing-environments) como referência.

Copie `.env.example` para `apps/<perfil>/.env.local` e preencha somente URL e chave pública do ambiente correspondente. Os nomes atuais são mantidos por compatibilidade com a documentação do projeto; a integração dos apps virá na Etapa 1. Não coloque chaves privilegiadas em variáveis `EXPO_PUBLIC_*`. O worker usa seu próprio `.env.example`, com segredos mantidos apenas no servidor. Não iniciar o worker com uploads reais até concluir as correções do backlog.
