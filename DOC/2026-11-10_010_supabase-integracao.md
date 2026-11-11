# Ambiente Supabase de integração e bucket privado

O projeto `agro` foi provisionado pelo usuário na organização `agro`, com referência `owwghcuhioabmpkgsszt`. Ele serve para integração e homologação com contas de teste.

O endpoint `/auth/v1/settings` respondeu HTTP 200 usando a chave publicável. Os arquivos ignorados `.env.local` dos quatro apps receberam a URL e a chave pública. O código dos apps ainda precisa integrar autenticação e persistência.

O bucket `midias` foi criado no painel com a opção de acesso público desativada. O upload pelo worker, as políticas de acesso por usuário e as cotas ainda precisam ser implementados ou verificados antes do piloto.
