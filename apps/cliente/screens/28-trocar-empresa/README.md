# 28 · Trocar empresa

**Perfil:** Cliente · **Rota:** `/empresas` · **Arquivo:** `TrocarEmpresaScreen.tsx`
**Referência visual:** linha "Trocar empresa" da tela 24 em `mockups/3-cliente.jpeg`; a tela em si não está no mockup (segue a 24)

## Objetivo
Escolher a empresa compradora em uso. A troca é registrada no servidor (B01, DOC 027 e 032).

## Conexões
- **Chega de:** 24 Configurações, 26 Cadastro da empresa (quando falta escolher)
- **Vai para:** —

## Dados
`lib/organizacoes.ts`: `listar_meus_vinculos`, `contexto_atual` e `trocar_contexto`.
