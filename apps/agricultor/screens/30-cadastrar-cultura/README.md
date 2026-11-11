# 30 · Cadastrar cultura

**App:** Agricultor · **Rota:** `/cultura/nova` · **Arquivo:** `CadastrarCulturaScreen.tsx`
**Referência visual:** criada além do mockup

## Objetivo
Cadastrar o que está sendo plantado.

## Conexões
- **Chega de:** 08 Minha produção
- **Vai para:** volta

## Dados
Cultura escolhida de `catalogo_culturas`; gravada em `culturas` pela RPC `salvar_cultura` (`lib/culturas.ts`). Etapas ainda vêm de `hooks/dados.ts` (useCatalogo).

## Observações
CRIADA ALÉM DO MOCKUP.
"Data do plantio" abre o pop-up de calendário.
Campo "Foto da cultura": a imagem vira o ícone da cultura em 08 e 09 (components/CulturaFoto.tsx, lib/fotoCultura.ts). Captura real exige expo-image-picker (aprovação pendente).
A foto da cultura usa o seletor real e valida o formato. Apagada 30 dias depois do encerramento da produção.
