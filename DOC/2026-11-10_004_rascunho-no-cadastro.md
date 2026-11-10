# Rascunho no fluxo de cadastro

Em 10/11/2026, às 11h24, o desenvolvimento local avançou da edição para a consulta da propriedade e o acompanhamento do cadastro. O plano desta entrega foi compartilhar a leitura do rascunho existente e verificar as três telas pelo fluxo normal do app.

O módulo de armazenamento e o hook de leitura em foco reutilizam a chave e o formato já gravados. “Minha propriedade” exibe o rascunho e distingue ausência de dados de erro de leitura. “Seu cadastro” mostra o estado da propriedade sem contar um rascunho como etapa verificada. O perfil público acessível pela tela de propriedade está identificado como exemplo. Identificação e dados bancários ainda vêm da demonstração.

Foram alteradas as telas 03, 04 e 26 do Agricultor, com um módulo em `lib/rascunhoPropriedade.ts` e um hook em `hooks/useRascunhoPropriedade.ts`. O backlog, o índice do DOC e a memória registram o progresso parcial da tarefa C01.

Tipos, lint, 42 testes e exportação web do Agricultor passaram. No navegador, o fluxo foi testado desde “Seu cadastro”. A propriedade começou sem rascunho, exibiu os cinco campos ao voltar da edição e manteve o estado “Rascunho local” após recarregar o cadastro. A validação nativa segue pendente.

A próxima parte local é tratar os demais estados do cadastro. A vinculação à conta e a aprovação dependem da integração com o Supabase.
