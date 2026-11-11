# Teste com imagem real

A imagem de textura `pintura-rolo-relevo (2).png`, de Downloads, foi enviada pelo painel ao bucket privado `evidencias-lote` do projeto `agro`. A cópia baixada tem o mesmo SHA-256 do original. O objeto tem 68.039 bytes e a consulta HTTP sem sessão não retornou o arquivo.

Em uma transação revertida, o banco vinculou o mesmo objeto a um lote de teste. A conta de produtor simulada confirmou o arquivo e solicitou revisão. A equipe encontrou a imagem, aprovou e perdeu acesso para emitir novos links. O produtor viu a decisão e o comprador ficou sem acesso ao original. Os cadastros temporários foram revertidos. O arquivo de teste ficou privado no bucket, sem associação a lote.

O envio e o download foram feitos pelo painel. O percurso pelas telas do Agricultor e do Administrador com sessões reais ainda precisa ser testado.
