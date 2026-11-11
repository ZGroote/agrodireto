# Cópia de foto sem metadados

O worker ganhou um comando local para criar um WebP sem perda, separado do modo que exige redução de tamanho. A cópia aplica a orientação, remove EXIF, XMP e IPTC e preserva o original. Entradas estáticas JPEG, PNG e WebP são verificadas antes da conversão.

Os testes cobrem o caso em que a cópia fica maior e a recusa de SVG renomeado. A imagem de teste de Downloads gerou um WebP sem perda de 40.908 bytes com 256 × 256 px. Os 32 testes do worker passaram.

O comando local ainda não faz parte do fluxo de publicação. Antes de processar uploads de usuários, falta resolver a atualização de segurança do decodificador, integrar a cópia ao armazenamento e autorizar sua leitura no catálogo.
