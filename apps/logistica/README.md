# Perfil · Logística

Referência visual: `mockups/2-logistica.jpeg` (24 telas). Mais Onboarding e Paywall, que não têm mockup.

## Pastas

| Pasta | Conteúdo |
|---|---|
| `routes.ts` | Rotas do perfil (fonte única) e catálogo das telas |
| `screens/NN-nome/` | Uma pasta por tela: `*Screen.tsx` + `README.md` |

As telas navegam sempre por `rotasLogistica`, nunca por caminho escrito à mão.
O id da carga passa de tela em tela como `?carga=` ao longo da viagem (10 → 18).

## Mapa de conexões

```
Seleção de perfil
  └─ 00a Onboarding → 00b Paywall → 01 Entrar ─┬─ 06 Início (tabs)
                                               └─ Criar conta → 02 Transportadora → 03 Veículos
                                                    → 04 Motoristas → 05 Documentos → (Concluir) 06 Início

Tabs: Início · Cargas · Agenda · Mensagens · Perfil

06 Início ─── Ver carga ──┐
07 Cargas ─── Ver oferta ─┴─ 08 Detalhe da carga ─ Aceitar → 09 Agenda

09 Agenda → 10 Rota da coleta → 11 Chegada ao produtor → 12 Conferir coleta
          → 13 Peso e evidências → 14 Iniciar transporte → 15 Em trânsito
                                                            ├─ 16 Registrar ocorrência (volta à 15)
                                                            └─ 17 Chegada ao comprador → 18 Prova de entrega
                                                                 → (fecha a viagem) 19 Histórico

22 Perfil ─┬─ Conta → 02 Transportadora
           ├─ Privacidade e segurança → 23 Privacidade ─ Trocar conta → Seleção de perfil
           ├─ Histórico de viagens → 19
           ├─ Repasses → 20
           └─ Sair → Seleção de perfil

24 Sem conexão: estado offline (por enquanto, só pelo Mapa de telas).
```

## Onde a tab bar aparece

- **Com tab bar** (como no mockup): 06, 07, 09, 21, 22, 23.
- **Sem tab bar** (fluxos em tela cheia): 02–05, 08, 10–20, 24.

## Conexões com outros perfis (lotes seguintes)

| Origem | Destino | Lote |
|---|---|---|
| 16 · Acionar operação / ocorrências | Administrador 13 · Ocorrências | fase de dados |
| 21 · Mensagens da carga | Cliente · Mensagens do pedido | C |
| Agricultor 21 · Registrar ocorrência | base visual: 16 · Registrar ocorrência | — |
