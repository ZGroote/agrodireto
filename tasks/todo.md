# AgroDireto — backlog executável do piloto

Data: 10/11/2026. Plano e decisões: [plan.md](plan.md).

Etapa 0 iniciada em 10/11/2026. O estado de cada tarefa está na lista abaixo.

## Como executar

- Trabalhar uma fase aprovada por vez, preservando o que já existe. Escolher uma tarefa sem bloqueios; demonstrar seu aceite antes de fechar.
- Caminhos são módulos prováveis, não arquivos já criados. Limitar cada entrega a aproximadamente 3–5 arquivos de lógica; se ultrapassar, subdividir antes de codar, preservando o mesmo aceite.
- Tarefas com mais de um app são pacotes de trabalho: entregar primeiro contrato/servidor e depois uma integração por perfil; não fazer uma alteração única enorme.
- Cada tarefa deve registrar implementação, verificação e decisão no DOC. Rodar typecheck/lint e testes focados; exportar apps afetados quando houver mudança de integração ou build.
- Comandos de novos testes serão definidos junto da implementação. Não criar testes que apenas espelhem componentes visuais.
- Checkpoints demonstram comportamento entre perfis. Verificações técnicas verdes sozinhas não concluem um marco.
- Prioridade: 0–3 e correções D04–D06 primeiro; 4–5 completam a transação; 6 bloqueia abertura a usuários reais. Retenção e isolamento são obrigatórios antes de seus respectivos riscos.

## Etapa 0 — Preparação

### A01 — Fechar o recorte operacional

- [ ] Concluída e verificada.

**Estado:** recorte inicial registrado em [piloto.md](../DOC/piloto.md). Região e culturas ficam pendentes por decisão do usuário; demais decisões têm responsável proposto e marco de fechamento.

**Responsável:** Produto/operação. **Dependências:** Nenhuma.

**Entrega e aceite:** Registrar região, 2–4 culturas, participantes, unidades, aprovação, responsáveis, SLA e metas; registrar papel comercial, frete, perdas e decisão sobre paywall no piloto.

**Verificação:** Revisão com o responsável do negócio; questões não decididas ficam com responsável e prazo, sem valores inventados.

**Escopo provável:** DOC/piloto.md (novo).

### A02 — Recuperar a origem versionada

- [x] Concluída e verificada.

**Resultado:** base recebida preservada no commit local `f1492b1`. Uma cópia limpa instalou as dependências pelo lockfile. Nenhum remoto foi vinculado; nenhum repositório correspondente foi encontrado na conta GitHub consultada.

**Responsável:** Engenharia. **Dependências:** Nenhuma.

**Entrega e aceite:** Identificar repositório original ou preparar versionamento desta cópia; preservar estado inicial e excluir segredos/artefatos; documentar setup.

**Verificação:** Clonar/obter cópia limpa e conferir arquivos necessários; não sobrescrever histórico eventualmente existente.

**Escopo provável:** raiz; .gitignore; README.md (novo).

### A03 — Preparar ambiente de integração

- [ ] Concluída e verificada.

**Estado:** [ambientes e setup](../DOC/ambientes.md) preparados. Não há projeto Supabase de desenvolvimento/homologação e o host não tem a CLI nem o runtime de contêiner disponíveis. Falta iniciar ou provisionar um ambiente e testar a conexão.

**Responsável:** Backend. **Dependências:** A01, A02.

**Entrega e aceite:** Separar desenvolvimento/homologação/piloto; obter acesso ao projeto Supabase correto; manter credenciais privilegiadas fora dos apps.

**Verificação:** Validar ambiente alvo e configuração sem expor chaves; nenhuma mutação em produção para testar setup.

**Escopo provável:** supabase/config.toml; configuração de ambiente; DOC/ambientes.md (novos).

### A04 — Automatizar as verificações existentes

- [x] Concluída e verificada localmente.

**Resultado:** `npm run verify` passou em cópia limpa: tipos, lint, 42 testes (incluindo FFmpeg real) e export web dos quatro apps. Erro de TypeScript inserido somente na cópia descartável causou saída 2. Workflow preparado; primeira execução no GitHub depende de remoto.

**Responsável:** Engenharia. **Dependências:** A02.

**Entrega e aceite:** Reproduzir typecheck, lint, 42 testes existentes e export web; indicar separadamente teste FFmpeg opcional e resultado real.

**Verificação:** Pipeline executa em cópia limpa; falha proposital controlada bloqueia integração; sem afirmar build nativo validado.

