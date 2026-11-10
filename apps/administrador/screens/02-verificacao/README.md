# 02 · Verificação de segurança

**Perfil:** Administrador · **Rota:** `/verificacao` · **Arquivo:** `VerificacaoScreen.tsx`
**Referência visual:** `mockups/4-administrador.jpeg` (tela 02)

## Objetivo
Segundo fator: código de 6 dígitos por e-mail.

## Elementos
Voltar, título, subtítulo, 6 caixas de código, Confirmar código, Não recebeu o código?, Recuperar por e-mail.

## Conexões
- **Chega de:** 01 Acesso da equipe
- **Vai para:** 03 Início

## Dados (fase de integração)
Supabase Auth MFA.

## Pendências e observações
Sem auth: 6 dígitos quaisquer liberam o acesso. Reenvio sem destino.
