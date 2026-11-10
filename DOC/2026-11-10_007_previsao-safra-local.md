# Previsão de safra por cultura

Em 10/11/2026, às 20h04 (America/Sao_Paulo), o desenvolvimento local avançou na tarefa D01. A previsão salva a quantidade estimada em quilos inteiros e uma data prevista por cultura. A faixa é opcional e usa os dois limites fornecidos pelo agricultor. Minha produção exibe a estimativa e destaca a data no calendário. Editar os outros campos da cultura preserva a previsão.

Foram alterados o módulo de culturas locais, as telas 08 e 09 do Agricultor, o backlog, o índice do DOC e a memória.

No navegador, uma faixa que excluía a estimativa foi recusada. A previsão válida reapareceu após recarregar, a data ficou destacada e os campos foram preservados após editar a cultura. Tipos, lint, 45 testes e exportação web do Agricultor passaram.

A primeira versão registra uma previsão atual por cultura, em uma única data. Sincronização, histórico de revisões com autoria e o catálogo do piloto seguem pendentes.
