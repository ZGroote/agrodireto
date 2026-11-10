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

## Dados (fase de integração)
Tabela de transportadoras (PRD: cadastro logístico). Migrar rascunho do AsyncStorage após signup.

## Pendências e observações
Validação local: razão social preenchida, CNPJ com 14 dígitos, telefone com 10+ dígitos. Sem máscara de CNPJ/telefone.
