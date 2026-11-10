# Evidências persistentes e preparação do Storage

Em 10/11/2026, às 20h24 (America/Sao_Paulo), a etapa de mídia avançou na gravação local dos anexos e na preparação do bucket remoto.

O Agricultor copia fotos e vídeos ao salvar ou continuar. Na web, os arquivos ficam em IndexedDB. Android e iOS usam o diretório de documentos do app. A referência só é gravada após a cópia. Remover um anexo e salvar ou descartar um lote retira sua referência e tenta liberar apenas os arquivos afetados. A revisão mostra a quantidade de evidências anexadas.

O comando `npm run preparar-storage -w @agrodireto/midia-worker` cria ou confirma o bucket privado `midias` usando as credenciais do ambiente selecionado. Uma reexecução reaproveita o bucket privado e um bucket público é recusado.

O navegador confirmou a reabertura de uma foto e de um vídeo após recarregar. Testes locais cobriram falha durante a cópia, descarte isolado e os três estados do bucket. Tipos, lint, 45 testes, exportações web dos quatro apps e bundles Android e iOS do Agricultor passaram.

Foram alterados o armazenamento e o contexto de lotes, a miniatura, as telas 12 e 14, o pacote do Agricultor e o lockfile. A biblioteca de arquivos passou a ser dependência direta na mesma versão já instalada pelo Expo. O worker ganhou o comando de preparação e o README correspondente. O backlog, o índice e a memória registram a entrega.

Faltam testar em aparelhos, provisionar o bucket em um ambiente Supabase, integrar upload e validar permissões e cotas. Uma falha após copiar os arquivos e antes de confirmar a gravação do rascunho pode deixar cópias locais para uma nova tentativa.
