# Inspeção de qualidade dos lotes

Em 11/11/2026, a continuação do piloto conectou as telas de inspeção do Administrador aos lotes publicados em homologação. O inspetor registra a conformidade da embalagem, a qualidade, a temperatura opcional e o resultado. O Supabase grava o autor, a data e as referências das evidências já aprovadas. A primeira conclusão fica registrada e uma tentativa posterior não sobrescreve o resultado.

O Agricultor vê o resumo no lote. O Cliente vê o resultado nas ofertas que pode consultar e identifica separadamente o padrão informado pelo produtor. A inspeção é opcional enquanto os critérios do piloto estão pendentes. O fluxo registra o resultado diretamente e reaproveita as evidências já aprovadas no lote.

A migração `20261111070000_inspecoes_lote.sql` foi aplicada ao Supabase `agro`. O teste em `supabase/tests/inspecoes_lote.sql` verificou validação do checklist, autoria, evidências, tentativa de sobrescrita, bloqueio de terceiros e visibilidade após a retirada. Os dados do teste foram revertidos. O Administrador pediu login ao abrir a lista no navegador. A conclusão pela interface ainda precisa ser verificada com uma sessão ativa.
