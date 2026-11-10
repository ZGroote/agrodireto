# Vários rascunhos de lote e previsão da cultura

Em 10/11/2026, às 20h15 (America/Sao_Paulo), o usuário pediu para agrupar entregas no mesmo turno. O desenvolvimento avançou na gravação, retomada e vinculação dos lotes à produção.

Meus lotes lista os rascunhos locais e abre cada um na etapa gravada. Novo lote cria um registro separado. O rascunho do formato anterior aparece na lista e é incorporado ao gravar na estrutura atual. A quantidade aceita inteiros positivos e o formato brasileiro de milhares. O agricultor pode vincular uma cultura e copiar a data prevista de colheita para o lote. A previsão original é preservada.

Foram alteradas as rotas e telas 10 a 14 do Agricultor, o contexto e o rodapé do lote, o armazenamento dos rascunhos e a leitura das culturas. O backlog, o índice e a memória registram o andamento de D02.

Tipos, lint, 45 testes e exportação web do Agricultor passaram. No navegador, foram salvos dois rascunhos em etapas distintas. O segundo reabriu com preço e data preenchidos e permitiu voltar à etapa anterior. Uma verificação local do armazenamento cobriu o formato anterior, gravações concorrentes no mesmo processo e descarte isolado.

Os registros ficam no dispositivo. Evidências duráveis e publicação dependem da integração de mídia e do Supabase.
