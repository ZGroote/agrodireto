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

- [x] Concluída e verificada. Decisões aprovadas pelo usuário em 11/11/2026 (DOC 040).

**Estado:** recorte inicial registrado em [piloto.md](../DOC/piloto.md). Região e culturas ficam pendentes por decisão do usuário; demais decisões têm responsável proposto e marco de fechamento.

**Responsável:** Produto/operação. **Dependências:** Nenhuma.

**Entrega e aceite:** Registrar região, segmentos liberados por onda (ampliação de 11/11: hortifrúti, grãos, pecuária/origem animal, agroindústria), culturas/produtos iniciais, participantes, unidades, aprovação, responsáveis, SLA e metas; registrar papel comercial, frete, perdas e decisão sobre paywall no piloto.

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

**Estado:** [projeto hospedado de integração](../DOC/ambientes.md) ativo, com resposta HTTP 200 da API de Auth usando a chave pública. URL e chave pública configuradas localmente nos quatro apps. O ambiente local com Supabase CLI e o projeto separado do piloto seguem pendentes.

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

**Progresso:** identidade via Auth e vínculo privado de equipe para o fluxo de propriedade. Isolamento e bloqueio de promoção verificados no banco. Desde 11/11, organizações e membros (titular/membro) existem no banco, e o produtor ganha uma organização no primeiro envio de propriedade. Pendentes: incluir membros, organização do comprador e da transportadora, troca de contexto auditada.

**Responsável:** Backend. **Dependências:** A01, A03.

**Entrega e aceite:** Representar usuário, organização/membro, papel e aprovação; usuário pode pertencer a mais de uma organização com troca de contexto explícita e auditada (ampliação de 11/11); acesso administrativo não pode ser autoatribuído; RLS nega acesso cruzado por padrão.

**Verificação:** Usuário A não lê/altera dados privados de B; usuário comum não se promove; endpoints rejeitam ausência de sessão.

**Escopo provável:** supabase/migrations (nova migração); teste RLS; packages/dominio/identidade.ts (novo).

### B02 — Integrar sessão do Agricultor

- [ ] Concluída e verificada.

**Progresso:** criação de conta e login por e-mail e senha, rotas protegidas, logout e SecureStore no app nativo. Pendentes recuperação de acesso e restauração de sessão em aparelho.

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

**Progresso:** desde 11/11, criar conta, login e rotas protegidas no app Logística (DOC 019). Falta recuperar acesso, ensaio em aparelho e proteger ações por papel.

**Responsável:** App Logística. **Dependências:** B01, B02.

**Entrega e aceite:** Autenticar usuários operacionais e identificar transportadora/vínculo; proteger ações por papel.

**Verificação:** Motorista/transportadora não acessam operação de outro vínculo; sessão expirada bloqueia mutação.

**Escopo provável:** apps/logistica/lib; app layouts; telas de entrada/cadastro.

### B05 — Proteger o acesso administrativo

- [ ] Concluída e verificada.

**Progresso:** login e vínculo de equipe reais. O banco exige MFA por padrão. O segundo fator está desligado em homologação até chegar o primeiro cliente.

**Responsável:** App Administrador. **Dependências:** B01, B02.

**Entrega e aceite:** Acesso por concessão autorizada; papéis administrativos separados (geral, cadastral, comercial, logístico, financeiro, auditor, suporte), cada um só com o necessário (ampliação de 11/11); verificação real de segundo fator conforme regra; seis dígitos arbitrários não liberam acesso.

**Verificação:** Testar usuário sem permissão, segundo fator inválido e revogação de acesso.

**Escopo provável:** apps/administrador/lib; layouts; telas de acesso/verificação.

### C01 — Persistir propriedade do produtor

- [ ] Concluída e verificada.

**Progresso:** o rascunho é separado por conta e pode ser enviado ao Supabase. O resumo e o checklist mostram a situação remota. Após pedido de ajustes, o produtor pode corrigir e reenviar. Desde 11/11, a propriedade tem id próprio, pertence a uma organização e pode haver várias por organização; o lote fica ligado à propriedade. Falta ensaio completo pela interface e a tela para escolher entre várias propriedades.

**Responsável:** Agricultor + backend. **Dependências:** B02.

**Entrega e aceite:** Salvar dados validados e recuperar ao reiniciar; propriedade com id próprio pertencendo a uma organização, várias por organização, por migration nova sem editar as anteriores (ampliação de 11/11); rascunho antes do cadastro migra uma vez.

**Verificação:** Criar, reabrir, editar e simular falha; nenhum ID fixo; segunda migração do rascunho não duplica registro.