**Escopo provável:** package.json; workflow de CI (novo); README.md.

### Checkpoint da etapa 0

- [ ] Base reproduzida em cópia limpa e ambiente de integração validado. Dados persistidos e perfis autorizados serão demonstrados na Etapa 1.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 1 — Identidade e cadastros

### B01 — Implementar identidade e isolamento

- [ ] Concluída e verificada.

**Responsável:** Backend. **Dependências:** A01, A03.

**Entrega e aceite:** Representar usuário, empresa/membro, papel e aprovação; acesso administrativo não pode ser autoatribuído; RLS nega acesso cruzado por padrão.

**Verificação:** Usuário A não lê/altera dados privados de B; usuário comum não se promove; endpoints rejeitam ausência de sessão.

**Escopo provável:** supabase/migrations (nova migração); teste RLS; packages/dominio/identidade.ts (novo).

### B02 — Integrar sessão do Agricultor

- [ ] Concluída e verificada.

**Responsável:** App Agricultor. **Dependências:** B01.

**Entrega e aceite:** Login, criação e recuperação usam Auth real; sessão é restaurada; logout invalida acesso; remover OTP da demo do caminho de piloto.

**Verificação:** Entrar, reiniciar e recuperar conta; código inválido e sessão expirada não liberam rotas; testar URL direta.

**Escopo provável:** apps/agricultor/lib; app layouts; telas de entrada/verificação.

### B03 — Integrar sessão do Cliente

- [ ] Concluída e verificada.

**Responsável:** App Cliente. **Dependências:** B01, B02.

**Entrega e aceite:** Reutilizar contrato de sessão; concluir cadastro/recuperação atualmente sem ação; proteger rotas por papel.

**Verificação:** Mesmo ensaio de B02 com comprador, inclusive tentativa de acessar recursos administrativos.

**Escopo provável:** apps/cliente/lib; app layouts; telas de entrada/cadastro.

### B04 — Integrar sessão da Logística

- [ ] Concluída e verificada.

**Responsável:** App Logística. **Dependências:** B01, B02.

**Entrega e aceite:** Autenticar usuários operacionais e identificar transportadora/vínculo; proteger ações por papel.

**Verificação:** Motorista/transportadora não acessam operação de outro vínculo; sessão expirada bloqueia mutação.

**Escopo provável:** apps/logistica/lib; app layouts; telas de entrada/cadastro.

### B05 — Proteger o acesso administrativo

- [ ] Concluída e verificada.

**Responsável:** App Administrador. **Dependências:** B01, B02.

**Entrega e aceite:** Acesso por concessão autorizada; verificação real de segundo fator conforme regra; seis dígitos arbitrários não liberam acesso.

**Verificação:** Testar usuário sem permissão, segundo fator inválido e revogação de acesso.

**Escopo provável:** apps/administrador/lib; layouts; telas de acesso/verificação.

### C01 — Persistir propriedade do produtor

- [ ] Concluída e verificada.

**Progresso:** rascunho local dos campos de propriedade implementado e verificado no navegador sem Supabase. Cadastro vinculado ao usuário, migração do rascunho e gravação remota continuam pendentes.

**Responsável:** Agricultor + backend. **Dependências:** B02.

**Entrega e aceite:** Salvar dados validados e recuperar ao reiniciar; associar ao usuário/empresa real; rascunho antes do cadastro migra uma vez.

**Verificação:** Criar, reabrir, editar e simular falha; nenhum ID fixo; segunda migração do rascunho não duplica registro.

**Escopo provável:** migração de propriedade; hook de dados; tela de editar propriedade; testes.

### C02 — Persistir cadastro empresarial do comprador

- [ ] Concluída e verificada.

**Responsável:** Cliente + backend. **Dependências:** B03.

**Entrega e aceite:** Gravar empresa, contatos e endereço necessários ao piloto com estado de aprovação.

**Verificação:** Reabrir conta e conferir dados; validar campos obrigatórios; acesso cruzado negado.

**Escopo provável:** migração de cadastro; hook; tela de cadastro; testes.

### C03 — Persistir cadastro da transportadora

- [ ] Concluída e verificada.

**Responsável:** Logística + backend. **Dependências:** B04.

**Entrega e aceite:** Salvar transportadora e estado de aprovação, sem vínculos fictícios.

**Verificação:** Reabrir cadastro; editar com permissão; negar atualização por outra empresa.

