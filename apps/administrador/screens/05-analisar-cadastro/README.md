# 05 · Analisar cadastro

**Perfil:** Administrador · **Rota:** `/cadastro?id=` · **Arquivo:** `AnalisarCadastroScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 05)

## Objetivo
Aprovar ou pedir ajuste de um cadastro.

## Elementos
Voltar, propriedade (ícone, nome, local), Propriedade, Documento de identificação, Evidências (Foto, Documento), Aprovar cadastro, Solicitar ajuste.

## Conexões
- **Chega de:** 04 Cadastros · 03 Início
- **Vai para:** 06 Documentos e mídias · volta (Aprovar)

## Dados (fase de integração)
Cadastro por id; aprovação via Edge Function + auditoria.

## Pendências e observações
Solicitar ajuste sem destino.
