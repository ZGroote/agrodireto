# 009 — Análise de lacunas: Agricultor (mockup 1) + botão voltar

**Data:** 2026-11-05
**Status:** Análise concluída; plano executado no passo 010.

## Pedido
1. Botão de voltar em todas as telas, caso o usuário queira.
2. Analisar o `mockups/1-agricultor.jpeg` em detalhe e listar tudo o que ficou faltando. Depois, repetir para os outros 3 perfis.

## Como foi feito
O mockup foi ampliado e lido tela por tela (01–24). Cada tela foi comparada com o código em `features/agricultor/screens/`.

## 1. Botão voltar
- `ScreenHeader` já tem a seta, mas **20 telas** a desligam com `back={false}` (raízes de tab, nos 4 perfis).
- **13 telas não usam `ScreenHeader`**, então não têm seta: Onboarding, Paywall e Entrar dos 4 perfis, mais Sem conexão da Logística.
- No mockup do Agricultor, **todas as telas têm a seta, menos a 07 · Início**. Isso inclui as raízes de tab 08, 18, 23 e 24, onde eu tinha removido a seta por conta própria (decisão do Lote A que contraria o mockup).
- Problema técnico: `router.back()` não faz nada quando não há histórico, por exemplo ao abrir uma URL direto no navegador ou no simulador.

## 2. Destinos que não existem (20)
O mockup mostra botões, ícones e linhas que levam a uma tela que não foi desenhada. Hoje essas ações não fazem nada.

| # | Tela que falta | Origem no mockup |
|---|---|---|
| 1 | Dados bancários | 03 · linha "Dados bancários" |
| 2 | Editar propriedade | 04 · lápis |
| 3 | Enviar documento | 06 · botão e linhas com seta |
| 4 | Central de notificações | 07 · sino |
| 5 | Preferências de notificação | 24 · Notificações |
| 6 | Cadastrar cultura | 08 e 09 · "Selecione a cultura" |
| 7 | Inspeções do lote | 15 · linha Inspeções |
| 8 | Menu do lote (opções) | 15 · "..." |
| 9 | Contraproposta | 17 · botão |
| 10 | Lista de pedidos | 18 · tab Pedidos mostra um pedido só |
| 11 | Registrar ocorrência (do Agricultor) | 21 · linha com seta |
| 12 | Detalhe do repasse | 22 · "Ver repasse" |
| 13 | Conversa aberta (mensagens e campo de envio) | 23 |
| 14 | Chat de Suporte | 23 · aba Suporte |
| 15 | Privacidade | 24 |
| 16 | Segurança | 24 |
| 17 | Ajuda | 24 |
| 18 | Recuperar acesso | 01 |
| 19 | Termos de Uso | 02 · link no aceite |
| 20 | Política de Privacidade | 02 · link no aceite |

## 3. Elementos do mockup que faltam dentro das telas existentes
- **02 Criar conta:** o subtítulo está diferente do mockup; "Termos de Uso" e "Política de Privacidade" não são links verdes.
- **03 Seu cadastro:** falta o banner laranja "Documento pendente · Envie o documento solicitado".
- **05 Fotos e vídeos:** falta a linha de metadados (Drone · data · autor · local), a barra "Enviando… 72%" (o componente existe e não é usado) e a duração do vídeo.
- **06 Documentos:** faltam o status "A vencer" e a linha "Válido até …".
- **07 Início:** a linha "Coleta hoje · 07h" não mostra PED e LG; o sino não tem contador.
- **08 Minha produção:** falta o cartão da cultura (nome, janela de colheita, "Estimativa declarada", "Ver previsão" com seta) e os dias destacados no calendário.
- **09 Previsão:** faltam a foto da cultura, "Atualizado por … em …" e a etapa como faixa verde (hoje é um seletor). A "Faixa estimada" (1.800–2.200 para 2.000) parece ±10%: regra de negócio a confirmar.
- **10 Meus lotes / 16 Cotações / 18 Pedidos:** os **cartões de item não foram construídos** (AD-1042 + status, COT-0318 + comprador + prazo etc.). Só existe o estado vazio, então o layout do mockup nunca aparece.
- **12 Padrão do lote:** faltam as miniaturas das evidências e o contador "(2)".
- **13 Preço e retirada:** o mockup tem **um** campo de retirada ("05/11 a 06/11/2026"); fiz dois campos com um rótulo vazio. Preço sem formato "R$ 4,80 / kg".
- **14 Revisar oferta:** "Janela de colheita" é uma faixa (05 – 12 NOV); a tela só tem uma data.
- **15 Detalhe do lote:** o selo "Rascunho" está **fixo no código** (status inventado), o QR deve ficar grande à direita, e o "..." não faz nada.
- **17 Negociação:** faltam as mensagens da negociação (autor · hora) e "Oferta v2".
- **21 Acompanhar transporte:** a rota e o "ETA | Atualizado" ficam em linhas separadas do mockup; a legenda "Saída da propriedade" não aparece.
- **22 Financeiro:** faltam "Venda (PED-…)", "Taxa (2,0%)" e a faixa laranja "Aguardando recebimento · Previsão".
- **23 Mensagens:** o mockup mostra a conversa aberta (cabeçalho do pedido, balões e campo de envio); só existe a lista vazia.
- **24 Configurações:** o botão "Sincronizar" não faz nada.
- **Tab bar:** o ícone de Produção deveria ser a folha (`Leaf`); está como broto (`Sprout`).

## 4. O fluxo não pode ser percorrido pela interface
Vários botões ficam desabilitados por falta de dados, e a navegação trava:
- **11 Novo lote:** "Produto" e "Origem" não têm opções (catálogo vazio), então "Continuar" nunca habilita. As telas 12, 13 e 14 só abrem pelo Mapa de telas.
- **17 Negociação:** "Aceitar proposta" e "Contraproposta" ficam desabilitados.
- **16 Cotações → 17 Negociação:** não há item na lista, então não há como entrar.

Isso explica a sensação de "telas faltando": o fluxo do mockup não dá para navegar.

## Plano proposto (por fase, uma de cada vez)
- **Fase 1 — Botão voltar em todas as telas, dos 4 perfis.**
  - Seta ligada por padrão no `ScreenHeader`; remover os 20 `back={false}`; adicionar o cabeçalho nas 13 telas sem seta.
  - Se não houver histórico: voltar para o Início do perfil. No Início: voltar para a escolha de perfil.
- **Fase 2 — Agricultor: cartões de item e conteúdo das telas existentes** (seção 3 e seção 4).
- **Fase 3 — Agricultor: as 20 telas que faltam** (seção 2), com layout feito a partir dos tokens.
- **Fases 4–6 — Logística, Cliente e Administrador:** a mesma análise e o mesmo processo.

## Decisões pedidas ao usuário
1. **Dados de exemplo para conferir o layout.** O CLAUDE.md proíbe mock data. Opções:
   - (a) manter só os estados vazios e construir os cartões;
   - (b) criar dados de exemplo **só em desenvolvimento** (`__DEV__`), com um interruptor no Mapa de telas, para ver as telas iguais ao mockup. Somem em produção e na integração com o Supabase.
2. **Voltar no Início:** levar à escolha de perfil, ou não mostrar a seta nesse caso?
3. **As 20 telas novas** não têm mockup: criar todas, só as que o mockup referencia diretamente (1–17), ou só as que bloqueiam o fluxo?
4. **Faixa estimada (09):** calcular ±10% da estimativa, ou deixar para o servidor?

## Decisões fora do pedido
Nenhuma neste passo: só análise.
