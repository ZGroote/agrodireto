# 09 · Previsão de safra

**App:** Agricultor · **Rota:** `/producao/previsao` · **Arquivo:** `PrevisaoSafraScreen.tsx`
**Referência visual:** `mockups/1-agricultor.jpeg` (tela 09)

## Objetivo
Estimativa, faixa estimada e etapa.

## Conexões
- **Chega de:** 08 Minha produção
- **Vai para:** volta

## Dados
Lidos e gravados por `lib/culturas.ts` na tabela `culturas` (RPC `salvar_previsao`). Unidade vem do catálogo `catalogo_culturas`; faixa opcional, sem ±10% assumido.

## Observações
Faixa = ±10% da estimativa (regra a confirmar). Etapa abre uma folha de opções.
Pop-up de inserção: tocar em "Estimativa de colheita" abre uma folha para digitar o valor (máscara de milhar); a faixa estimada é recalculada.
