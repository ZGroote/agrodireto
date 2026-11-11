# Publicação de lotes e catálogo em homologação

No Agricultor, a revisão do lote permite publicar com propriedade aprovada. O rascunho é salvo antes do envio e pertence à conta do agricultor. Repetir a solicitação conserva o mesmo lote. A tela Meus lotes consulta ofertas publicadas e retiradas no Supabase. O produtor pode retirar uma oferta pelo detalhe.

No Cliente, o login usa e-mail e senha do Supabase. A sessão nativa usa SecureStore e a sessão web fica em memória. O catálogo consulta ofertas vigentes, com busca por produto, páginas de 20 e detalhe de preço, quantidade, origem, datas e padrão. O banco permite consultar o catálogo somente a compradores autorizados. A consulta entrega os campos comerciais da oferta.

A migração `20261111030000_catalogo_homologacao.sql` foi aplicada no SQL Editor do projeto `agro`. O catálogo foi habilitado nesse projeto. Em novos ambientes a migração deixa a função desligada. O segundo fator da homologação continuou desligado.

Para o teste pela interface, use uma conta de produtor com propriedade aprovada e outra conta de comprador. Depois de confirmar a identidade da conta de teste, o operador cadastra o UUID de Auth do comprador em `agrodireto_privado.compradores_catalogo`. A tabela estava vazia ao final da validação. O cadastro empresarial e a aprovação de compradores ainda precisam ser implementados.

O teste no banco usou três contas temporárias e reverteu todos os dados de teste. Confirmou bloqueio de propriedade pendente, envio sem duplicata, acesso restrito ao comprador autorizado, busca, bloqueio de retirada por outra conta e remoção do catálogo após a retirada pelo produtor. No navegador, a rota de ofertas sem sessão redirecionou para o login.

Fotos e vídeos continuam locais. A publicação do piloto depende do envio de evidências, da inspeção e das regras de qualidade. Pedidos e cotações continuam como etapas seguintes.
