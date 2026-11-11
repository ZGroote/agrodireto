# G03 — Cadastrar veículo e motorista

**Pedido:** frente Logística, tarefa G03: trocar os botões sem ação das telas 03 Veículos e 04 Motoristas por cadastro válido, ligado à transportadora e com os documentos necessários.

**Plano aprovado pelo Maestro** com estas decisões:
- (a) Guardar só os dados dos documentos. O envio de arquivo fica para depois, sem biblioteca nova.
- (b) A transportadora pode cadastrar a frota enquanto está em análise. A exigência de cadastro aprovado fica para a G04.
- (c) Nesta tarefa não há exclusão.
- (d) A operação identifica o responsável pela RLS. A ligação com a viagem fica para a G04.
- Ajuste obrigatório: nenhum CHECK depende de `current_date`. A recusa de documento vencido acontece na RPC.

## O que foi feito

- **Migration `20261111110000_veiculos_motoristas.sql`** (só tabelas novas):
  - `veiculos`: placa única, no padrão antigo ou Mercosul; RENAVAM com 11 dígitos; tipo (baú, refrigerado, graneleiro, boiadeiro, carroceria); capacidade de 1 a 100.000 kg; validade do seguro.
  - `motoristas`: nome; CPF validado pelo dígito, único por transportadora; CNH com 11 dígitos, categoria B a E e validade; veículo opcional.
  - A FK composta `(veiculo_id, organizacao_id)` faz o banco recusar vínculo com veículo de outra empresa.
  - Nova função `agrodireto_privado.cpf_valido`, imutável.
  - RLS de leitura para membros da organização ou equipe autorizada (com MFA). Não há insert nem update direto.
  - RPCs `salvar_veiculo` e `salvar_motorista`: `security definer`, `search_path = ''`, execução só para `authenticated`. `p_id` nulo cria um registro; preenchido, edita. Exigem membro da transportadora e recusam a equipe. Seguro ou CNH vencidos são recusados com `PT422`.
- **Teste `supabase/tests/veiculos_motoristas.sql`** (`begin ... rollback`). Cobre:
  - persistir e reler, com normalização;
  - editar e desvincular;
  - recusar vínculo com veículo alheio, edição ou gravação na frota de outra empresa, placa repetida ou inválida, tipo e capacidade inválidos, CPF inválido ou repetido, categoria A, documento vencido e insert/update direto;
  - outra empresa não lê a frota;
  - o mesmo CPF pode estar em duas transportadoras;
  - a equipe sem MFA não lê; com MFA, vê motorista, veículo e telefone da transportadora;
  - privilégios de `anon`.
- **`apps/logistica/lib/frota.ts`:** leitura da frota, gravação com validação local e mensagens por código de erro.
- **Telas 03 e 04:**
  - lista real com tipo, capacidade, placa e selo de validade (aviso quando vencido);
  - formulário na própria tela para criar ou editar (toque na linha);
  - o motorista escolhe um veículo da própria frota ou "Sem veículo vinculado";
  - sem transportadora cadastrada, a tela leva ao cadastro 02.

## Arquivos

- `supabase/migrations/20261111110000_veiculos_motoristas.sql` (novo)
- `supabase/tests/veiculos_motoristas.sql` (novo)
- `apps/logistica/lib/frota.ts` (novo)
- `apps/logistica/screens/03-veiculos/VeiculosScreen.tsx`, `README.md`
- `apps/logistica/screens/04-motoristas/MotoristasScreen.tsx`, `README.md`

## Verificação

- `npx tsc --noEmit -p apps/logistica`: sem erros. O `npx tsc --noEmit` na raiz não tem tsconfig e só imprime a ajuda.
- `npx eslint .`: sem erros.
- `npm test`: 18 testes do domínio e 43 do worker passaram.
- **Não rodado:** o teste SQL, porque esta máquina não tem Postgres nem Docker. Ele roda no SQL Editor depois de aplicar a migration. O ensaio pelas telas com conta real também depende da migration aplicada no `agro`.

## Decisões fora do pedido

- A validade é digitada como dd/mm/aaaa, com máscara, em vez do `DateField`. O calendário anda mês a mês, o que é lento para validades a anos de distância.
- A placa é única no sistema inteiro, como o CNPJ. Uma empresa pode bloquear a placa de outra, mesmo risco do CNPJ. O CPF do motorista é único só dentro da transportadora, porque motorista agregado trabalha para mais de uma.
- O RENAVAM só tem o formato verificado, sem dígito verificador.
- Gravações simultâneas na mesma linha: vale a última. Não há controle de versão, ao contrário do cadastro da transportadora.
- O selo mostra a validade do documento ("CNH D até…", "Seguro até…"), não "CNH verificada". Ninguém confere o documento ainda.
- A tela 05 Documentos continua sem envio de arquivo, como decidido em (a).
