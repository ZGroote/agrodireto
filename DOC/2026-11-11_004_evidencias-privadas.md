# Evidências privadas de lote em homologação

O Agricultor pode enviar, no detalhe do lote publicado, as evidências salvas no rascunho da sua conta. O app confirma o registro no Supabase depois do envio. Se a rede falhar, a nova tentativa usa o mesmo caminho e confirma um objeto que já tenha chegado. O produtor pode recuperar evidências confirmadas em outro dispositivo por um link de download válido por 60 segundos.

A migração `20261111040000_evidencias_lote.sql` foi aplicada no projeto `agro`. O bucket dedicado `evidencias-lote` mantém os originais privados e separados do bucket `midias` do worker. A política vincula o caminho reservado ao lote e ao produtor. A homologação aceita JPG, PNG, WebP, MP4 e MOV, com até 6 MiB por arquivo, 10 reservas por lote e 30 por produtor. Reservas incompletas contam para a cota. O app envia um arquivo de cada vez.

A validação SQL no Supabase usou contas e registros temporários revertidos. Verificou que a reserva repetida conserva o caminho, que confirmação sem objeto falha, que o produtor lê seus registros e que outra conta não lê, envia nem confirma no lote. O limite por lote foi exercitado. Tipos, lint e 45 testes passaram. O Agricultor foi exportado para web, Android e iOS.

Faltam teste de transferência real em aparelho com uma conta de produtor, limpeza de reservas abandonadas, envio de vídeos maiores, sanitização, revisão pela equipe e exibição de mídia autorizada ao comprador. Originais não são disponibilizados no catálogo nem encaminhados ao worker por este fluxo.
