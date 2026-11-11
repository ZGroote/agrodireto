# 02 · Transportadora

**Perfil:** Logística · **Rota:** `/cadastro` · **Arquivo:** `TransportadoraScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 02)

## Objetivo
Dados da transportadora.

## Elementos
Voltar, título, subtítulo, Razão social, CNPJ, Contato, Salvar cadastro.

## Conexões
- **Chega de:** 01 Entrar (Criar conta) · 22 Configurações (Conta)
- **Vai para:** 03 Veículos

## Dados
`cadastros_transportadora` (migration `20261111087000_transportadoras.sql`) por `lib/transportadora.ts`.
Primeiro envio cria a organização do tipo transportadora com a conta como titular; segue para 03 Veículos.
Com ajustes pedidos pela operação, mostra o motivo e permite reenviar. Em análise ou aprovado, só consulta.

## Pendências e observações
Campos além do mockup (pedido do C03): nome do contato, cidade/UF, estados atendidos e tipos de carga.
Validação local só de formato; dígitos do CNPJ (inclusive alfanumérico) e listas são conferidos no banco. Sem máscara de CNPJ/telefone.
