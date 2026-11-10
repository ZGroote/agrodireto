# 012 — Campos de envio de foto e vídeo + contrato de mídia compartilhado

**Data:** 2026-11-05
**Status:** Concluído. tsc ✅ (4 apps + 2 pacotes) · eslint ✅ · testado no navegador num quadro de celular.

## Pedidos
1. Na tela **Cadastrar cultura (30)**: campo para subir uma imagem que vira o ícone da cultura.
2. Na tela **Fotos e vídeos (05)**: campos para subir vídeo e imagem. A mídia é compartilhada com os outros painéis, e isso é importante.

## O que foi feito

### Contrato compartilhado
- Novo pacote `packages/dominio` (`@agrodireto/dominio`), ligado aos 4 apps: tipos da mídia, rótulos, `podeVerMidia`, `podeValidarMidia` e formatadores.
- Detalhes do fluxo entre os apps e proposta de tabela em `DOC/midias-compartilhadas.md`.

### Tela 05 · Fotos e vídeos
- Dois campos de envio explícitos: **Foto** (JPG ou PNG) e **Vídeo** (MP4, inclui drone), cada um com um pop-up de origem.
- Lista "Mídias da propriedade (n)": miniatura, remover (x), tocar seleciona.
- A mídia selecionada mostra prévia, tipo e data, autor e local aproximado, status e visibilidade própria (editável) e a barra "Enviando… 72%" ou "Na fila de envio".
- Aviso de compartilhamento: a equipe valida; compradores veem conforme a visibilidade; sem validação, aparece "Não verificado".
- A mídia do mockup (vídeo de drone, 0:28, 72%) segue como primeira da lista.

### Tela 30 · Cadastrar cultura
- Campo "Foto da cultura" com prévia, "Adicionar foto"/"Trocar foto" e pop-up (Tirar foto, Escolher da galeria, Remover foto).
- A foto é guardada por cultura (`lib/fotoCultura.ts`) e aparece como ícone da cultura em **08 Minha produção** e **09 Previsão de safra** (`components/CulturaFoto.tsx`).

### Tela 45 · Perfil público
- Mostra só o que um comprador aprovado pode ver (mesma regra do app Cliente).

### Componente novo
- `CampoUpload` em `@agrodireto/ui`: cartão tracejado de envio de arquivo.

## Verificado no navegador
- 05: campos Foto e Vídeo; pop-up da Foto; "Escolher da galeria" adiciona a foto (lista passa de 1 para 2, a nova fica selecionada, aparece "Na fila de envio").
- 30: campo de foto; pop-up; "Escolher da galeria" mostra a prévia e o botão vira "Trocar foto".
- Corrigido erro real do React no 05: botão dentro de botão (miniatura clicável com "x" de remover).

## Decisões fora do pedido
1. **Regra do comprador:** o mockup do Cliente mostra o vídeo de drone com "Não verificado", então o comprador **vê** mídia pendente (com a etiqueta) e só **não vê** a rejeitada. Tive que corrigir minha primeira versão, que escondia a pendente.
2. **Captura real ainda não existe.** As opções dos pop-ups só criam a mídia na fila, sem arquivo (`uri = 'demo'`). Precisa de `expo-image-picker` (aprovação pendente) e do Storage.
3. **O "+" pequeno da tela 05** foi removido, porque os campos Foto e Vídeo o substituem.
4. **Novo pacote** `@agrodireto/dominio` (sem dependências externas) para o contrato valer nos 4 apps.
5. O servidor da porta 19006 ficou desatualizado (iniciado antes do pacote novo). Servidor atual do Agricultor: porta **19000**.

## Pendências
- Aprovar `expo-image-picker` (e definir limites: tamanho e duração máxima do vídeo).
- Refinar os apps Administrador (validação em 06) e Cliente (Fornecedor) consumindo o contrato.
- Rejeição de mídia pelo Administrador (motivo) e o aviso ao Agricultor.
