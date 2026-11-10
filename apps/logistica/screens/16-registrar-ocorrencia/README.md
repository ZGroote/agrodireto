# 16 · Registrar ocorrência

**Perfil:** Logística · **Rota:** `/viagem/ocorrencia?carga=` · **Arquivo:** `RegistrarOcorrenciaScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 16)

## Objetivo
Registrar atraso, avaria ou outro problema.

## Elementos
Voltar, carga, Tipo, Gravidade, Descrição (obrigatória), Impacto, Ação realizada, Evidência (opcional), Enviar ocorrência, Acionar operação.

## Conexões
- **Chega de:** 15 Em trânsito
- **Vai para:** volta para 15 (Enviar)

## Dados (fase de integração)
Ocorrências (visíveis à operação/Administrador).

## Pendências e observações
Enviar habilita com tipo, gravidade e descrição. "Acionar operação" sem destino (Administrador, Lote D). Tipos e gravidades são catálogo do produto — revisar.