**Escopo provável:** migração de transportadora; hook; tela de cadastro; testes.

### C04 — Aprovar cadastros na operação

- [ ] Concluída e verificada.

**Responsável:** Administrador + backend. **Dependências:** B05, C01, C02, C03.

**Entrega e aceite:** Listar pendências reais; aprovar/rejeitar com motivo, autor e data; regras de publicação/compra consultam aprovação.

**Verificação:** Administrador aprova e outro app vê status; repetição não duplica evento; usuário comum não aprova.

**Escopo provável:** função de aprovação; tabela de auditoria; tela de análise; testes.

### Checkpoint da etapa 1

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 2 — Oferta real e mídia

### D01 — Cadastrar cultura e previsão básica

- [ ] Concluída e verificada.

**Responsável:** Agricultor + backend. **Dependências:** C01, C04.

**Entrega e aceite:** Persistir cultura, unidade e previsão do catálogo do piloto; nenhuma faixa ±10% assumida sem validação.

**Verificação:** Cadastrar/reabrir; recusar unidade inválida; não perder campos ao anexar foto.

**Escopo provável:** migração de cultura; hook; tela de cultura; testes.

### D02 — Persistir rascunho de lote

- [ ] Concluída e verificada.

**Responsável:** Agricultor + backend. **Dependências:** D01.

**Entrega e aceite:** Salvar quantidade, unidade, qualidade e preço com origem rastreável; retomar etapas após reiniciar; distinguir rascunho de publicado.

**Verificação:** Interromper entre etapas e retomar; falha de rede mantém rascunho identificado; impedir valores inválidos.

**Escopo provável:** migração de lote; contrato em dominio; LoteDraftContext; hook; teste.

### D03 — Criar armazenamento privado de mídia

- [ ] Concluída e verificada.

**Responsável:** Backend. **Dependências:** B01, D02.

**Entrega e aceite:** Vincular mídia ao dono e lote/propriedade reais; impor visibilidade e quotas no servidor; definir tamanho/duração aceitáveis.

**Verificação:** Negar leitura/upload de terceiro; quota concorrente não ultrapassa limite; arquivo rejeitado não aparece ao comprador.

**Escopo provável:** migração de midias; políticas Storage; função de autorização; teste.

### D04 — Corrigir gravação do worker

- [ ] Concluída e verificada.

**Responsável:** Worker. **Dependências:** A04.

**Entrega e aceite:** Usar chave única por mídia/versão; verificar todos os erros; confirmar referência durável antes de eventual exclusão; respeitar decisão sobre original.

**Verificação:** Injetar falhas em upload/update/remove; repetir job; arquivos com mesmo nome e extensões diferentes não colidem.

**Escopo provável:** services/midia-worker/src/supabase.ts; teste do adaptador (novo).

### D05 — Separar sanitização de compressão

- [ ] Concluída e verificada.

**Responsável:** Worker. **Dependências:** D03.

**Entrega e aceite:** Não publicar original com metadados sensíveis no fallback mantida; formatos sem sanitização segura ficam privados com motivo.

**Verificação:** Testar EXIF/GPS em sucesso e fallback; preservar transparência/orientação; medir qualidade sem supor que todos os formatos decodificam.

**Escopo provável:** imagem.ts; video.ts; processar.ts; testes de metadados.

### D06 — Tornar os jobs recuperáveis

- [ ] Concluída e verificada.

**Responsável:** Worker + backend. **Dependências:** D03, D04.

**Entrega e aceite:** Registrar trabalho durável antes do aceite; idempotência e tentativas limitadas; timeout e status de falha; reprocessamento administrável.

**Verificação:** Reiniciar após 202 e retomar; duas execuções não duplicam saída; job travado libera recursos e registra erro.

**Escopo provável:** migração de jobs; fila.ts; servidor.ts; teste de recuperação.

### D07 — Conectar seleção a upload persistente

- [ ] Concluída e verificada.

**Responsável:** Agricultor. **Dependências:** D03, D04, D05, D06.

**Entrega e aceite:** Enviar arquivo real, mostrar progresso/status e recuperar após reiniciar; nova tentativa não cria mídia duplicada; usar lote/propriedade reais.

**Verificação:** Selecionar câmera/galeria em aparelho; interromper rede; reabrir e visualizar o mesmo item no backend.

**Escopo provável:** selecionarMidia.ts; hook de upload; FotosVideosScreen; MiniaturaEvidencia; teste de integração.

