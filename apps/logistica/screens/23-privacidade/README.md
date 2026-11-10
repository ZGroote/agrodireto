# 23 · Privacidade

**Perfil:** Logística · **Rota:** `/perfil/privacidade` · **Arquivo:** `PrivacidadeScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 23)

## Objetivo
Permissões e sessões.

## Elementos
Voltar, Localização durante a viagem, Permitir evidências, Sessões ativas, Trocar conta. Tab bar.

## Conexões
- **Chega de:** 22 Configurações
- **Vai para:** Seleção de perfil (Trocar conta)

## Dados (fase de integração)
Permissões do sistema, sessões do Supabase Auth.

## Pendências e observações
Toggles começam desligados (nada concedido). Permissões reais exigem expo-location/expo-image-picker. Sessões sem tela.
