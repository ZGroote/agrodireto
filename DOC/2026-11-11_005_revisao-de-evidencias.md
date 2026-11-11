# Revisão de evidências em homologação

O agricultor pode solicitar revisão de cada evidência confirmada. O Administrador tem uma fila acessível pelo início do app. A equipe pode baixar o original enquanto o pedido está pendente, aprovar ou rejeitar com motivo. A decisão registra autor e data e aparece no detalhe do lote do agricultor.

A migração `20261111050000_revisar_evidencias_lote.sql` foi aplicada no projeto `agro`. O acesso da equipe começa com o pedido do produtor. Após a decisão, a equipe deixa de emitir links novos. Links já emitidos expiram em até 60 segundos. Os originais seguem fora do catálogo.

O teste no Supabase usou dados temporários em uma transação revertida. Verificou acesso da equipe apenas durante a revisão, bloqueio do comprador, exigência do motivo, gravação das duas decisões e retorno ao produtor. Tipos, lint e a checagem de espaços passaram. Falta percorrer o fluxo pelas telas com arquivos reais.

A publicação de mídia ao comprador depende de uma cópia sanitizada, sem metadados sensíveis, e de autorização no servidor. A aprovação da evidência pela equipe não publica o original.
