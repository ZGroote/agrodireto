# Fotos autorizadas no catálogo

O produtor autoriza o compartilhamento no detalhe do lote depois da aprovação da foto pela equipe. O worker prepara um WebP sem perda e sem metadados e registra a cópia somente após o upload ao bucket privado. O comprador autorizado vê a galeria no detalhe da oferta vigente, com URLs assinadas por 60 segundos. A revogação impede novas assinaturas. Links já emitidos expiram no prazo original.

A migração `20261111060000_fotos_catalogo.sql` foi aplicada no Supabase `agro` de homologação. Um teste SQL com dados temporários confirmou que o comprador autorizado pode ler a cópia após consentimento, que o original permanece privado, que uma conta fora do piloto fica sem acesso e que a revogação bloqueia novas leituras. O teste foi revertido ao terminar.

O worker foi testado com JPEG contendo EXIF, falha no upload e nova tentativa. O teste confirma WebP sem EXIF, pixels preservados e registro apenas após o envio. O Sharp foi atualizado para 0.35.5.

A operação prepara a cópia pelo comando do [worker](../services/midia-worker/README.md). Ainda falta validar upload e exibição no mesmo fluxo com sessões de produtor e comprador na interface de homologação.
