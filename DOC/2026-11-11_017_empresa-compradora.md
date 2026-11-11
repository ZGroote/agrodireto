# Empresa compradora (C02)

**Data:** 11/11/2026 (America/Sao_Paulo).
**Pedido:** cadastro da empresa compradora com aprovação pela equipe, sobre o modelo de organizações.

## O que foi feito

A migração `20261111085000_compradores.sql` foi aplicada no Supabase `agro` pelo SQL Editor. Antes, um ensaio rodou a migração e os testes dentro de uma transação desfeita no final. Depois da aplicação, `compradores.sql`, `propriedades.sql` e `inspecoes_lote.sql` rodaram no banco real e passaram.

- `organizacoes.tipo`: produtor, comprador ou transportadora. O envio de propriedade só usa organização de produtor, então quem é produtor e comprador fica com duas organizações separadas.
- `cadastros_comprador`: razão social, CNPJ, contato, telefone, cidade/UF e endereço de entrega, com o ciclo em análise → ajustes solicitados → aprovada e com autor e data de cada decisão.
- CNPJ validado no banco e em `packages/dominio`, inclusive o alfanumérico em vigor desde 07/2026. CNPJ repetido é recusado.
- Funções `enviar_`, `reenviar_` e `revisar_cadastro_comprador`, além de `sou_comprador_autorizado`.
- Catálogo, fotos do catálogo e resultado de inspeção liberam membro de empresa compradora aprovada. A lista manual `compradores_catalogo` continua valendo durante a homologação.
- Cliente: tela 25 (criar conta), tela 26 (sua empresa: envio, situação e ajustes) e link "Criar conta" na entrada. Depois do login, o comprador autorizado vai para Ofertas e os demais vão para o cadastro.
- Administrador: "Cadastros em análise" lista propriedades e empresas; a análise aprova ou pede ajustes com motivo para os dois tipos.

## Verificação

- `supabase/tests/compradores.sql`: CNPJ válido e inválido, envio repetido sem duplicar, normalização, empresa separada da propriedade, acesso cruzado negado, CNPJ duplicado, MFA da equipe, ajuste com versão antiga recusada, aprovação com auditoria e catálogo liberado só para a empresa aprovada.
- `npm run typecheck`, `npm run lint` e `npm test` (18 + 34) aprovados.
- As telas não foram usadas com contas reais.

## Decisões fora do pedido

- A tela de criar conta do Cliente não tem a caixa de aceite dos termos: não existem termos do comprador, e aceitar sem poder ler não vale. Pendente com o jurídico.
- Uma empresa por conta. Incluir colegas e "Trocar empresa" (mockup 24) ficam para quando houver membros.
- A organização da empresa recebe a razão social, que é atualizada no reenvio.
- O primeiro ensaio falhou por um erro do teste (nome de contato curto demais), não da migração; o teste foi corrigido antes de aplicar.

## Próximo passo

Aprovação da transportadora no Administrador, quando o C03 chegar ao main; depois demandas do comprador (E03).
