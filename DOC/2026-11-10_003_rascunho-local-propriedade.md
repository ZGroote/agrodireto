# Rascunho local de propriedade

**Data/hora:** 10/11/2026, 11:21 (America/Sao_Paulo).
**Pedido:** avançar no desenvolvimento antes de conectar os serviços.
**Plano:** antecipar a parte local da tarefa C01; validar gravação e reabertura antes de integrar.

Em `apps/agricultor/screens/26-editar-propriedade/EditarPropriedadeScreen.tsx`, o formulário inicia vazio ou restaura o rascunho existente. Nome, cidade, UF, área e culturas são gravados no AsyncStorage já instalado. A tela indica que a gravação é local, confirma sucesso somente após gravar e sinaliza falhas. A foto de capa segue ilustrativa. O rascunho é pré-cadastro e não representa um cadastro aprovado ou publicado.

**Verificação:** tipos, lint e 42 testes passaram; export web do Agricultor aprovada. No navegador, o botão iniciou desabilitado, os cinco campos foram preenchidos e salvos, e todos reapareceram após recarregar. Não houve teste em aparelho nativo.

**Arquivos tocados:** tela de edição, `tasks/todo.md`, índice do DOC, esta nota e `memoria.md`.
**Decisão:** não aguardar infraestrutura para fluxos que podem ser desenvolvidos e verificados localmente. Próximo passo: preparar outros formulários e regras de cadastro; ao conectar o Supabase, vincular o rascunho à conta autenticada e validar a migração sem duplicação.