**Escopo provável:** migração de propriedade; hook de dados; tela de editar propriedade; testes.

### C02 — Persistir cadastro empresarial do comprador

- [ ] Concluída e verificada.

**Progresso:** desde 11/11 o comprador cria conta, cadastra a empresa (CNPJ validado, inclusive alfanumérico), acompanha a análise e corrige ajustes; a equipe aprova no Administrador e só empresa aprovada vê o catálogo. Verificado no banco de homologação. Falta ensaio pelas telas com contas reais e os termos do comprador.

**Responsável:** Cliente + backend. **Dependências:** B03.

**Entrega e aceite:** Gravar empresa, contatos e endereço necessários ao piloto com estado de aprovação.

**Verificação:** Reabrir conta e conferir dados; validar campos obrigatórios; acesso cruzado negado.

**Escopo provável:** migração de cadastro; hook; tela de cadastro; testes.

### C03 — Persistir cadastro da transportadora

- [ ] Concluída e verificada.

**Progresso:** desde 11/11, cadastro da transportadora (CNPJ, regiões atendidas, tipos de carga) com envio, ajustes e revisão; migração aplicada e testada no Supabase `agro` (DOC 019). Falta a tela de aprovação no Administrador e o ensaio pelas telas.

**Responsável:** Logística + backend. **Dependências:** B04.

**Entrega e aceite:** Salvar transportadora e estado de aprovação, sem vínculos fictícios.

**Verificação:** Reabrir cadastro; editar com permissão; negar atualização por outra empresa.

**Escopo provável:** migração de transportadora; hook; tela de cadastro; testes.

### C04 — Aprovar cadastros na operação

- [ ] Concluída e verificada.

**Progresso:** Administrador lista propriedades pendentes, aprova ou pede ajustes com motivo. O Agricultor consulta o status, corrige e reenvia. Pendentes demais cadastros e regras de publicação e compra.

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

**Progresso:** culturas locais com previsão de colheita por cultura. Estimativa em quilos inteiros, limites opcionais declarados e data no calendário. Catálogo do piloto, histórico com autoria, mídia durável e sincronização seguem pendentes.

**Responsável:** Agricultor + backend. **Dependências:** C01, C04.

**Entrega e aceite:** Persistir cultura, unidade e previsão do catálogo do piloto; nenhuma faixa ±10% assumida sem validação.

**Verificação:** Cadastrar/reabrir; recusar unidade inválida; não perder campos ao anexar foto.

**Escopo provável:** migração de cultura; hook; tela de cultura; testes.

### D02 — Persistir rascunho de lote

- [ ] Concluída e verificada.

**Progresso:** rascunhos separados por conta no dispositivo, com retomada na etapa salva. O rascunho anterior é associado à primeira conta que o abre. Publicação de homologação vinculada à propriedade aprovada. Fotos e vídeos são recuperados no dispositivo.

**Responsável:** Agricultor + backend. **Dependências:** D01.

**Entrega e aceite:** Salvar quantidade, unidade, qualidade e preço com origem rastreável; retomar etapas após reiniciar; distinguir rascunho de publicado.

**Verificação:** Interromper entre etapas e retomar; falha de rede mantém rascunho identificado; impedir valores inválidos.

**Escopo provável:** migração de lote; contrato em dominio; LoteDraftContext; hook; teste.

### D03 — Criar armazenamento privado de mídia

- [ ] Concluída e verificada.

**Progresso:** bucket privado `midias` preparado para o worker. O bucket `evidencias-lote` da homologação vincula originais ao produtor e ao lote, com cotas de reserva. O teste no Supabase confirmou isolamento e limite por lote. Falta integrar o worker e finalizar a política de retenção.

**Responsável:** Backend. **Dependências:** B01, D02.

**Entrega e aceite:** Vincular mídia ao dono e lote/propriedade reais; impor visibilidade e quotas no servidor; definir tamanho/duração aceitáveis.

**Verificação:** Negar leitura/upload de terceiro; quota concorrente não ultrapassa limite; arquivo rejeitado não aparece ao comprador.

**Escopo provável:** migração de midias; políticas Storage; função de autorização; teste.

### D04 — Corrigir gravação do worker

- [ ] Concluída e verificada.

**Progresso:** adaptador assume o trabalho com atualização condicional e grava o resultado em um caminho exclusivo. Remoção é opcional e vem após a confirmação da referência. Testes HTTP locais cobrem reentrega, falha de gravação e falha de remoção. Falta homologar no Supabase.

**Responsável:** Worker. **Dependências:** A04.