### D08 — Validar e exibir mídia autorizada

- [ ] Concluída e verificada.

**Responsável:** Admin + Cliente, entregas separadas. **Dependências:** D07, B03, B05.

**Entrega e aceite:** Administrador valida/rejeita; comprador vê mídia permitida com status correto e reprodução compatível com dispositivos do piloto.

**Verificação:** Pendência aparece como Não verificado; rejeitada/privada não vaza; links expiram; testar vídeo real e falha de reprodução.

**Escopo provável:** função de validação; tela admin; detalhe do Cliente; contrato/teste.

### E00 — Registrar checklist de qualidade do lote

- [ ] Concluída e verificada.

**Responsável:** Operação + backend. **Dependências:** A01, D02, D08.

**Entrega e aceite:** Registrar checklist, evidências e resultado da inspeção por usuário autorizado no app administrativo; distinguir declaração do produtor de verificação operacional; exigir inspeção apenas nos casos definidos pelo piloto.

**Verificação:** Inspeção reaparece no lote com autor/data; usuário não autorizado não valida; estado de qualidade e pendências são consistentes no Cliente.

**Escopo provável:** contrato/checklist; função de inspeção; tela de inspeção; teste.

### E01 — Publicar lote real

- [ ] Concluída e verificada.

**Responsável:** Agricultor + backend. **Dependências:** C04, D02, D07, D08, E00.

**Entrega e aceite:** Publicação valida aprovação, campos e evidências requeridas; retorna ID real e estado correto; erro não apaga rascunho.

**Verificação:** Publicar/reabrir; impedir publicação não autorizada; repetir requisição sem duplicar oferta.

**Escopo provável:** função de publicação; regras do lote; RevisarOfertaScreen; teste.

### E02 — Mostrar ofertas reais ao comprador

- [ ] Concluída e verificada.

**Responsável:** Cliente. **Dependências:** E01, C02.

**Entrega e aceite:** Lista preenchida, busca/filtro básicos e paginação; detalhe mostra unidade, disponibilidade, qualidade, produtor e mídia permitida.

**Verificação:** Oferta recém-publicada aparece; retirada desaparece; estados vazio/carregando/erro funcionam; não expor documentos privados.

**Escopo provável:** hook de catálogo; OfertasScreen; detalhe de oferta; filtro; teste.

### Checkpoint da etapa 2

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 3 — Negociação e pedido

### F01 — Solicitar cotação real

- [ ] Concluída e verificada.

**Responsável:** Cliente + backend. **Dependências:** E02.

**Entrega e aceite:** Comprador aprovado envia quantidade/condições; cotação vinculada ao lote e visível ao produtor certo.

**Verificação:** Criar e reencontrar pelos dois perfis; negar terceiro; nova tentativa não duplica solicitação.

**Escopo provável:** migração/contrato de cotação; função; tela cotação; teste.

### F02 — Registrar contraproposta versionada

- [ ] Concluída e verificada.

**Responsável:** Agricultor + Cliente. **Dependências:** F01.

**Entrega e aceite:** Persistir histórico, preço, quantidade, validade e frete; usuário sabe qual versão está aceitando.

**Verificação:** Aceite de versão vencida/alterada é rejeitado; duas sessões veem histórico consistente.

**Escopo provável:** função de proposta; telas de negociação; teste.

### F03 — Confirmar pedido com reserva atômica

- [ ] Concluída e verificada.

**Responsável:** Backend + Cliente. **Dependências:** F02; regras comerciais A01.

**Entrega e aceite:** Congelar termos aceitos; reservar quantidade no banco; cancelamento/expiração liberam corretamente; idempotência por comando.

**Verificação:** Dois compradores disputam o último saldo sem sobrevenda; duplo clique gera um pedido; erro não mostra confirmação falsa.

**Escopo provável:** função transacional; contrato pedido; tela confirmar; teste de concorrência.

### F04 — Persistir mensagens da negociação e pedido

- [ ] Concluída e verificada.

**Responsável:** Backend + apps participantes. **Dependências:** F01, F03.

**Entrega e aceite:** Mensagens vinculadas à negociação/pedido com autor, data e destinatários autorizados; envio deixa de ser local/no-op; histórico reaparece ao abrir outro dispositivo.

**Verificação:** Dois perfis trocam mensagem; terceiro não lê; nova tentativa não duplica envio; falha fica visível.

