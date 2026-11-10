# Perfil · Administrador (equipe AgroDireto)

Referência visual: `mockups/4-administrador.jpeg` (24 telas). Mais Onboarding e Paywall, que não têm mockup.

## Pastas

| Pasta | Conteúdo |
|---|---|
| `routes.ts` | Rotas do perfil (fonte única) e catálogo das telas |
| `screens/NN-nome/` | Uma pasta por tela: `*Screen.tsx` + `README.md` |

As telas navegam sempre por `rotasAdministrador`, nunca por caminho escrito à mão.
Toda ação que muda estado (aprovar, bloquear, decidir, conciliar) será Edge Function + registro em Auditoria (23).

## Mapa de conexões

```
Seleção de perfil ─ "Acesso da equipe AgroDireto"
  └─ 00a Onboarding → 00b Paywall → 01 Acesso da equipe → 02 Verificação (6 dígitos) → 03 Início (tabs)

Tabs: Início · Operação · Cadastros · Alertas · Perfil
      (03)     (11 Torre)  (04)        (13 Ocorrências) (24)

03 Início ─┬─ cadastros → 04 · ocorrências → 13 · cargas → 11
           ├─ Revisar cadastros → 05 Analisar cadastro → 06 Documentos e mídias
           └─ atalhos: 07 Revisão de lotes → 08 Rastreabilidade → 12 Pedido e carga
                       09 Inspeções → 10 Inspecionar lote
                       15 Conciliação · 16 Relatórios

04 Cadastros → 05 Analisar cadastro → 06
11 Torre logística → 12 Pedido e carga → Abrir operação → 14 Disputa comercial
13 Ocorrências → (com dados) Assumir → 12

24 Perfil ─┬─ Administração: 17 Usuários · 18 Papéis · 19 Catálogo · 20 Regras
           │                 21 Conteúdo · 22 Integrações · 23 Auditoria
           └─ Sair → Seleção de perfil
```

## Onde a tab bar aparece

- **Com tab bar:** 03, 04, 11, 13, 17–24.
  - No mockup, 04, 11 e 13 aparecem sem tab bar. Aqui elas são raízes de tab, então mostram a barra.
- **Sem tab bar** (fluxos em tela cheia): 05–10, 12, 14–16.

## Conexões com outros perfis

| Origem | Destino aqui | Status |
|---|---|---|
| Logística 16 · Registrar ocorrência | 13 · Ocorrências | fase de dados (mesma tabela) |
| Cliente 20 · Registrar divergência | 13 · Ocorrências / 14 · Disputa | fase de dados |
| Agricultor 15 / Cliente 06 · Inspeções | 10 · resultado da inspeção | fase de dados — Agricultor e Cliente veem o **resultado**, não esta tela interna |
| Logística 16 · Acionar operação | 13 · Ocorrências | fase de dados |
