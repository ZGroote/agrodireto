# Estados locais do cadastro do Agricultor

Em 10/11/2026, às 11h30 (America/Sao_Paulo), o usuário autorizou a continuação do desenvolvimento local. Esta entrega ajustou o checklist, a navegação, a preparação de documentos e a prévia do formulário bancário.

O checklist usa o rascunho gravado no dispositivo para decidir se “Continuar cadastro” abre a propriedade ou os documentos. Identificação e dados bancários aguardam envio. A lista de documentos usa categorias fixas e abre a preparação com o tipo selecionado. O seletor de fotos existente permite prévia e remoção temporárias. O formulário bancário abre vazio, em modo de teste. O envio depende da integração.

Foram alteradas as telas 03, 06, 25 e 27 do Agricultor e criado `apps/agricultor/lib/tiposDocumento.ts`. O índice do DOC e a memória registram esta entrega. A ordem adotada começa pela propriedade porque seu rascunho já pode ser gravado.

Tipos, lint, 42 testes e exportação web passaram. No navegador foram verificados os dois destinos de “Continuar cadastro”, o tipo de documento selecionado, a inclusão e remoção de uma imagem de teste e o estado do formulário bancário. Resta validar em aparelho nativo, integrar envio e aprovação e implementar suporte a PDF.