**Escopo provável:** tabela/políticas de mensagens; função/hook; uma integração de tela por entrega; teste.

### Checkpoint da etapa 3

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 4 — Pagamento e logística

### G01 — Integrar pagamento do pedido em sandbox

- [ ] Concluída e verificada.

**Responsável:** Backend financeiro. **Dependências:** F03; PSP e condição de pagamento definidos.

**Entrega e aceite:** Usar um método de pagamento; validar callback; associar valores ao pedido; distinguir pagamento, assinatura e repasse.

**Verificação:** Simular sucesso/falha/expiração, evento duplicado e fora de ordem; client não consegue marcar pagamento como aprovado.

**Escopo provável:** função PSP; webhook; estados financeiros; teste.

### G02 — Apresentar status financeiro verdadeiro

- [ ] Concluída e verificada.

**Responsável:** Cliente + Agricultor. **Dependências:** G01.

**Entrega e aceite:** Exibir cobrança, vencimento e confirmação do servidor; aguardar condição comercial correta antes de liberar execução.

**Verificação:** Reabrir em dois perfis; pagamento pendente não aparece como pago; falha oferece recuperação sem nova cobrança indevida.

**Escopo provável:** hooks financeiros; resumo do pedido; detalhe produtor; teste.

### G03 — Cadastrar veículo e motorista

- [ ] Concluída e verificada.

**Responsável:** Logística + backend. **Dependências:** C03, C04.

**Entrega e aceite:** Substituir botões sem ação por cadastro válido; vincular veículo/motorista à transportadora e documentos necessários.

**Verificação:** Persistir/reabrir; negar vínculo alheio ou inválido; operação identifica responsável pela viagem.

**Escopo provável:** migração de vínculos; tela veículos; tela motoristas; teste.

### G04 — Gerar ordem logística do pedido

- [ ] Concluída e verificada.

**Responsável:** Operação + backend. **Dependências:** F03, G02, G03.

**Entrega e aceite:** Pedido elegível gera uma ordem; registrar responsável, janela de coleta/entrega e frete acordado; status compartilhado.

**Verificação:** Reexecutar sem duplicar carga; transportador designado vê e terceiro não; impedir início fora da condição acordada.

**Escopo provável:** função ordem logística; tela atribuição; tela cargas; teste.

### G05 — Registrar coleta com evidências

- [ ] Concluída e verificada.

**Responsável:** Agricultor + Logística. **Dependências:** G04, D07.

**Entrega e aceite:** Registrar autor, hora, quantidade/peso, evidência e divergência; transição de estado validada no servidor.

**Verificação:** Ambos veem coleta; divergência aciona regra definida; envio repetido não duplica evento.

**Escopo provável:** comando de coleta; telas preparar/conferir; teste.

### G06 — Registrar transporte e recebimento

- [ ] Concluída e verificada.

**Responsável:** Logística + Cliente, entregas separadas. **Dependências:** G05.

**Entrega e aceite:** Atualizar eventos reais; registrar prova de entrega e aceite/rejeição parcial conforme regras; timeline consultável.

**Verificação:** Motorista entrega e comprador confere; impedir transições fora de ordem; eventos preservam autor/hora.

**Escopo provável:** comandos de viagem/recebimento; telas dos eventos; teste.

### Checkpoint da etapa 4

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 5 — Fechamento da operação

### H01 — Resolver divergência com auditoria

- [ ] Concluída e verificada.

**Responsável:** Operação + backend. **Dependências:** G06.

**Entrega e aceite:** Abrir disputa com evidências, responsável e SLA; registrar decisão; bloquear parcela de repasse conforme regra.

**Verificação:** Simular falta/dano; fornecedor e comprador acompanham; evidência não expira durante retenção acordada.

**Escopo provável:** função disputa; telas ocorrência/disputa; teste.

### H02 — Conciliar e executar repasse

- [ ] Concluída e verificada.

**Responsável:** Financeiro + backend. **Dependências:** G01, H01.

**Entrega e aceite:** Conciliar cobrança, comissão, frete, ajustes e beneficiários; repasse autorizado e idempotente; tratar estorno/reembolso.

**Verificação:** Casos pago/entregue, disputa, cancelamento, falha de repasse e evento duplicado; saldo do pedido fecha sem divergência.

**Escopo provável:** função conciliação/repasse; telas financeiras; teste.

### H03 — Avaliar uma entrega concluída

- [ ] Concluída e verificada.

**Responsável:** Cliente + backend. **Dependências:** G06.