**Entrega e aceite:** Usar chave única por mídia/versão; verificar todos os erros; confirmar referência durável antes de eventual exclusão; respeitar decisão sobre original.

**Verificação:** Injetar falhas em upload/update/remove; repetir job; arquivos com mesmo nome e extensões diferentes não colidem.

**Escopo provável:** services/midia-worker/src/supabase.ts; teste do adaptador (novo).

### D05 — Separar sanitização de compressão

- [ ] Concluída e verificada.

**Progresso:** o worker atualizado gera uma cópia sem metadados de fotos estáticas e envia ao bucket privado do catálogo. O teste do worker cobre EXIF, preservação dos pixels e falha no upload. Falta o fluxo de vídeos.

**Responsável:** Worker. **Dependências:** D03.

**Entrega e aceite:** Não publicar original com metadados sensíveis no fallback mantida; formatos sem sanitização segura ficam privados com motivo.

**Verificação:** Testar EXIF/GPS em sucesso e fallback; preservar transparência/orientação; medir qualidade sem supor que todos os formatos decodificam.

**Escopo provável:** imagem.ts; video.ts; processar.ts; testes de metadados.

### D06 — Tornar os jobs recuperáveis

- [ ] Concluída e verificada.

**Progresso:** desde 11/11, fila de mídias no banco com retomada, cerca de tentativa e limite de 3 tentativas; worker com 43 testes e migração aplicada e testada no Supabase `agro` (DOC 018). Falta o worker rodar contra o hospedado e o reprocessamento pela equipe.

**Responsável:** Worker + backend. **Dependências:** D03, D04.

**Entrega e aceite:** Registrar trabalho durável antes do aceite; idempotência e tentativas limitadas; timeout e status de falha; reprocessamento administrável.

**Verificação:** Reiniciar após 202 e retomar; duas execuções não duplicam saída; job travado libera recursos e registra erro.

**Escopo provável:** migração de jobs; fila.ts; servidor.ts; teste de recuperação.

### D07 — Conectar seleção a upload persistente

- [ ] Concluída e verificada.

**Progresso:** anexos copiados ao salvar o rascunho e enviados pelo detalhe do lote publicado. O produtor pode recuperar os arquivos confirmados por link temporário. Falta testar a transferência real pelo app e tratar vídeos acima de 6 MiB.

**Responsável:** Agricultor. **Dependências:** D03, D04, D05, D06.

**Entrega e aceite:** Enviar arquivo real, mostrar progresso/status e recuperar após reiniciar; nova tentativa não cria mídia duplicada; usar lote/propriedade reais.

**Verificação:** Selecionar câmera/galeria em aparelho; interromper rede; reabrir e visualizar o mesmo item no backend.

**Escopo provável:** selecionarMidia.ts; hook de upload; FotosVideosScreen; MiniaturaEvidencia; teste de integração.

### D08 — Validar e exibir mídia autorizada

- [ ] Concluída e verificada.

**Progresso:** produtor autoriza a foto aprovada, operação prepara a cópia e Cliente exibe a galeria. Permissões, consentimento e revogação foram verificados no Supabase de homologação. Falta validar a jornada com sessões reais pelas telas e completar o fluxo de vídeos.

**Responsável:** Admin + Cliente, entregas separadas. **Dependências:** D07, B03, B05.

**Entrega e aceite:** Administrador valida/rejeita; comprador vê mídia permitida com status correto e reprodução compatível com dispositivos do piloto.

**Verificação:** Pendência aparece como Não verificado; rejeitada/privada não vaza; links expiram; testar vídeo real e falha de reprodução.

**Escopo provável:** função de validação; tela admin; detalhe do Cliente; contrato/teste.

### E00 — Registrar checklist de qualidade do lote

- [ ] Concluída e verificada.

**Progresso:** checklist e resultado persistidos com autor, data e referências das evidências aprovadas. O Administrador pode concluir a inspeção, e Agricultor e Cliente consultam o resumo. Regras de acesso verificadas em homologação. Faltam a verificação com sessões pelas telas e a definição dos casos de inspeção obrigatória no piloto.

**Responsável:** Operação + backend. **Dependências:** A01, D02, D08.

**Entrega e aceite:** Registrar checklist, evidências e resultado da inspeção por usuário autorizado no app administrativo; distinguir declaração do produtor de verificação operacional; exigir inspeção apenas nos casos definidos pelo piloto.

**Verificação:** Inspeção reaparece no lote com autor/data; usuário não autorizado não valida; estado de qualidade e pendências são consistentes no Cliente.

