# 18 · Papéis e permissões

**Perfil:** Administrador · **Rota:** `/perfil/papeis` · **Arquivo:** `PapeisPermissoesScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 18)

## Objetivo
Mostrar o que cada papel da equipe pode (só leitura) e gerir a equipe (B05, DOC 034 e 036).

## Elementos
Voltar, Função (os 7 papéis), Permissões (Pode / Não pode por ação). Fora do mockup: Equipe (lista; o geral concede, troca e revoga por e-mail). Tab bar.

## Conexões
- **Chega de:** 24 Configurações
- **Vai para:** volta (Salvar)

## Dados
`lib/equipe.ts`: `listar_equipe`, `conceder_acesso_equipe`, `revogar_acesso_equipe`; matriz copiada de `equipe_pode` (teste de paridade).

## Pendências e observações
Desvio do mockup aprovado: sem toggles e sem "Salvar permissões", porque a matriz é fixa no servidor. Acesso: geral e auditor (ler_equipe); só o geral altera.