**Entrega e aceite:** Participante elegível avalia pedido entregue; avaliação persistida e agregação básica no perfil; aplicar regra de visibilidade/moderação definida para o piloto.

**Verificação:** Não permitir avaliação de pedido alheio ou inexistente; repetição não duplica nota; perfil reflete resultado correto.

**Escopo provável:** tabela/política; função de avaliação; tela avaliar; perfil público; teste.

### H04 — Executar retenção com proteção de evidências

- [ ] Concluída e verificada.

**Responsável:** Backend + operação. **Dependências:** A01, D04, D06, H01.

**Entrega e aceite:** Formalizar encerramento/reabertura e disputa; aplicar 30 dias onde acordado; excluir Storage/banco com auditoria e recuperação de falhas.

**Verificação:** Testar virada de data, job duplicado, disputa aberta, reabertura e falha parcial; nenhuma exclusão por suposição.

**Escopo provável:** função de retenção; agendamento; contrato de expiração; teste.

### Checkpoint da etapa 5

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 6 — Homologação e piloto

### I01 — Suportar interrupção de rede

- [ ] Concluída e verificada.

**Responsável:** Apps do piloto, uma entrega por perfil. **Dependências:** D07, G05, G06.

**Entrega e aceite:** Rascunhos/evidências sobrevivem reinício; retomada não duplica operações; confirmações sensíveis dependem do servidor.

**Verificação:** Modo avião durante cadastro, upload e coleta; reconectar e comparar estado entre dispositivos; conflito não é descartado em silêncio.

**Escopo provável:** persistência/fila local; indicador de sync; teste por app.

### I02 — Entregar avisos e histórico operacional

- [ ] Concluída e verificada.

**Responsável:** Operação + apps. **Dependências:** F03, G04, H01.

**Entrega e aceite:** Avisar cotação, pedido, coleta e disputa pelo canal definido; registrar entrega/falha; suporte encontra contexto do pedido.

**Verificação:** Simular falha do canal e nova tentativa; destinatário correto; nenhum evento crítico depende de alguém olhar tela vazia.

**Escopo provável:** outbox/eventos; integração do canal; telas notificações/histórico; teste.

### I03 — Homologar acessos e jornada completa

- [ ] Concluída e verificada.

**Responsável:** Qualidade + operação. **Dependências:** H02, H03, H04, F04, I01, I02.

**Entrega e aceite:** Executar todos os perfis com dados de homologação; cobrir vazamento entre empresas, concorrência, cancelamento, disputa e repetição.

**Verificação:** Evidência de execução em dispositivos do piloto; zero bloqueadores críticos; typecheck/lint/testes/export passam.

**Escopo provável:** testes E2E/integrados; DOC/homologacao-piloto.md.

### I04 — Preparar distribuição e operação

- [ ] Concluída e verificada.

**Responsável:** Engenharia + operação. **Dependências:** I03; decisão de monetização A01.

**Entrega e aceite:** Distribuir builds corretos, substituir assets necessários, validar privacidade/acesso, backup/restauração e alertas; configurar cobrança de assinatura se mantida no piloto.

**Verificação:** Instalar em aparelho limpo; ensaiar restauração e rollback; verificar responsáveis e suporte; testar Docker/worker no ambiente alvo.

**Escopo provável:** config de build/distribuição; monitoramento; runbook; assets.

### I05 — Abrir piloto controlado e medir

- [ ] Concluída e verificada.

**Responsável:** Produto + operação. **Dependências:** I04.

**Entrega e aceite:** Liberar participantes definidos, acompanhar transações e pendências; medir conversão, cancelamentos, pontualidade, disputas e conciliação.

**Verificação:** Reunião de saída com métricas reais e critérios definidos em A01; corrigir bloqueadores antes de ampliar região ou culturas.

**Escopo provável:** DOC/piloto-resultados.md; painel mínimo.

### Checkpoint final

- [ ] Operação real completa demonstrada; todos os critérios de saída de plan.md atendidos.
- [ ] Métricas do piloto avaliadas antes de expansão.

## Dependências externas

Acesso ao Supabase, regras de operação, credenciamento/conta do PSP, canal de notificações, aparelhos, distribuição e infraestrutura do worker precisam de responsáveis. Não marcar tarefas dependentes como concluídas com mocks. Aprovação para instalar bibliotecas ou executar infraestrutura nova deve respeitar as regras do projeto e as autorizações existentes.

