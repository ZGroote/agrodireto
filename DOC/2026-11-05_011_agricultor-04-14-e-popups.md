# 011 — Agricultor 04–14: conferência com o mockup e pop-ups de inserção

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ (4 apps + pacote) · eslint ✅ · pop-ups testados no navegador num quadro de celular (430 px).

## Pedido
O usuário não localizou as telas Minha propriedade, Fotos e vídeos, Documentos, Produção, Previsão de safra, Meus lotes, Novo lote, Padrão do lote, Preço e retirada e Revisar oferta, enviou os recortes do mockup (04 a 13) e pediu: construir com precisão, sem falha, e criar os **pop-ups de inserção de informação** que fizerem falta.

## Como foi conferido
As telas foram abertas num quadro de celular (430×612) e comparadas com os recortes do mockup. Todas as 10 existiam e estavam ligadas à navegação; as diferenças eram de detalhe, e os campos de data, quantidade e foto eram texto solto, sem pop-up.

## Correções de fidelidade
- **05 Fotos e vídeos:** "Enviando… 72% 72%" duplicado (agora "Enviando… 72%"); etiqueta "Não verificado" com ícone de relógio; o ícone de árvore não aparece mais por baixo do botão de play.
- **06 Documentos:** tipo "(RG ou CNH)" ao lado do título; "Verificada" com check; "A vencer" em etiqueta com triângulo; validade abaixo.
- **10 Meus lotes:** a primeira aba lista os dois lotes (AD-1042 Publicado e AD-1038 Encerrado), como no mockup.
- **11 Novo lote:** ícones de Produto e Quantidade como no mockup (o ícone de Quantidade do mockup é uma pessoa; copiei).
- **04 Minha propriedade:** tocar na foto de capa abre as Fotos e vídeos.
- **24 Configurações:** card com atalhos para Fotos e vídeos, Documentos e Dados bancários, para as telas ficarem fáceis de achar.

## Pop-ups de inserção (novos, em `@agrodireto/ui`)
| Pop-up | Onde aparece |
|---|---|
| **Calendário de um dia** (`DateField`) | 13 Data da colheita e Validade da oferta · 27 Validade do documento · 30 Data do plantio |
| **Calendário de período** (`DateField modo="periodo"`) | 13 Retirada (primeiro toque = início, segundo = fim) |
| **Digitar valor** (`PopupField`) | 09 Estimativa de colheita (máscara "2.500 kg"; a faixa estimada se recalcula) |
| **Adicionar mídia** (`ActionSheet`) | 05 botão "+" (Tirar foto, Escolher da galeria, Gravar vídeo) · 12 botão "+" (Tirar foto, Escolher da galeria) |
| **Escolher opção** (já existia) | selects: produto, origem, padrão, calibre, embalagem, unidade, visibilidade, etapa |

## Verificado no navegador
- 13: abrir o calendário de período → dias 5 e 6 marcados → escolher 10 e 12 → Confirmar → campo vira "10/11 a 12/11/2026".
- 09: abrir o pop-up, digitar 2500, Salvar → "2.500 kg" e faixa "2.300 – 2.800 kg".
- 05: pop-up do "+" com as três opções.
- 05, 06, 08, 10 e 14 renderizados e comparados com o mockup.

## Decisões fora do pedido
1. **Captura real de foto/vídeo ainda não existe:** o pop-up abre e cada opção só soma uma mídia ou evidência na tela. A captura exige `expo-image-picker` (aprovação pendente).
2. **Datas:** o calendário é feito com os componentes do projeto, sem biblioteca nova.
3. **Meus lotes:** a primeira aba mostra todos os lotes, mesmo com o contador "Disponíveis (1)", porque é o que o mockup mostra.
4. **Atalhos extras em Configurações e Minha propriedade** não estão no mockup.
5. Os campos de data e de estimativa passaram a abrir pop-up em vez de aceitar digitação direta.

## Pendências
- 08 Produção e 14 Revisar oferta também foram conferidos no navegador e batem com o mockup. 07 e 15 foram conferidos só pelo código.
- Outros campos do Agricultor ainda são digitação direta (preço, condições, endereço): se quiser, viram pop-ups também.