**Escopo provável:** contrato/checklist; função de inspeção; tela de inspeção; teste.

### E01 — Publicar lote real

- [ ] Concluída e verificada.

**Progresso:** publicação de homologação exige propriedade aprovada, valida os dados comerciais e é idempotente por rascunho e produtor. O produtor pode consultar e retirar a oferta. Falta integrar evidências e inspeção para o piloto.

**Responsável:** Agricultor + backend. **Dependências:** C04, D02, D07, D08, E00.

**Entrega e aceite:** Publicação valida aprovação, campos e evidências requeridas; retorna ID real e estado correto; erro não apaga rascunho.

**Verificação:** Publicar/reabrir; impedir publicação não autorizada; repetir requisição sem duplicar oferta.

**Escopo provável:** função de publicação; regras do lote; RevisarOfertaScreen; teste.

### E02 — Mostrar ofertas reais ao comprador

- [ ] Concluída e verificada.

**Progresso:** catálogo de homologação com busca por produto, paginação e detalhe. Somente compradores autorizados consultam ofertas vigentes. Falta aprovar compradores pelo fluxo empresarial e validar as telas com contas de teste.

**Responsável:** Cliente. **Dependências:** E01, C02.

**Entrega e aceite:** Lista preenchida, busca/filtro básicos e paginação; detalhe mostra unidade, disponibilidade, qualidade, produtor e mídia permitida.

**Verificação:** Oferta recém-publicada aparece; retirada desaparece; estados vazio/carregando/erro funcionam; não expor documentos privados.

**Escopo provável:** hook de catálogo; OfertasScreen; detalhe de oferta; filtro; teste.

### D09 — Configurar catálogo por segmento

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Agricultor. **Dependências:** B01, C01, decisão de atributos por segmento.

**Entrega e aceite:** Segmentos (hortifrúti, grãos, pecuária/origem animal, agroindústria) com categorias, atributos, unidades e regras de validação em configuração; o cadastro de cultura e de lote mostra só os campos do segmento; incluir um segmento novo não exige mudar o núcleo.

**Verificação:** Criar produto de cada segmento; campo de outro segmento não aparece nem é aceito no servidor; unidade incompatível é rejeitada.

**Escopo provável:** migração de segmentos/atributos; packages/dominio/segmentos.ts (novo); formulário de cultura e lote; teste.

### D10 — Exigir documentos por segmento

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Administrador. **Dependências:** D09, decisão sobre documentos sanitários.

**Entrega e aceite:** Documentos obrigatórios por segmento com validade; oferta sem documento válido não é publicada; alerta de vencimento para produtor e operação.

**Verificação:** Publicação bloqueada sem documento; documento vencido retira a oferta do catálogo; arquivo segue privado.

**Escopo provável:** migração de documentos; Storage privado; tela de documentos; teste.

### D11 — Separar estados da disponibilidade

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Agricultor. **Dependências:** D01, D09.

**Entrega e aceite:** Quantidade estimada, confirmada, reservada, disponível, comprometida e indisponível; previsão de safra existente vira estimado e nunca conta como estoque.

**Verificação:** Estimado não aparece como disponível ao comprador; reserva reduz disponível; transições fora de ordem são rejeitadas.

**Escopo provável:** migração/função de disponibilidade; packages/dominio; tela de previsão e lote; teste.

### E03 — Publicar demandas do comprador

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Cliente + backend. **Dependências:** C02, D09.

**Entrega e aceite:** Comprador publica demanda estruturada: produto, especificação, quantidade, unidade, qualidade, região, entrega, prazo, frequência, pagamento e documentos exigidos; pode editar e encerrar.

**Verificação:** Demanda persiste e reaparece; outra empresa não edita; campos seguem o segmento do produto.

**Escopo provável:** migração de demandas; telas do Cliente; hook; teste.

### E04 — Cruzar demandas e ofertas com explicação

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Agricultor + Cliente. **Dependências:** E01, E03, D11.

**Entrega e aceite:** Sugestões de ofertas para uma demanda e de demandas para um produtor, por produto, qualidade, quantidade, local, prazo, preço e documentos; cada sugestão mostra os critérios que bateram.

**Verificação:** Oferta incompatível não aparece; sugestão traz o motivo; estimativa nunca aparece como disponível.

**Escopo provável:** função de matching no banco; listas nos dois apps; teste com casos-limite.

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

### F05 — Configurar compras recorrentes

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Cliente + backend. **Dependências:** E03, F03.

**Entrega e aceite:** Comprador agenda demanda semanal ou mensal; o sistema gera a próxima demanda e avisa quando a compra precisa ser organizada; pausar e encerrar.

