# E03 — Demandas do comprador (versão básica)

**Data:** 11/11/2026  
**Frente:** 4ª Frente (`frente/administrador`)  
**Pedido:** implementar a versão básica de E03 (demandas de compra): comprador aprovado publica demanda (cultura do catálogo, quantidade, unidade válida da cultura, prazo, UF SP, observação), lista/edita/encerra as próprias; produtores com propriedade aprovada veem demandas abertas no Agricultor (somente leitura). Sem matching (E04).

## Plano enviado ao Maestro

1. Migration `20261111250000_demandas_compra.sql`: tabela `public.demandas_compra` com RLS por organização compradora aprovada.
2. RPCs `security definer` com `search_path = ''`: `salvar_demanda_compra`, `encerrar_demanda_compra` (exigem `organizacao_id` explícito com `e_membro` + `status = 'aprovada'` em `cadastros_comprador`, cultura ativa, unidade válida da cultura, `uf = 'SP'` e prazo vigente) e `listar_demandas_abertas` (leitura para produtor com propriedade aprovada ou equipe com `ler_ofertas`).
3. Teste SQL `supabase/tests/demandas_compra.sql` (`begin ... rollback`, sem chamadas a `agrodireto_privado.*` no papel `authenticated`) + teste Node `apps/cliente/test/demandas.test.cjs`.
4. App Cliente: `lib/demandas.ts` + tela `30 · Demandas de compra` (`/demandas`), ligada em `02 · Início` e `09 · Minhas cotações`.
5. App Agricultor: `lib/demandas.ts` + seção de demandas abertas em `16 · Cotações` (somente leitura, com filtro por cultura).

## O que foi feito

### 1. Banco de dados (`supabase/migrations/20261111250000_demandas_compra.sql`)

- **`public.demandas_compra`:**
  - `id uuid primary key`, `organizacao_id uuid not null references public.cadastros_comprador(organizacao_id) on delete cascade`, `catalogo_id uuid not null references public.catalogo_culturas(id)`.
  - `quantidade numeric` (`> 0` e `<= 1.000.000.000`), `unidade text` (`kg`, `cx`, `t`, `sc`), `prazo date not null`, `uf text not null default 'SP' check (uf = 'SP')`, `observacao text not null default '' check (char_length(observacao) <= 1000)`.
  - `status text not null default 'aberta' check (status in ('aberta', 'encerrada'))`, `criado_por`, `atualizado_por`, `criada_em`, `atualizada_em`, `encerrada_em` com invariante `(status = 'encerrada') = (encerrada_em is not null)`.
- **RLS (`demandas_compra_leitura`):**
  - Libera `SELECT` apenas para membros (`agrodireto_privado.e_membro(organizacao_id)`) cuja empresa esteja `status = 'aprovada'` em `public.cadastros_comprador`, ou para a equipe autorizada com `public.equipe_pode('ler_ofertas')`.
  - Nenhuma escrita direta pela tabela (`INSERT`/`UPDATE`/`DELETE` revogados).
- **RPCs (`security definer`, `search_path = ''`, `execute` apenas para `authenticated`):**
  - `public.salvar_demanda_compra(p_id, p_organizacao_id, p_catalogo_id, p_quantidade, p_unidade, p_prazo, p_uf, p_observacao) → uuid`:
    - Exige sessão, bloqueia equipe interna, exige `p_organizacao_id` explícito e vínculo `e_membro(p_organizacao_id)` (`42501`).
    - Confere com `FOR SHARE` que `cadastros_comprador` dessa `p_organizacao_id` está `aprovada` (`PT403`) — segue a regra do DOC 032 (um membro de outra empresa aprovada não publica demanda por uma empresa em análise).
    - Exige `uf = 'SP'` (`PT422`), `p_prazo >= hoje` em `America/Sao_Paulo` (`PT422`), e cultura ativa com `p_unidade = any(unidades)` (`PT422`).
    - Quando `p_id` é nulo, cria a demanda; quando informado, atualiza apenas se a demanda pertencer à mesma `p_organizacao_id` e estiver `aberta` (`PT404`).
  - `public.encerrar_demanda_compra(p_id, p_organizacao_id) → void`:
    - Mesmas checagens de vínculo e aprovação da empresa compradora; marca `status = 'encerrada'` e `encerrada_em`.
  - `public.listar_demandas_abertas(p_busca, p_pagina) → table`:
    - Exige produtor membro de organização com ao menos uma propriedade `aprovada` (ou equipe com `ler_ofertas`); caso contrário lança `PT403`.
    - Retorna apenas demandas `aberta`, de empresa compradora `aprovada`, com `prazo >= hoje`, ordenadas por prazo mais próximo.

