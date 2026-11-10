# Design system

Fonte da verdade: `mockups/*.jpeg`. Os tokens ficam em `theme/`. As telas usam sempre os tokens, sem cor ou tamanho escrito direto.

## Cores (`theme/colors.ts`)

As cores vêm das amostras do rodapé dos mockups.

| Token | Hex | Uso |
|---|---|---|
| primary | #245943 | Botão primário, ícones e textos ativos, valores em destaque |
| primarySoft | #EBF0E2 | Card de destaque, balão de chat próprio, dia marcado |
| background | #F7F8F4 | Fundo das telas |
| surface | #FFFFFF | Cards, inputs, tab bar |
| textPrimary | #172C22 | Títulos e texto |
| textSecondary | #667368 | Subtítulos, legendas, ícones neutros |
| border | #E2E7DF | Bordas, divisores, botão desabilitado |
| warning / warningSoft | #A66825 | Atenção, pendente, “A vencer” |
| info / infoSoft | #386E93 | Em trânsito |
| danger / dangerSoft | #B64242 | Bloqueado, ações destrutivas, Sair |

Cores derivadas que **não** constam nas amostras: `primaryPressed`, os fundos `*Soft` de warning, info e danger, `placeholder` e `disabledText`. Foram calibradas a partir das cores base.

## Tipografia (`theme/typography.ts`)

A fonte é **Inter** (Google Fonts). O mockup indica SF Pro, que não está no Google Fonts.

| Token | Tamanho/peso | Exemplo |
|---|---|---|
| display | 24/700 | R$ 2.352, AD-1042 |
| title | 22/700 | Título da tela |
| heading | 16/600 | Título de card |
| body | 14/400 | Texto |
| bodyStrong | 14/600 | Valores |
| label | 13/500 | Labels, links |
| button | 15/600 | Botões |
| caption | 12/400 | Metadados |
| micro | 10/500 | Tab bar, pills |

## Espaçamento, raio e sombra (`theme/spacing.ts`)

- **Espaçamento:** base 4 (2, 4, 8, 12, 16, 20, 24, 32). Margem lateral da tela: 16.
- **Raio:** input e botão 10, card 12, mídia 10, pill 999.
- **Sombra:** quase nenhuma (`card` com opacidade 0,04). O card se define principalmente pela borda de 1px.
- **Tamanhos:** botão 48, input 44, linha 52, tab bar 60, avatar 40. Ícones 16 · 20 · 24 · 32 e `iconHero` 48 (estado de destaque: Coleta registrada, Sem conexão — Lote B).

## Componentes (`components/`)

| Componente | Anatomia |
|---|---|
| Button | `primary` verde cheio · `secondary` só texto (“Cancelar”) · `outline` · `danger` vermelho · `disabled` cinza |
| TextLink | Link de texto verde (“Criar conta”) |
| TextField | Label + caixa branca com ícone à esquerda, sufixo opcional (kg, / kg) e senha com olho |
| SelectField | Caixa com chevron; abre uma folha inferior com as opções |
| SearchField | Ícone de busca + limpar |
| TextArea | Caixa multilinha com contador “0/120” |
| OTPInput | 6 caixas de dígito |
| Checkbox / Toggle / RatingStars | Controles verdes (estrelas em warning) |
| Screen | Safe area, fundo, rolagem, rodapé fixo para o botão principal |
| ScreenHeader | Seta de voltar, ação à direita, título 22, passo “1/3”, subtítulo |
| Card / HighlightCard / AlertBanner | Card branco com borda · card verde de valor · faixa de aviso por tom |
| ListRow / KeyValueRow / ChecklistRow | Linha com ícone, título, subtítulo e chevron · par rótulo-valor · item de checklist com status |
| StatusPill / VerifiedBadge | Pill com fundo suave (Disponível, Atenção, Em trânsito, Bloqueado) · selo com check |
| SegmentedControl | Pills com contador; ativo em verde cheio |
| Timeline | Nós verdes com check, linha vertical |
| InlineFieldRow | Rótulo com ícone à esquerda e campo à direita (Cliente 04/08/20, Administrador 10) — Lote D |
| Foto / MapaRota / QRDecorativo / AssinaturaDecorativa | Ilustrações provisórias (SVG) no lugar de foto, mapa, QR e assinatura, no tamanho e no raio dos mockups |
| DateField / CalendarioSheet | Campo de data ou período que abre um pop-up de calendário (dia ou período) |
| PopupField | Campo que mostra o valor ("2.000 kg") e abre um pop-up para digitar |
| ActionSheet | Folha de ações na base da tela (menu "...") |
| VoltarProvider / useVoltar | Botão voltar com fallback ao Início quando não há histórico |
| ChatBubble / MessageInput | Balão (o próprio em verde-claro) · campo com anexo e enviar |
| MediaThumb / AddMediaButton / ProgressBar | Miniatura com X · “+” tracejado · barra de envio |
| CalendarMonth / ComparisonTable / StatTile | Calendário com dias marcados · tabela lado a lado · indicador grande |
| Placeholders | Imagem, vídeo, mapa, QR, assinatura e gráfico: bloco neutro até haver dado real ou biblioteca aprovada |
| EmptyState | Ícone em círculo verde-claro, título e descrição |
| Logo | Placeholder da marca (folha do lucide + texto) |

## Pacote

Os tokens e componentes vivem em `packages/ui` (`@agrodireto/ui`) e são compartilhados pelos 4 apps. Formatadores pt-BR (`brl`, `kg`, `faixaKg`, `mascaraMilhar`) também estão lá.
