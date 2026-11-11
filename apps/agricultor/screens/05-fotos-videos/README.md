# 05 · Fotos e vídeos

**App:** Agricultor · **Rota:** `/midias` · **Arquivo:** `FotosVideosScreen.tsx`
**Referência visual:** `mockups/1-agricultor.jpeg` (tela 05)

## Objetivo
Enviar mídia (inclui drone) com visibilidade.

## Conexões
- **Chega de:** 04 Minha propriedade (linha "Fotos e vídeos", que não está no mockup)
- **Vai para:** volta

## Dados
Reais (D07): `lib/midiasRemotas.ts` lê `midias` da propriedade escolhida e a fila local do aparelho. Envio: `reservar_midia` → URL assinada → PUT do arquivo direto do disco, com progresso → `confirmar_midia`. Sem propriedade cadastrada, a tela pede o cadastro; sem mídia, mostra a lista vazia.

## Observações
Barra "Enviando… 72%" e metadados como no mockup. Seleção de mídia exige expo-image-picker.
Pop-up do "+": Tirar foto, Escolher da galeria, Gravar vídeo (cada opção soma uma mídia à fila; a captura real exige expo-image-picker). "Não verificado" com ícone de relógio, como no mockup.
Reconstruída: campos de envio de Foto e de Vídeo (inclui drone), lista "Mídias da propriedade" e visibilidade por mídia. A mídia é COMPARTILHADA com os apps Administrador (valida) e Cliente (vê conforme a visibilidade): contrato em @agrodireto/dominio e DOC/midias-compartilhadas.md. O "+" pequeno foi removido.
Seletor real (expo-image-picker): galeria com seleção múltipla, câmera e vídeo de drone. Limite de 100 fotos e 100 vídeos; 52 formatos de imagem e 37 de vídeo (@agrodireto/dominio). Arquivo recusado aparece com o motivo. A otimização automática roda no servidor depois do envio (DOC/midias-compartilhadas.md).

D07: o seletor de visibilidade saiu (a tabela `midias` não guarda visibilidade; toda mídia é privada até a exibição da D08) e o vídeo de drone é guardado como vídeo. Só a mídia ainda na fila pode ser removida pelo X.
