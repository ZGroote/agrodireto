# Relatórios executivos

Base única para os relatórios de progresso. Cada nova coleta atualiza a base e gera um retrato em `historico/`, para comparar com as anteriores sem reconstruir nada.

- `base/tarefas.json`: todas as tarefas do `tasks/todo.md`, com estado (não iniciada, em desenvolvimento, implementada, validada tecnicamente, homologada), bloqueio como atributo, evidências, frente, próxima ação e dependências. Também traz o horário da coleta e o commit.
- `base/contexto.json`: verificação (CI, builds, testes, migrations, commits), histórico de marcos, previsões, cronograma, jornada, riscos, bloqueios e marcos.
- `gerar_relatorio.py`: lê a base e gera `saida/relatorio.html`; grava o retrato agregado em `historico/`.
- `estilo.css`: aparência do relatório (A4 deitado).

## Gerar

```
python relatorios/gerar_relatorio.py
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf=relatorios/saida/relatorio.pdf relatorios/saida/relatorio.html
```

Regras de classificação: só é "validada tecnicamente" a tarefa com teste aprovado no banco de homologação ou nos testes de código; "homologada" exige o fluxo completo de aceitação com contas reais e aparelho, ou o aceite completo marcado no backlog para tarefas de preparação. Na dúvida, registrar "não verificado".
