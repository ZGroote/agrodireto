# 010 — Quatro apps separados + Agricultor completo (47 telas)

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ (4 apps + pacote) · eslint ✅ · bundle web (Logística) ✅ · bundle Android (Agricultor, Cliente, Administrador) ✅

## Pedido
1. "Perfeito, faça todas que estiver faltando": criar as telas que faltavam (análise do passo 009).
2. "Um aplicativo para cada um, não todos nos mesmos": cada perfil vira um app separado.
3. "Extremamente profundo em copiar os mockups", com **valores fictícios fáceis de apagar**, começando pelo Agricultor (24 telas).
4. Botão de voltar em todas as telas.

## Decisões do usuário (do pedido) usadas aqui
- Criar todas as telas que faltam (decisão 3 do passo 009).
- Dados de exemplo para conferir o layout (decisão 1), de forma que dê para apagar depois.
- Voltar no Início (decisão 2): sem escolha de perfil não existe mais para onde voltar; o Início fica sem seta, como no mockup.

## O que foi feito

### 1. Quatro apps em um monorepo
- `apps/agricultor`, `apps/cliente`, `apps/logistica`, `apps/administrador`: cada um com `package.json`, `app.json` (nome, slug, scheme e bundle id próprios), `tsconfig`, `.env`, `assets` e rotas.
- `packages/ui` (`@agrodireto/ui`): tokens, componentes e templates compartilhados.
- Removidos: a escolha de perfil, `features/perfis.ts` e o `app/` único. A raiz virou só o workspace.
- URLs sem prefixo de perfil (`/inicio`, `/producao`…). Todo app abre em `/` → Onboarding.
- Detalhes em `DOC/arquitetura.md`.

### 2. Botão voltar
- `ScreenHeader` mostra a seta por padrão. Sem histórico, volta ao Início do app (`VoltarProvider`).
- Removido o `back={false}` de 12 telas dos apps Cliente, Logística e Administrador. No Agricultor foi refeito direto.
- Onboarding: seta entre os passos. Paywall: seta e X. Entrar: seta.
- O Início de cada app é a única tela sem seta (primeira tela depois do login, como no mockup).

### 3. Agricultor: 47 telas
- As 24 do mockup, refeitas com o conteúdo dele (valores, textos, status, cartões de item).
- Onboarding e Paywall (sem mockup).
- **21 telas criadas além do mockup**, para que todo botão leve a algum lugar (lista em `apps/agricultor/README.md`).
- Cada tela tem pasta e README. O Mapa de telas (dev) lista as 47.

### 4. Dados fictícios
- `apps/agricultor/dados-demo/index.ts` (valores do mockup) lido só por `hooks/dados.ts`.
- **Para apagar:** remova a pasta `dados-demo/` e troque o corpo de cada hook por consulta. `types.ts` fica.
- Rascunho do lote (11–13) começa preenchido; Publicar lote abre o lote AD-1042, como o mockup.
- Interações que funcionam no demo: calendário, abas, folhas de opções, mensagens (acrescenta o balão), "Sincronizar", marcar notificações como lidas.

### 5. Componentes novos no pacote
`Foto`, `MapaRota`, `QRDecorativo`, `AssinaturaDecorativa` (ilustrações em SVG, provisórias), `ActionSheet`, `InlineFieldRow` (já existia), prefixo no `TextField`, formatadores (`brl`, `kg`, `faixaKg`, `mascaraMilhar`), balão de chat no formato do mockup, calendário com dias em quadrados arredondados.

## Verificação
- `tsc --noEmit` em cada app e em `packages/ui`: OK.
- `eslint apps packages`: OK (o resolvedor de imports lê o `tsconfig` de cada app).
- Bundles: web da Logística e Android do Agricultor, do Cliente e do Administrador exportados sem erro.
- Servidor web do Agricultor (`apps/agricultor`, porta 8083) abriu Início, Produção, Detalhe do lote, Transporte e Mensagens, sem erros no console.
- **Não verificado:** as 47 telas uma a uma no celular, e o contraste fino de espaçamentos contra o mockup. Vale revisar no SIMULATOR ONGAM.

## Decisões fora do pedido
1. **Monorepo com `packages/ui`** em vez de 4 projetos copiados: garante que o design system seja um só.
2. **Bundle ids** `com.agrodireto.<perfil>` e nomes "AgroDireto Agricultor/Cliente/Logística/Admin": sugestão minha, ajustar antes de publicar nas lojas.
3. **Fotos, mapa, QR e assinatura são ilustrações provisórias** (não são fotos reais nem QR válido). Substituir quando houver o Storage e as bibliotecas aprovadas.
4. **Tab Pedidos (18)** mostra o pedido ativo, como o mockup; "Todos os pedidos" é uma linha extra para a lista (34).
5. **Mensagens (23)** mostra a conversa aberta, como o mockup; a lista de conversas (37) abre pelo cabeçalho da conversa.
6. **Financeiro (22)** sem título e sem tab bar, como o mockup. **Detalhe do lote (15)** também sem tab bar (o Lote A tinha com).
7. **Faixa estimada (09)** calculada como ±10% da estimativa: assumi a regra pelo exemplo do mockup (2.000 → 1.800–2.200). Confirmar.
8. **Verificar código (46)** foi acrescentada: o mockup não mostra o passo do código no login.
9. **Textos de Termos e Política** são provisórios; o jurídico precisa fornecer os oficiais.
10. **Catálogos fictícios** a validar com o negócio: bancos, tipos e gravidades de ocorrência, perguntas da Ajuda, preferências de notificação.
11. **Cliente, Logística e Administrador** só foram movidos para os seus apps e ganharam o botão voltar. O refinamento profundo (como no Agricultor) fica para o próximo passo.
12. As pastas antigas `features/` e `app/` da raiz foram removidas depois de copiar o conteúdo para `apps/` (conferido arquivo a arquivo).
13. As portas 8081 e 8082 continuam presas por servidores antigos do Expo que não consegui encerrar; os apps usam 8083 a 8086.

## Sugestões para o CLAUDE.md (não editei)
- Atualizar **Estrutura** para `apps/<perfil>/{app,screens,components,hooks,dados-demo}` e `packages/ui`.
- Regra: "Componente usado por dois ou mais apps vai para `packages/ui`; usado por um só fica no app."
- Regra: "Dados fictícios só em `dados-demo/`, lidos por `hooks/`. Apagar na integração."
- Atualizar **Comandos**: rodar o Expo dentro de `apps/<perfil>`.
- A regra "Sem mock data" tem agora uma exceção explícita (Agricultor, em `dados-demo/`).
