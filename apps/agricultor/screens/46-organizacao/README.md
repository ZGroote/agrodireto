# 46 · Organização

**App:** Agricultor · **Rota:** `/perfil/organizacao` · **Arquivo:** `OrganizacaoScreen.tsx`
**Referência visual:** criada além do mockup (segue Configurações e Segurança)

## Objetivo
Escolher explicitamente a organização de produtor em que o usuário trabalha e, se for titular, incluir membro por e-mail.

## Conexões
- **Chega de:** 24 Configurações
- **Vai para:** volta a Configurações

## Dados
`lib/organizacoes.ts`: `listar_meus_vinculos`, `contexto_atual`, `trocar_contexto` e `incluir_membro` (B01, DOC 027 e 030).

## Observações
A troca é registrada no servidor. A inclusão sempre responde de forma neutra, para não revelar se o e-mail tem conta. Sem convite por enquanto.
