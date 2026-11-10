# 10 · Inspecionar lote

**Perfil:** Administrador · **Rota:** `/inspecionar?id=` · **Arquivo:** `InspecionarLoteScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 10)

## Objetivo
Registrar a inspeção de um lote.

## Elementos
Voltar, lote, Quantidade a inspecionar, Embalagem/Qualidade conforme, Temperatura (°C), Evidências, Resultado, Concluir inspeção.

## Conexões
- **Chega de:** 09 Inspeções
- **Vai para:** volta para 09

## Dados (fase de integração)
Inspeção (visível ao Agricultor e ao Cliente).

## Pendências e observações
Concluir habilita com o resultado. Foto exige expo-image-picker. Mockup usa seletor para a temperatura; virou campo numérico com "Não medida".
