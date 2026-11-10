# 12 · Padrão do lote (2/3)

**App:** Agricultor · **Rota:** `/lote/padrao` · **Arquivo:** `PadraoLoteScreen.tsx`
**Referência visual:** `mockups/1-agricultor.jpeg` (tela 12)

## Objetivo
Padrão, calibre, embalagem e evidências.

## Conexões
- **Chega de:** 11 Novo lote
- **Vai para:** 13 Preço e retirada

## Dados
Lidos por `hooks/dados.ts` (useCatalogo, LoteDraftContext). Hoje vêm de dados-demo (fictício).

## Observações
Duas evidências ilustrativas com X. O + só soma uma evidência (foto real exige expo-image-picker).
Pop-up do "+": Tirar foto ou Escolher da galeria (soma uma evidência; a captura real exige expo-image-picker).
Evidências reais: fotos e vídeos (até 100 de cada). As mídias do lote são apagadas 30 dias depois do encerramento da produção.
