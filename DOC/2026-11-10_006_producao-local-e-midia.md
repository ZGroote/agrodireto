# Culturas, rascunho de lote e gravação de mídia

Em 10/11/2026, às 19h58 (America/Sao_Paulo), o desenvolvimento avançou em três partes que podem ser verificadas antes de configurar o Supabase.

- “Minha produção” lista culturas cadastradas no dispositivo e abre os registros para edição. Cultura, variedade, área, plantio e etapa são persistidos. A área usa hectares e aceita vírgula decimal. A previsão existente está identificada como demonstração.
- O Agricultor pode guardar um rascunho de lote por dispositivo. A origem é escolhida da propriedade local. Avançar grava os campos da etapa e “Meus lotes” permite retomar. A revisão mostra os dados reais do rascunho. O descarte exige confirmação e as evidências ficam na sessão.
- O worker assume a mídia por atualização condicional, grava o otimizado em caminho exclusivo e confirma a nova referência antes de qualquer remoção. O padrão preserva o original. A opção `APAGAR_ORIGINAL_APOS_OTIMIZAR=true` habilita a remoção após confirmação. Uma falha de remoção mantém o resultado gravado.

No navegador, o lote passou por origem, quantidade, padrão, preço, datas e revisão. Os campos reapareceram após recarregar e pela retomada em “Meus lotes”. A cultura foi criada, reaberta após recarregar e editada sem duplicação. Tipos, lint, 45 testes e as exportações web dos quatro apps passaram. O adaptador foi testado via HTTP local com falhas de atualização, ausência de confirmação, reentrega e falha de remoção.

Foram alteradas as telas 08, 10 a 14 e 30, o contexto e rodapé do rascunho, o módulo de culturas locais, o adaptador e a configuração do worker, seus testes e documentação, o backlog, o índice e a memória.

Persistência de fotos e vídeos, previsão real, publicação e teste do worker com Supabase seguem pendentes. Se a gravação da referência tiver resposta ambígua, os arquivos são preservados para evitar perda. A limpeza de objetos sem referência e a retomada automática de jobs interrompidos ainda precisam de implementação.
