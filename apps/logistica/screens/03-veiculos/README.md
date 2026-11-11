# 03 · Veículos

**Perfil:** Logística · **Rota:** `/cadastro/veiculos` · **Arquivo:** `VeiculosScreen.tsx`
**Referência visual:** `mockups/2-logistica.jpeg` (tela 03)

## Objetivo
Frota da transportadora.

## Elementos
Voltar, título, lista (estado vazio), Adicionar veículo, Continuar.

## Conexões
- **Chega de:** 02 Transportadora
- **Vai para:** 04 Motoristas (Continuar)

## Dados (fase de integração)
Veículos (G03): placa, RENAVAM, tipo, capacidade e validade do seguro, gravados por `salvar_veiculo`. Seguro vencido é recusado no cadastro.

## Pendências e observações
Formulário de veículo sem mockup. "Continuar" não está no mockup (liga o cadastro).