**Verificação:** Virada de período gera uma única demanda; pausa interrompe; histórico liga cada demanda à recorrência.

**Escopo provável:** migração de recorrência; agendamento; tela do Cliente; teste.

### Checkpoint da etapa 3

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 4 — Pagamento e logística

### G01 — Integrar pagamento do pedido em sandbox

- [ ] Concluída e verificada.

**Responsável:** Backend financeiro. **Dependências:** F03; PSP e condição de pagamento definidos.

**Entrega e aceite:** AgroDireto Pay: PSP habilitado para marketplace com split, sem custódia própria (ampliação de 11/11); usar um método de pagamento; validar callback; associar valores ao pedido; distinguir pagamento, assinatura e repasse.

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

### G07 — Mostrar comissão e tarifas antes de confirmar

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend financeiro + Cliente + Agricultor. **Dependências:** G01, decisão de comissão por segmento.

**Entrega e aceite:** Comissão configurável por segmento, tipo de operação ou contrato; antes de confirmar, comprador e produtor veem valor bruto, comissão, frete, tarifas do provedor e valor líquido estimado.

**Verificação:** Valores batem com o split enviado ao PSP; mudança de configuração não altera pedido já confirmado.

**Escopo provável:** configuração de comissão; função de cálculo; telas de revisão; teste.

### G08 — Aplicar requisitos logísticos por segmento

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Logística + backend. **Dependências:** G03, G04, D09.

**Entrega e aceite:** Veículo e carga compatíveis com o segmento (refrigeração, transporte de animais, granel); ordem logística não é atribuída a veículo incompatível.

**Verificação:** Tentar atribuir carga incompatível é rejeitado no servidor; requisitos aparecem para o transportador.

**Escopo provável:** migração de tipos de veículo/carga; regra de atribuição; teste.

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

### H05 — Publicar QR de rastreabilidade

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Agricultor. **Dependências:** G06, decisão sobre dados públicos.

**Entrega e aceite:** Cada lote entregue gera um QR com página pública só com dados autorizados: produto, origem, data de colheita/produção, lote e qualidade; produtor escolhe se mostra o nome.

**Verificação:** Página não expõe documento, valor, contato nem dado pessoal; QR de lote inexistente ou revogado não mostra nada.

**Escopo provável:** visão pública restrita; página web; geração do QR; teste de exposição.

### Checkpoint da etapa 5

- [ ] Critério do marco correspondente em plan.md demonstrado com dados persistidos e perfis autorizados.
- [ ] Verificações relevantes aprovadas; limites de homologação registrados; próxima fase revisada.

## Etapa 5A — Inteligência e institucional

### J01 — Mostrar inteligência de mercado

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Cliente + Agricultor. **Dependências:** H02, decisão de fontes de preço.

**Entrega e aceite:** Preços por produto e região separando negociado, anunciado, referência externa e estimativa; cada número mostra fonte, data, região, unidade e método.

**Verificação:** Sem dados suficientes mostra estado vazio; estimativa nunca aparece como preço praticado.

**Escopo provável:** visões agregadas; importação de referência; telas; teste.

### J02 — Medir indicadores de ODS

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Backend + Administrador. **Dependências:** H02, decisão de metodologia.

**Entrega e aceite:** Indicadores com fórmula, fonte, período e unidade: produtores e compradores ativos, volume e valor liquidado, participação de pequenos produtores, perdas e entregas.

**Verificação:** Indicadores batem com consulta direta aos eventos; nenhum afirma redução sem dado comparável.

**Escopo provável:** visões de indicadores; painel do Administrador; teste.

### J03 — Organizar compras institucionais

- [ ] Concluída e verificada.

**Origem:** ampliação do piloto em 11/11/2026 ([plan.md §12](plan.md#12-ampliação-do-piloto-11112026)).

**Responsável:** Cliente + Administrador + backend. **Dependências:** C02, E03, D10, decisão de programas.

**Entrega e aceite:** Instituições (escolas, hospitais, PAA/PNAE) cadastram chamadas com requisitos de habilitação; a plataforma mostra produtores com documentos compatíveis, sem declarar elegibilidade; entrega e recebimento ficam registrados.

**Verificação:** Produtor sem documento exigido não aparece como apto; a decisão de habilitação fica com quem valida, registrada em auditoria.

**Escopo provável:** migração de instituições/chamadas; telas; teste.

### Checkpoint da etapa 5A

- [ ] Indicadores e mercado demonstrados com eventos reais do piloto.
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

