# Preparo em lote das fotos do catálogo

A operação pode preparar as fotos aprovadas e autorizadas com `npm run preparar-foto-catalogo -w @agrodireto/midia-worker -- --pendentes`. O worker consulta as fotos no Supabase, processa uma por vez e informa os resultados. O modo individual continua disponível.

A consulta percorre a chave primária em páginas. O preparo remove itens bem-sucedidos da lista de pendências, então usar a posição da última foto evita pular itens da página seguinte. Falhas individuais permanecem pendentes e não impedem o processamento das outras fotos.

O teste automatizado cobre duas páginas, revogação de autorização entre consulta e processamento e continuidade após falhas. Em um teste com a interface HTTP do Supabase simulada localmente, o comando converteu a foto já usada da pasta Downloads de 68.039 para 40.908 bytes, com os mesmos pixels em 256 × 256 e sem EXIF ou XMP. Uma segunda execução não encontrou cópias pendentes.

O worker ainda precisa das credenciais privadas da homologação para rodar contra o Supabase hospedado.