### 2. App Cliente (`apps/cliente`)

- `apps/cliente/lib/demandas.ts`: leitura do catálogo ativo (`catalogo_culturas`), listagem das demandas da empresa em uso (`organizacaoEmUso()`), publicação/edição (`salvar_demanda_compra`) e encerramento (`encerrar_demanda_compra`), com validação local de quantidade, data e UF (`SP`).
- `apps/cliente/screens/30-demandas/DemandasCompraScreen.tsx` e `README.md` + rota `apps/cliente/app/(app)/demandas.tsx` (`rotasCliente.demandas` em `apps/cliente/routes.ts`):
  - Abas `Abertas` e `Encerradas`, formulário de criação/edição com seleção de cultura do catálogo, seletor de unidade restrito às unidades da cultura escolhida, quantidade, prazo (`DateField`), UF fixa `SP` e observação, além do botão `Encerrar demanda`.
  - Tratamento de estados: carregando, empresa não selecionada (`Escolher empresa`), sem empresa cadastrada, erro e lista vazia.
- Atalhos adicionados em `02 · Início` (`InicioScreen.tsx`) e `09 · Minhas cotações` (`MinhasCotacoesScreen.tsx`).

### 3. App Agricultor (`apps/agricultor`)

- `apps/agricultor/lib/demandas.ts`: chamada à RPC `listar_demandas_abertas` com filtro por nome de cultura e paginação.
- `apps/agricultor/screens/16-cotacoes/CotacoesScreen.tsx`: exibe o card `"Demandas abertas de compradores (SP)"` (somente leitura) com busca por cultura, mostrando cultura, quantidade, unidade, razão social do comprador, cidade/UF, prazo e observação.

## O que ficou fora (escopo E03 básico)

- Matching explicável entre demandas e lotes (`E04`) e compras recorrentes (`F05`), conforme pedido.
- Campos avançados por segmento na demanda (dependem da migração de `D09` e documentos de `D10`).

## Arquivos alterados

- `supabase/migrations/20261111250000_demandas_compra.sql` (novo)
- `supabase/tests/demandas_compra.sql` (novo)
- `apps/cliente/lib/demandas.ts` (novo)
- `apps/cliente/screens/30-demandas/DemandasCompraScreen.tsx` (novo)
- `apps/cliente/screens/30-demandas/README.md` (novo)
- `apps/cliente/app/(app)/demandas.tsx` (novo)
- `apps/cliente/routes.ts`
- `apps/cliente/screens/02-inicio/InicioScreen.tsx`
- `apps/cliente/screens/09-minhas-cotacoes/MinhasCotacoesScreen.tsx`
- `apps/cliente/test/demandas.test.cjs` (novo)
- `apps/agricultor/lib/demandas.ts` (novo)
- `apps/agricultor/screens/16-cotacoes/CotacoesScreen.tsx`
- `DOC/2026-11-11_043_e03-demandas-comprador.md` (novo)

## Verificação

- `npm test` (incluindo os 3 novos testes em `apps/cliente/test/demandas.test.cjs`).
- `npx eslint .` e `npm run typecheck`.
- **O que aplicar no Supabase `agro` (Maestro):**
  1. Aplicar `supabase/migrations/20261111250000_demandas_compra.sql`.
  2. Rodar `supabase/tests/demandas_compra.sql` (transação com `begin ... rollback`).
