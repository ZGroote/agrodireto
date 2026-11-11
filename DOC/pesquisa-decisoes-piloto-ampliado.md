# Pesquisa: decisões de negócio e regulatórias do piloto ampliado

Data: 11/11/2026. Contexto: [plan.md §12.4](../tasks/plan.md) e tarefa A01 de [todo.md](../tasks/todo.md).

Este documento levanta fatos e opções. **Não decide nada pelo usuário e não é parecer jurídico, contábil ou sanitário.** Nenhuma regra daqui deve ir para o código sem revisão de um profissional (ver seção 7). Nenhum código foi escrito.

## 0. Como ler

Cada fato tem um selo de confiança:

- **[Lido]**: li a página oficial inteira (ou a parte citada) nesta pesquisa.
- **[Busca]**: só vi em resumo de busca ou em material de segundo nível (manual estadual, prefeitura, blog do próprio PSP). Conferir antes de usar.
- **[Não verificado]**: a página bloqueou o acesso (erro 403, certificado, tempo esgotado) ou não achei a informação.

Preços e tarifas mudam. Todas as tarifas abaixo precisam de proposta comercial por escrito.

### Resumo das recomendações

| # | Decisão | Recomendação curta | Quem precisa validar |
|---|---|---|---|
| 1 | Documentos por segmento | Cadastrar documentos como **configuração** (nome, quando exige, validade, quem confere). Liberar hortifrúti e grãos primeiro. Em pecuária, começar só por produto com inspeção oficial; animal vivo depois. | Veterinário/sanitário; contador |
| 2 | PSP com split | Pedir proposta a **Asaas** e **Pagar.me**; usar Mercado Pago só como comparação. Antes de escolher, resolver com advogado se o modelo "sem custódia" fica fora das regras do Banco Central. | Advogado (pagamentos); contador |
| 3 | Preço de referência | Começar pela **CONAB** (documentada, com licença declarada). CEAGESP e Cepea só com autorização por escrito. Sempre mostrar fonte, data, unidade e nível (atacado ou produtor). | Advogado (licença de dados) |
| 4 | PAA/PNAE | A plataforma **organiza** documentos, validade e limites. Quem habilita é a entidade compradora (prefeitura, estado, Conab). Nunca exibir "elegível". | Advogado (compras públicas) |
| 5 | Pequeno produtor / ODS | Usar **agricultor familiar com CAF ativo** (Lei 11.326) como critério. Não chamar de "pequeno produtor FAO". Não calcular os indicadores 2.3.1 e 2.3.2 oficiais. | Estatístico ou assessor ODS |

---

## 1. Documentos obrigatórios por segmento

Princípio para o produto: o catálogo guarda uma **lista configurável de documentos** por segmento/produto. Cada item tem: nome, quando é exigido, validade, quem confere (admin, instituição, órgão) e status (enviado, conferido, vencido). A plataforma **não afirma** que o vendedor está regular; mostra "documento anexado e conferido por X em tal data".

### 1.1 Hortifrúti

O que as fontes dizem:

- **Rastreabilidade** (Instrução Normativa Conjunta Anvisa/MAPA nº 02/2018): vale para frutas, hortaliças, raízes, bulbos e tubérculos, nacionais e importados. O produtor primário registra insumos e tratamentos fitossanitários (data de aplicação e receituário agronômico ou recomendação técnica). A embalagem deve permitir identificar o produto e seus registros (etiqueta, código de barras ou QR Code). O rótulo traz nome do produtor, endereço ou coordenada, variedade, quantidade e lote. Os registros são guardados por 18 meses após a validade ou expedição. **[Busca]**, resumo do texto da norma. A INC nº 01/2019 mudou os prazos de implantação por cadeia; **não li os prazos**. **[Não verificado]**
- **Divergência de prazo:** a CEAGESP cita 2 anos para notas fiscais; o texto da norma diz 18 meses para registros. Não são a mesma coisa, mas confirmar com contador. **[Busca]**
- **Classificação:** a Lei 9.972/2000 e o Decreto 6.268/2007 tornam a classificação obrigatória só para produto com **padrão oficial do MAPA**. O FNDE diz que vegetal in natura não tem registro específico e deve seguir os padrões de classificação. **[Lido]** (FNDE) / **[Busca]** (Lei e Decreto)
- **Nota fiscal do produtor:** a regra **varia por estado** e mudou em janeiro de 2026. Fontes estaduais indicam que SP e PR passaram a exigir nota eletrônica (em operação interestadual, NF-e). PR pede inscrição estadual ativa, credenciamento e certificado digital. Há aplicativo "Nota Fiscal Fácil" em alguns estados (SP, BA, RS, ES). **[Busca]**

Documentos candidatos para a configuração: identificação do produtor (CPF ou CNPJ), inscrição estadual quando exigida, caderno de campo/registros de tratamento (INC 02/2018), padrão de classificação do produto, nota fiscal da venda.

**Opções**
- A) Exigir os registros de rastreabilidade na publicação do lote. Mais seguro, mais atrito para o produtor.
- B) Exigir só na venda/pedido. Menos atrito; risco de lote anunciado sem lastro.
- C) Só pedir no piloto de quem vende para compra institucional.

**Recomendação:** B, com campo obrigatório de **lote e origem** já na publicação (alimenta o QR). Registros de tratamento exigidos no aceite do pedido. Decidir com operação depois de ouvir 2 ou 3 produtores reais do piloto.

**Precisa de profissional:** contador (nota fiscal e tributação por estado); engenheiro agrônomo ou responsável técnico (rastreabilidade e receituário).

### 1.2 Grãos e commodities

- **Classificação obrigatória** (Lei 9.972/2000): obrigatória para alimento destinado diretamente ao consumo humano, compras e vendas do Poder Público e importações, quando o produto tem padrão oficial. Soja e milho têm padrões oficiais (a fonte cita IN MAPA 11/2007 para soja e IN MAPA 60/2011 para milho; **conferir os números**). **[Busca]**
- **Quem classifica:** entidade credenciada (pessoa jurídica) e classificador (pessoa física) inscritos no Cadastro Geral de Classificação (CGC/MAPA), regido pela IN MAPA 9/2019 alterada pela Portaria SDA 487/2021. **[Busca]**
- **Compra pública:** a Lei diz que a classificação cabe ao Poder Público, que pode repassá-la a agentes credenciados. Programas como o PNAE pedem certificado de classificação do fornecedor. **[Busca]**
- **Não pesquisado nesta rodada:** contrato de compra e venda de commodity, armazenagem, CPR, Funrural, ICMS de grãos e frete. **[Não verificado]**

Documentos candidatos: laudo/certificado de classificação (com entidade credenciada e data), nota fiscal, identificação do produtor e da propriedade, contrato ou condição de entrega.

**Opções**
- A) Exigir certificado de classificação em todo lote de grão.
- B) Exigir só quando o comprador pedir ou na compra institucional; o lote traz classificação **declarada** pelo vendedor, marcada como "declarada".
- C) A plataforma intermedia classificação por entidade parceira. Fora do escopo do piloto.

**Recomendação:** B. Diferenciar visualmente "declarada pelo vendedor" de "certificada por entidade credenciada". É decisão de produto simples e evita prometer qualidade que ninguém atestou. Unidade e padrão de qualidade (tipo, umidade, impurezas) devem seguir a norma de cada grão, vinda da configuração e não de texto livre.

**Precisa de profissional:** classificador credenciado ou engenheiro agrônomo (padrões); contador/advogado agrário (contrato, tributos, CPR).

### 1.3 Pecuária e origem animal

Há dois assuntos separados: **animal vivo** (defesa sanitária animal) e **produto de origem animal** (inspeção). O plano já recomenda deixar este segmento para a segunda onda; esta pesquisa concorda.

**Animal vivo**

- **GTA (Guia de Trânsito Animal):** documento oficial para trânsito de quase todas as espécies (cães e gatos são isentos). Instituída pela IN MAPA 18/2006 segundo manuais estaduais. Três vias: a primeira acompanha os animais, a segunda vai ao serviço de destino, a terceira fica com o emissor. **[Busca]**
- **Quem emite:** o órgão estadual de defesa agropecuária (geralmente pelo e-GTA) ou médico veterinário habilitado pelo MAPA. O produtor precisa ter a propriedade cadastrada no órgão estadual antes. Em alguns estados o próprio produtor emite online. **[Busca]**
- **Exigências variam por espécie, finalidade e UF.** Exemplos: vacinação de bezerras contra brucelose na origem; teste de tuberculose para reprodução em trânsito interestadual (validade de até 60 dias); exame de brucelose ovina para machos acima de 6 meses; aves de descarte só para abatedouro sob inspeção, com confirmação do abatedouro. **[Busca]** (manuais estaduais e do MAPA, alguns com mais de 2 anos)
- **Transporte e bem-estar** (IN MAPA 56/2008, via manuais): veículo adequado ao peso e ao movimento dos animais, telefone de emergência visível na traseira, lotação conforme recomendação do MAPA, transportador cadastrado no órgão estadual, motorista treinado, viagem contínua de no máximo 12 horas com parada em ponto registrado (bovinos). **[Busca]**
- **Abate:** a primeira via da GTA em papel deixou de ser aceita em abate sob inspeção federal e em trânsito interestadual (desde abril de 2015, segundo um manual estadual). **[Busca]**

**Produto de origem animal (carne, leite, ovos, mel, derivados)**

- **Inspeção obrigatória** (Lei 1.283/1950, Decreto 9.013/2017 "RIISPOA", alterado pelo Decreto 10.468/2020): **SIF** (federal) permite comércio interestadual e exportação. Serviços estaduais (SIE) e municipais (SIM) só permitem comércio interestadual se o serviço tiver **equivalência no SISBI-POA** e o estabelecimento estiver no cadastro do sistema. Estabelecimento sob SIF não pode receber produto de SIE/SIM. **[Busca]** (resumo do FAQ do MAPA e do texto do Decreto; conferir no Planalto)
- **Selo ARTE** (Lei 13.680/2018, Decreto 11.099/2022): permite venda interestadual de produto artesanal de origem animal sob inspeção de serviço oficial. Segundo o FAQ do MAPA, o produto registrado só no SIM, sem equivalência SISBI, **pode** receber o selo, mas a autoridade que concede e as exigências estaduais variam. **[Busca]**
- **O PNAE** exige inspeção oficial (SIM, SIE, SIF ou SUASA) para carne, leite, ovos, mel e derivados. **[Lido]** (FNDE)
- **Abrangência exata do SIM e do SIE** (município ou estado) e as regras de transporte refrigerado: **[Não verificado]**.

Documentos candidatos: GTA (animal vivo), registro do estabelecimento no SIF/SIE/SIM com número, equivalência SISBI quando for vender fora da abrangência do serviço, número do Selo ARTE quando houver, atestados sanitários exigidos pela espécie.

**Opções**
- A) Liberar só **produto de origem animal com registro de inspeção**; animal vivo fica fora do piloto.
- B) Liberar também animal vivo, com GTA e atestados anexados e conferidos por veterinário.
- C) Liberar nada em pecuária no piloto.

**Recomendação:** A no piloto. Animal vivo tem regra por espécie e por estado, exige conferência humana de um veterinário e responsabiliza a plataforma na prática; entrar só depois de ter um parceiro sanitário. A plataforma deve **bloquear** a publicação de produto de origem animal sem número de inspeção e mostrar o âmbito (SIM, SIE, SIF) ao comprador. Quem confere o número: admin com base em consulta ao órgão, não autodeclaração.

**Precisa de profissional:** **médico veterinário** (GTA, sanidade, transporte, inspeção); advogado sanitário (responsabilidade por intermediar produto de origem animal e a regra de âmbito territorial).

### 1.4 Agroindústria

- **Rotulagem de alimento embalado:** RDC Anvisa 727/2022. Agricultor familiar, MEI, agroindústria de pequeno porte e artesanal tinham até 09/10/2024 para adequar a rotulagem nutricional; **o prazo já venceu**. Rotulagem nutricional é voluntária em embalagem com superfície visível de até 100 cm². Alergênicos exigem advertência. Lote deve constar. **[Busca]**
- **Licença sanitária e registro:** os guias estaduais mostram que costuma ser feito na **vigilância sanitária estadual ou municipal**, com manual de boas práticas e memorial do rótulo. Se produto vegetal de MEI exige registro federal da Anvisa ou só licença local: **[Não verificado]**.
- **Normas citadas pelo FNDE para o PNAE:** RDC 27/2010 (alterada pela RDC 240/2018) e RDC 49/2013 (MEI, empreendimento familiar rural e economia solidária) para vegetal processado; RDC 272/2005 para fruta higienizada e congelada (exige alvará ou licença de funcionamento); IN MAPA 52/2011 (farinha de mandioca); IN MAPA 23/2005 (fécula, sagu, tapioca seca). **[Lido]** (FNDE)
- **Agroindústria que processa origem animal** cai na seção 1.3 (inspeção).

Documentos candidatos: licença sanitária ou alvará (estadual/municipal), registro/inscrição do estabelecimento (conforme o produto), CNPJ ou MEI, modelo de rótulo aprovado, manual de boas práticas quando exigido.

**Recomendação:** a configuração por produto define "tipo de regulação" (vegetal in natura, vegetal processado, origem animal, outro) e a lista de documentos de cada tipo. Começar com **processados vegetais simples** na segunda onda; processado de origem animal só junto com 1.3.

**Precisa de profissional:** responsável técnico de alimentos (engenheiro de alimentos ou nutricionista); vigilância sanitária local (enquadramento do estabelecimento).

---

## 2. PSP com split para marketplace, sem custódia própria

### 2.1 Antes de escolher: duas ressalvas

1. **"Sem custódia" é uma intenção de projeto, não uma garantia.** Em todos os PSPs abaixo, o dinheiro passa pela conta do PSP (saldo por recebedor ou subconta). O que muda é quem é o titular de cada saldo. O Banco Central regula o "subcredenciador" (quem habilita recebedores a aceitar pagamentos de um arranjo) na Resolução BCB 150/2021, e há discussões recentes sobre responsabilidade e liquidação de subcredenciadores (Voto BCB 159/2025). **[Busca]** Confirmar com advogado de pagamentos se o desenho escolhido deixa o AgroDireto fora dessa categoria.
2. **A comissão do AgroDireto é receita de serviço.** Tributação e nota fiscal da comissão: contador.

### 2.2 Comparativo (5 opções)

| Item | Asaas | Pagar.me (Stone) | Mercado Pago | iugu | Stripe |
|---|---|---|---|---|---|
| **Pix, tarifa** | R$ 1,59 ou R$ 0,79 por Pix recebido; a página não diz qual vale para quem. [Lido] | "Pix 0,99%" em destaque na página, dentro de banner de Black Friday. [Lido] | Não encontrado (páginas de tarifa deram 403). [Não verificado] | Não encontrado (página de preço deu 404; artigo de suporte deu 403). [Não verificado] | 1,19% por Pix, em seção "somente por convite". [Lido] |
| **Cartão, tarifa** | Débito R$ 0,35 + 1,89%; crédito não lido. [Lido] | Crédito à vista 4,19% (mesmo banner). [Lido] | Não verificado | Não verificado | Nacional 3,99% + R$ 0,39. [Lido] |
| **Tarifa de split/subconta** | Não achei tarifa de split; há "taxa de criação" de subconta citada sem valor. [Lido] | Não achei. [Lido] | Não há tarifa adicional de split; vale a do meio de pagamento. [Busca] | Busca antiga (cerca de 5 anos) cita R$ 1,00 por subconta ativa e R$ 2,00 por transferência. [Busca] | Connect: 0,25% de "tarifa de entrada" para plataformas que cobram do próprio jeito. [Lido] |
| **Quem recebe** | Cada recebedor precisa de **conta Asaas** (walletId). Conta-mãe precisa ser **PJ**. Split vem desativado e é habilitado em "Integrações > Segurança" com confirmação por SMS ou app. [Lido] | Recebedor cadastrado por API (**pessoa física ou jurídica**, CPF/CNPJ, conta bancária). Split "disponível apenas para clientes PSP". [Lido] | Vendedor liga a conta por **OAuth**; exige conta de vendedor com **KYC nível 6** e app do Mercado Pago. [Lido] | Split **só entre contas iugu** (mestre e sub); só no plano Marketplace. [Lido] | Contas conectadas (Connect). Detalhe de verificação e disponibilidade no Brasil não lido. [Não verificado] |
| **Cadastro/KYC do vendedor** | Campos: nome, e-mail, CPF/CNPJ, celular, renda ou faturamento, endereço. Eventos de aprovação por documento, dados comerciais e conta. Lista de documentos e prazo não achei. [Lido] | Campos do recebedor sim; análise KYC, documentos e prazo: não achei. [Lido] | KYC 6 (ver acima); CNPJ não é obrigatório no modelo 1:1, mas nota fiscal pode ser exigida por segmento. [Lido]/[Busca] | Muito detalhado: identidade, selfie, comprovante de endereço (PF), contrato social (PJ), dados bancários; análise em até 2 dias úteis. [Lido] | Não verificado |
| **Pix no split** | Pix é meio de cobrança; split roda no recebimento. [Lido] | Pix disponível (0,99%); split no pedido. [Lido] | **Ponto aberto:** o split 1:1 só cita "saldo entre contas Mercado Pago"; uma página de blog (bloqueada para mim) diria que Pix no Checkout Transparente não vale para marketplace. [Busca] | Regras de split separadas para cartão, boleto e Pix. [Busca] | Documentação de Pix e Connect em conflito sobre convite. [Lido] |
| **Webhooks** | `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_SPLIT_DONE`, `PAYMENT_SPLIT_CANCELLED`, estornos e chargebacks, `ACCOUNT_STATUS_*_APPROVED`. Autenticação por **token no cabeçalho** (sem HMAC). Entrega "pelo menos uma vez": usar o `id` do evento para idempotência. Após 15 falhas seguidas a fila pode parar; eventos ficam guardados 14 dias. [Lido] | `order.paid`, `charge.refunded`, `charge.paid`, `recipient.created/updated`. Reenvio configurável e endpoint de reenvio manual. Assinatura do webhook: não achei. [Lido] | Não lido. [Não verificado] | Eventos de verificação de subconta; exemplo com cabeçalho `Signature`, cálculo não explicado. [Lido] | Não lido (Pix: `charge.dispute.created`). [Lido] parcial |
| **Custódia** | Cobrança fica na conta que vendeu; valores vão às carteiras indicadas. Há "Conta Escrow" opcional por subconta (garantia por prazo). [Lido] | "Repassados diretamente aos vendedores"; mas existe saldo por recebedor na Pagar.me e saque automático diário, semanal ou mensal. [Lido] | Estorno é descontado das contas do vendedor e do marketplace, na proporção. [Lido] | Valor transferido "assim que o pagamento for realizado"; subconta pode manter saldo. [Lido] | Pix liquida em até T+2. [Lido] |
| **Estorno no split** | Repasses relacionados são estornados junto. [Lido] | Marketing cita "estornos automáticos"; quem responde: não achei. [Lido] | Marketplace não consegue reembolso total se o vendedor não tem saldo; parte restante é do vendedor. [Lido] | Não verificado | Pix: contestação não passa pela Stripe, decisão do parceiro é final; reembolso de Pix até 90 dias. [Lido] |
| **Pontos a perguntar** | Prazo de liquidação do Pix; tarifa de criação de subconta; documentos do KYC. | Tarifa real do plano marketplace; KYC; quem responde por chargeback. | Pix no split; tarifas; webhooks. | Tarifas atuais; Pix no split. | Convite para Pix; Connect no Brasil. |

### 2.3 Opções e recomendação

- **A) Asaas** (hoje a documentação mais completa para o que o projeto precisa: split, subconta, webhooks com idempotência). Exige CNPJ do AgroDireto e que todo vendedor/transportador tenha conta no Asaas.
- **B) Pagar.me** (recebedor PF ou PJ por API, split por valor ou percentual). Exige contrato PSP e proposta; a tarifa pública é de campanha.
- **C) Mercado Pago:** conhecido do usuário final, mas o vendedor precisa ter KYC 6 e o Pix em split está incerto. Boa como comparação.
- **D) iugu:** KYC detalhado, mas split só entre contas iugu e tarifas não confirmadas.
- **E) Stripe:** Pix e Connect no Brasil em conflito na própria documentação.

**Recomendação:** pedir proposta por escrito a **Asaas e Pagar.me**, com as mesmas perguntas: tarifa de Pix e cartão no plano marketplace, tarifa por recebedor, prazo de aprovação do KYC dos vendedores rurais (que muitas vezes são pessoa física, sem CNPJ), prazo de liquidação do Pix, responsabilidade por chargeback e estorno, e confirmação por escrito de que o dinheiro do vendedor não passa por conta do AgroDireto. Não integrar antes de G01 (plano).

### 2.4 Comissão e tarifas (decisão de operação)

As fontes não definem comissão. Opções sobre quem paga a tarifa do PSP:
- **Vendedor paga** (descontada do repasse; é o padrão do Mercado Pago, tarifa do MP sai do valor do vendedor antes da comissão do marketplace). **[Lido]**
- **Plataforma absorve** dentro da comissão.
- **Comprador paga** como taxa de serviço.

**Recomendação:** mostrar no pedido três linhas separadas: valor do produto, tarifa do PSP e comissão do AgroDireto. A **comissão por segmento** e quem paga cada tarifa ficam com a operação; esta pesquisa não traz número.

**Precisa de profissional:** advogado de pagamentos (Resolução BCB 150 e custódia); contador (nota da comissão, tributos); jurídico (termos para vendedor sobre estorno e chargeback).

---

## 3. Fontes de preço de referência

Regras de produto para qualquer fonte: mostrar **fonte, data, unidade, nível (atacado, produtor, varejo) e praça ou UF**; nunca misturar níveis; sem dado, mostrar estado vazio; não calcular média própria sem nota do método.

| Fonte | O que oferece | Acesso e frequência | Licença / reuso |
|---|---|---|---|
| **CEAGESP** (hortifrúti, atacado SP e interior) | Cotações por produto e data com mínimo, mais comum e máximo (R$). Valor é **preço de venda no atacado**, não preço pago ao produtor. Índice CEAGESP mensal de 161 itens, com série desde 2014. | Consulta por produto e data no site. Boletim publicado segunda, quarta e sexta. Não achei download, CSV ou API. [Lido] (boletim) / [Busca] (demais) | **"Todos os direitos reservados."** A página de dados abertos diz que a CEAGESP **não está no escopo** do Decreto 8.777/2016. Sem licença de reuso. [Lido] Raspar o site sem autorização é arriscado. |
| **CONAB** (grãos e outros, vários níveis) | Pesquisa de preços de mais de 112 (ou 130, a própria fonte diverge) produtos, mais de 20 mil séries por UF. Painéis semanal e mensal; arquivos para download "Preços agropecuários Mensal/Semanal por UF e por Município". [Lido]/[Busca] | Portal de informações com arquivos para baixar. Não achei API documentada. A página de download deu erro de certificado para o leitor, então os nomes dos arquivos vêm de busca. [Busca] | Rodapé do site: **Creative Commons Atribuição-SemDerivações 3.0 (CC BY-ND 3.0)**. Vale para o conteúdo do site; não há regra específica para dados. A Conab também **não está no escopo** do Decreto 8.777/2016. "Sem derivações" pode impedir recortes, médias e transformações; **perguntar**. [Lido] |
| **CONAB Prohort** (hortigranjeiros nas Ceasas) | Preços e comercialização nas principais Ceasas. Boletim hortigranjeiro **mensal** em PDF; consulta de preços diários em painel Power BI; resumo executivo semanal. | Formato das séries (planilha ou só PDF) não confirmado. Contato: prohort@conab.gov.br. [Lido] | Mesma licença do site (CC BY-ND 3.0). |
| **Cepea/Esalq-USP** (indicadores: milho, soja e outros grãos, boi, bezerro, leite, café, citros, tilápia e outros) | Indicadores de preço por produto. | Páginas de indicador existem; a página de política de direitos autorais e as páginas dos indicadores deram **403** para o leitor. A frequência não foi verificada. [Busca] | Segundo resultados de busca: páginas de indicador trazem "CC BY-NC 4.0" (**uso não comercial**, com citação da fonte), e a política de direitos autorais exige **autorização formal** (cepea@usp.br) para retransmitir conteúdo e proíbe transmitir séries de preços. Como o AgroDireto cobra comissão, tratar como **uso comercial**. [Busca] |
| **Outras (IBGE, órgãos estaduais, Ceasas locais)** | Não pesquisadas. [Não verificado] | | |

**Opções**
- A) Mostrar só **link para a fonte** (sem copiar o dado). Sem risco de licença; pouco valor.
- B) Importar **só dados de licença clara** (CONAB) por Edge Function agendada, mostrando o valor original com fonte e data, sem recalcular.
- C) Pedir **autorização escrita** à CEAGESP (Seção de Economia e Desenvolvimento) e ao Cepea para uso na plataforma, e só então importar.

**Recomendação:** B agora e C em paralelo. Para hortifrúti, o Prohort da CONAB (Ceasas) cobre o nível de atacado enquanto a CEAGESP não responde. Para grãos, CONAB (preço recebido pelo produtor). Para pecuária, aguardar autorização do Cepea. Por regra do projeto, a busca e a gravação passam por Edge Function, não pelo app.

**Precisa de profissional:** advogado (licença: CC BY-ND e CC BY-NC frente ao uso comercial); contato formal com cada instituição.

---

## 4. PAA e PNAE

### 4.1 PNAE (merenda escolar)

- **Percentual:** a Lei 15.226/2025 (30/09/2025) elevou de 30% para **45%** o mínimo do repasse federal do FNDE que deve ir para agricultura familiar, a partir de **01/01/2026** (Lei 11.947/2009, art. 14). Pode-se aplicar até 100%. **[Lido]**
- **Quem vende** (FNDE, FAQ de 2026): **agricultor individual** (CPF + CAF pessoa física); **grupo informal** (CPF e CAF PF de cada um); **grupo formal** (cooperativa, associação ou empreendimento familiar rural, com CNPJ + CAF pessoa jurídica). Não se exige filiação à OCB. **[Lido]**
- **CAF e DAP:** a FAQ do PNAE fala só em **CAF** (Portaria MDA 19/2025, e Portaria 20/2025 para a entidade emissora). DAP não aparece. **[Lido]**
- **Documentos** (norma: Resolução CD/FNDE nº 4/2026): individual: CPF, extrato do CAF PF emitido nos **últimos 60 dias**, projeto de venda assinado, documentação sanitária conforme o alimento, declaração de produção própria. Grupo formal: CNPJ, extrato CAF PJ (60 dias), certidões de Fazenda federal, Seguridade e FGTS, estatuto e ata, projeto de venda, relação de agricultores (nome, CAF, produto e valor), declaração de controle do limite individual, documentação sanitária. A documentação deve estar válida na habilitação. **[Lido]**
- **Chamada pública:** quem faz é a **entidade executora** (estado, DF, município, Instituto Federal), com pesquisa de preços e publicidade. Não é disputa por menor preço nem registro de preços. **Ordem de seleção:** localidade (imediata, intermediária, estado, país); grupos prioritários (assentamentos, indígenas, quilombolas, mulheres, jovens); produção orgânica/agroecológica certificada; forma de organização (grupos formais, informais, individuais, cooperativas centrais); empate por sorteio. **Preço:** média de pelo menos 3 fornecedores locais, priorizando feira do produtor, incluindo frete, embalagem e encargos. Orgânicos: até 30% a mais se previsto no edital. **[Lido]**
- **Não achei** o limite anual por agricultor nem por entidade, nem o prazo mínimo de divulgação da chamada. Estão na Resolução 4/2026 e/ou no edital de cada entidade. **[Não verificado]**
- **Sanitário:** origem animal sempre exige inspeção oficial (SIM, SIE, SIF). Vegetal processado segue normas da Anvisa e da vigilância local. In natura segue padrão de classificação. **[Lido]**

### 4.2 PAA (Programa de Aquisição de Alimentos)

- **Base:** Lei 14.628/2023 e Decreto 11.802/2023 (que **revogou os arts. 1º a 30 do Decreto 11.476/2023**). O Decreto 11.802 foi alterado depois (Decretos 12.089/2024 e 13.099/2026, **não lidos**). **[Lido]** 
- **Modalidades** (Decreto 11.802, art. 3º): compra com doação simultânea, PAA-Leite, compra direta, apoio à formação de estoques, compra institucional. **[Lido]**
- **Quem vende:** agricultor familiar e demais beneficiários da Lei 11.326 (identificados por **CPF**), e cooperativas e outras organizações que atendam critérios do Grupo Gestor. Comprovação por **CAF válido, DAP ativa** ou outro documento definido pelo Grupo Gestor. Organização só revende produto de beneficiários fornecedores. **[Lido]**
- **Limites por ano civil** (Decreto 11.802, art. 6º): por unidade familiar R$ 15.000 (doação simultânea, compra direta, estoques) e R$ 30.000 por entidade compradora (compra institucional e PAA-Leite); por organização R$ 1.500.000 e R$ 6.000.000 (compra institucional). **O texto sofreu alterações em 2026; conferir a versão consolidada.** **[Lido]**
- **Como compra:** União, estados, DF e municípios compram **sem licitação**, com preço compatível com o mercado local ou regional. Execução por termo de adesão de estado/DF/município (que deve ter aderido ao Sisan), descentralização para a **Conab**, ou direto pelo órgão comprador (compra institucional). Preço de referência vem da metodologia do **Grupo Gestor**. **[Lido]** A palavra "chamada pública" não aparece nos decretos para o PAA; a Conab diz que o interessado consulta a Superintendência Regional. **[Lido]**
- **Percentuais e prioridades:** mínimo de 30% das compras federais de alimentos da agricultura familiar (Lei 14.628, art. 8º, "sempre que possível"); mulheres e jovens rurais com prioridade; o decreto prevê mínimo de 50% de mulheres na execução. **[Lido]**
- **Sistemas:** o MDS, o MDA e a Conab devem manter sistemas informatizados para acompanhar limites e aquisições (Decreto 11.802, art. 33). Não há menção a plataformas privadas. **[Lido]**
- **Conab (compra direta):** a página gov.br cita exigência de ao menos 75% de associados ou cooperados agricultores familiares para organizações; esse percentual não está nos decretos lidos. **[Lido]**

### 4.3 O que a plataforma pode apoiar **sem declarar elegibilidade**

Quem habilita é a entidade compradora (prefeitura, secretaria, Conab); a plataforma não substitui essa análise.

| Pode fazer | Não pode fazer |
|---|---|
| Guardar o **extrato do CAF** enviado pelo vendedor, com data de emissão e **alerta de vencimento** (60 dias para o PNAE) | Mostrar "elegível", "habilitado" ou "aprovado" para PAA/PNAE |
| Listar a **checklist de documentos** por tipo de vendedor (individual, grupo informal, grupo formal) | Preencher o projeto de venda como se fosse declaração oficial |
| Somar o que o CPF já vendeu pela plataforma e **avisar proximidade do limite** (R$ 15 mil ou R$ 30 mil), com texto "controle indicativo; a entidade compradora é quem controla" | Tratar o controle da plataforma como o controle oficial do limite |
| Mostrar a **ordem de prioridade** da chamada como informação (localidade, grupo prioritário, orgânico) | Atribuir sozinha o selo de grupo prioritário (mulher, jovem, quilombola) sem documento |
| Conectar o produtor à **chamada pública** (link para o edital da entidade) | Participar da chamada em nome do produtor sem procuração e aceite expresso |
| Organizar a documentação **sanitária** por produto (SIM, SIE, SIF ou licença sanitária) | Garantir que o produto atende ao edital |

**Decisões da operação:** quais programas e instituições entram no piloto (PAA, PNAE, outros); quem na equipe valida os documentos (se for a plataforma, é conferência de documento, nunca habilitação); se a plataforma pode consultar o CAF no sistema do MDA (caf.mda.gov.br aparece como canal de consulta, mas não verifiquei se há acesso programático).

**Precisa de profissional:** advogado de compras públicas (papel da plataforma e responsabilidade por documentos); contador (nota fiscal e pagamento em operação com ente público).

---

## 5. Critério legal de pequeno produtor e agricultor familiar (indicadores de ODS)

### 5.1 O que a lei define

- **Lei 11.326/2006, art. 3º.** Agricultor familiar e empreendedor familiar rural é quem pratica atividade no meio rural e atende **ao mesmo tempo**: (I) área de até **4 módulos fiscais**; (II) mão de obra predominantemente da família; (III) renda familiar originada, num percentual mínimo definido pelo Executivo, da atividade do estabelecimento; (IV) direção do estabelecimento pela própria família. Silvicultores, aquicultores, extrativistas, pescadores, povos indígenas, quilombolas e comunidades tradicionais entram com requisitos adaptados (alguns não precisam do limite de área). **[Lido]**
- **Decreto 9.064/2017:** repete os quatro requisitos, define **renda mínima de metade** da renda familiar vinda do estabelecimento (art. 3º, III, em percentual, não em valor em reais), e diz que o **CAF substitui a DAP** (art. 6º). O módulo fiscal é medido em hectares, varia por município e é calculado pelo Incra. **[Lido]**
- **CAF (gov.br):** serviço gratuito, presencial na Rede CAF do município (prefeitura, sindicato, Emater etc.). Validade de **3 anos** segundo a página do gov.br (fontes regionais divergem: 2 anos; **usar 3 do gov.br e confirmar**). Documentos: CPF dos maiores de 16 anos, comprovação de posse, comprovação de renda etc. **[Lido]**
- **Limite de renda em R$:** **não existe** no decreto lido. Outros programas (Pronaf, ITR, "pequena propriedade" na reforma agrária) têm **definições próprias**; não foram pesquisadas aqui e **não devem ser misturadas** com a da Lei 11.326. **[Não verificado]**
- **DAP:** deixou de ser emitida depois de 31/10/2022 (Portaria 174/2022) e as DAPs seguem válidas até o fim da vigência. O PAA ainda aceita DAP ativa; o PNAE fala só em CAF. **[Busca]**/**[Lido]**

### 5.2 O que os indicadores de ODS pedem

- ODS 2, meta 2.3. Indicador **2.3.1**: volume de produção por unidade de trabalho por classe de tamanho da empresa. Indicador **2.3.2**: renda média dos pequenos produtores de alimentos, por sexo e condição indígena. A FAO é a agência responsável. **[Lido]** (página FAO, parcial)
- **Não há definição internacional única de pequeno produtor.** A proposta da FAO para calcular esses dois indicadores usa critérios relativos (por exemplo, estar entre os 40% menores em área e entre os 40% menores em renda do universo de estabelecimentos), o que exige dados de **todos** os produtores do país. Isso vem da nota de um instituto estatístico que segue a FAO e de um documento do ECOSOC; **a metodologia da FAO (CA3043EN) e o documento do ECOSOC deram 403 e não pude lê-los**. **[Busca]**/**[Não verificado]**
- No Brasil, o IBGE publica os dois indicadores (tabelas SIDRA 10390 e 10391, ano 2017), a partir do Censo Agropecuário e usando o critério da Lei 11.326 para agricultura familiar. A página SIDRA deu 403; a informação vem de busca. **[Busca]**

### 5.3 Opções e recomendação

- **A) Critério legal:** "agricultor familiar" = tem **CAF ativo** (documento enviado e conferido). Simples, auditável, vem de lei.
- **B) Critério por tamanho:** até 4 módulos fiscais. Exige saber o módulo fiscal do município e a área total, que o cadastro já pede em parte. Não inclui renda nem mão de obra.
- **C) Critério FAO relativo (percentis).** Impossível com dados só da plataforma, que não vê o universo de produtores.

**Recomendação:** usar **A** e rotular o indicador como **"vendedores com CAF ativo"**, não como "pequeno produtor". Indicadores do tipo "contribuição": volume e valor vendidos por vendedores com CAF, participação de mulheres e de jovens (com consentimento e regra de dados pessoais), renda **obtida na plataforma** (nunca "renda do produtor"). **Não calcular 2.3.1 nem 2.3.2 como indicadores oficiais.** Fórmula, fonte e período de cada indicador ficam documentados no próprio painel. Antes de ter volume real de operações, mostrar estado vazio (como já prevê o plano §12.5).

**Precisa de profissional:** estatístico ou assessor de ODS (se houver relatório externo); advogado (proteção de dados de sexo, idade e etnia, que são dados pessoais ou sensíveis).

---

## 6. Perguntas prontas para levar à reunião

1. Hortifrúti: quais produtores do piloto já emitem nota fiscal e em que estado? Quem guarda os registros de rastreabilidade hoje?
2. Grãos: o comprador exige classificação certificada? Qual entidade classifica na região do piloto?
3. Pecuária: o piloto aceita só produto inspecionado? Há veterinário parceiro? Os produtores têm SIM, SIE ou SIF?
4. Agroindústria: os candidatos têm licença sanitária? São MEI, cooperativa ou empresa?
5. PSP: o AgroDireto tem CNPJ? Aceita exigir conta de PSP de cada vendedor? Quem paga a tarifa?
6. Preço: aceita iniciar só com CONAB? Quem escreve à CEAGESP e ao Cepea?
7. Institucional: quais prefeituras ou estados entram no piloto? Quem confere os documentos?
8. ODS: aceita usar "vendedores com CAF ativo" como definição? Quem é o público dos indicadores?

---

## 7. O que precisa de profissional

| Profissional | O que levar |
|---|---|
| **Médico veterinário** | GTA, transporte de animais, exigência por espécie, inspeção (SIF/SIE/SIM, SISBI, Selo ARTE), abrangência territorial de cada serviço |
| **Responsável técnico de alimentos / vigilância sanitária local** | Enquadramento de agroindústria, licença, rótulo (RDC 727/2022), processados vegetais |
| **Engenheiro agrônomo ou classificador credenciado** | Classificação de grãos, padrões por produto, rastreabilidade (INC 02/2018) |
| **Advogado de pagamentos** | Resolução BCB 150/2021 (subcredenciador), custódia, responsabilidade por estorno e chargeback, contrato com o PSP, termos para o vendedor |
| **Advogado de compras públicas** | Papel da plataforma frente ao PAA/PNAE, procuração para participar de chamada, uso do CAF e proteção de dados |
| **Advogado (propriedade intelectual e dados)** | Licenças CC BY-ND (CONAB) e CC BY-NC/autorização (Cepea), uso comercial de preços de CEAGESP |
| **Contador** | Nota fiscal do produtor por estado, nota da comissão, tributação de comissão e de frete, Funrural e ICMS (não pesquisados aqui) |
| **Estatístico / assessor ODS** | Fórmulas e rótulos dos indicadores |

---

## 8. Limites desta pesquisa

- Páginas que **não consegui ler** (403, certificado, tempo esgotado): Cepea (política de direitos autorais, widget e indicadores), CEAGESP (cotações), CONAB (página de download de arquivos), Mercado Pago (blog de Pix e tarifas), iugu (preços e artigo de tarifas), SIDRA/IBGE (ODS), ECOSOC e FAO (metodologia dos indicadores), FNDE (uma das páginas de agricultura familiar). O que sei delas vem de resumos de busca e está marcado **[Busca]**.
- Textos de lei vieram dos sites oficiais (Planalto, gov.br) quando marcados **[Lido]**; para uso jurídico, conferir a versão consolidada e as alterações recentes (por exemplo, Decreto 13.099/2026 e Lei 15.178/2025, **não lidos**).
- **Não pesquisados:** tributação (ICMS, Funrural, ISS da comissão), contratos de commodities, CPR, armazenagem, seguros, proteção de dados em profundidade (LGPD) e política de dados públicos do QR (item de H05 no plano), logística de carga viva por UF.
- Tarifas dos PSPs não foram confirmadas por proposta. Nenhuma conta foi criada em nenhum PSP.
- Esta pesquisa não verifica o que existe em cada município do piloto; região e culturas continuam pendentes ([piloto.md](piloto.md)).

---

## 9. Fontes

**Documentos por segmento**
- Rastreabilidade de vegetais frescos, IN Conjunta Anvisa/SDA 02/2018: [sislegis MAPA](https://sistemasweb.agricultura.gov.br/sislegis/action/detalhaAto.do?method=visualizarAtoPortalMapa&chave=1000872877), [texto Anvisa (BVS)](https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2019/intconj0002_7_02_2018.pdf), [CEAGESP sobre rastreabilidade](https://ceagesp.gov.br/rastreabilidade/)
- Classificação vegetal: [Lei 9.972/2000](https://www.planalto.gov.br/ccivil_03/leis/l9972.htm), [Decreto 6.268/2007](https://www.adagri.ce.gov.br/wp-content/uploads/sites/51/2012/05/Decreto_6.268_de_22.11.2007.pdf), [Registro no CGC/MAPA](https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-vegetal/registro-dipov/registro-no-cgc-mapa-in-no-09-2019), [Curso de classificadores (soja, milho, trigo)](https://www.gov.br/agricultura/pt-br/centrais-de-conteudo/eventos/cursos/2022/cursos-de-capacitacao-e-qualificacao-de-classificadores/curso-de-capacitacao-e-qualificacao-de-classificadores-17102022)
- Nota fiscal do produtor (por estado): [Sefaz-PR NFP-e](https://sped.fazenda.pr.gov.br/NFPe/Pagina/NOTA-FISCAL-DE-PRODUTOR-ELETRONICA-NFP-e), [Defesa Agropecuária SP, NF-e obrigatória](https://www.defesa.agricultura.sp.gov.br/noticias/2026/gestao-normativa-da-secretaria-da-fazenda-torna-obrigatorio-o-uso-da-nota-fiscal-eletronica-pelo-produtor-rural,2383.html), [Sefaz-BA Nota Fiscal Fácil](https://www.sefaz.ba.gov.br/noticias/sefaz-ba-simplifica-emissao-de-notas-fiscais-para-pequenos-produtores-rurais-via-nota-fiscal-facil/)
- GTA e trânsito animal: [Habilitar-se para emitir GTA (gov.br)](https://www.gov.br/pt-br/servicos/habilitar-se-para-emissao-da-guia-de-transito-animal), [Manual GTA bovinos e bubalinos (MAPA, via Seagri-RS)](https://www.agricultura.rs.gov.br/upload/arquivos/202005/27103315-manualgtabovinosebubalinos24-0.pdf), [Manual de fiscalização de trânsito (IDAF-AC)](https://idaf.ac.gov.br/wp-content/uploads/2024/04/MANUAL-DE-PROC.-FISC.-TRAN.-AGROP.-IDAF-2022.pdf), [Manual GTA suídeos (Adapar-PR)](https://www.adapar.pr.gov.br/sites/adapar/arquivos_restritos/files/documento/2021-07/m_005_emissao_de_gta_de_suideos_atual_05_07_21.pdf)
- Inspeção: [Decreto 9.013/2017](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9013.htm), [FAQ do RIISPOA (MAPA)](https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-animal/arquivos-publicacoes-dipoa/perguntas-e-respostas-decreto-9-013-de-2017-regulamento-de-inspecao-industrial-e-sanitaria-de-produtos-de-origem-animal-riispoa-perguntas-e-respostas-versao-6-18-04-2024), [SISBI-POA](https://www.gov.br/agricultura/pt-br/assuntos/defesa-agropecuaria/suasa/sisbi-1), [Legislação de POA](https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-animal/legislacao)
- Selo ARTE: [FAQ do MAPA](https://www.gov.br/agricultura/pt-br/assuntos/producao-animal/selo-arte-selo-queijo-artesanal/faq), [Decreto 11.099/2022](https://planalto.gov.br/ccivil_03/_Ato2019-2022/2022/Decreto/D11099.htm)
- Agroindústria: [RDC 727/2022 (cópia da Vigilância do DF)](https://www.saude.df.gov.br/documents/37101/0/Resolucao+da+Diretoria+Colegiada+-+RDC+n%C2%BA+727,+de+01-07-2022.pdf/711709f9-f94c-2185-f899-4970e0922c21?t=1746710121752), [Manual de registro de agroindústria familiar (AGED-MA)](https://aged.ma.gov.br/wp-content/uploads/2025/07/MANUAL-AGROINDUSTRIA-FAMILIAR-01-08.pdf)

**PSPs**
- Asaas: [preços e taxas](https://www.asaas.com/precos-e-taxas), [split](https://docs.asaas.com/docs/split-de-pagamentos), [FAQ do split](https://docs.asaas.com/docs/faq-do-split), [criar subconta](https://docs.asaas.com/docs/criar-subconta), [sobre os webhooks](https://docs.asaas.com/docs/sobre-os-webhooks), [webhook de cobranças](https://docs.asaas.com/docs/webhook-para-cobrancas), [split com Conta Escrow](https://docs.asaas.com/docs/split-para-contas-com-conta-escrow)
- Pagar.me: [visão geral do marketplace](https://docs.pagar.me/docs/overview-marketplace), [recebedores](https://docs.pagar.me/docs/recebedores-2), [pedidos com split](https://docs.pagar.me/docs/pedidos-com-split), [webhooks](https://docs.pagar.me/docs/webhooks), [preços](https://www.pagar.me/precos)
- Mercado Pago: [pré-requisitos do split 1:1](https://www.mercadopago.com.br/developers/pt/docs/split-payments/split-1-1/prerequisites), [visão geral](https://www.mercadopago.com.br/developers/pt/docs/split-payments/split-1-1/overview), [integrar marketplace](https://www.mercadopago.com.br/developers/pt/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace), [Pix no Checkout Transparente (blog, não li)](https://www.mercadopago.com.br/blog/o-pix-chegou-ao-checkout-transparente-do-mercado-pago)
- iugu: [split de pagamentos](https://dev.iugu.com/docs/split-de-pagamentos), [criar, verificar e configurar subconta](https://dev.iugu.com/docs/criar-verificar-e-configurar-subconta), [fluxo marketplace](https://dev.iugu.com/docs/fluxo-marketplace), [tarifas do marketplace (não li)](https://support.iugu.com/hc/pt-br/articles/202399728-Como-s%C3%A3o-compostas-as-tarifas-do-marketplace-)
- Stripe: [preços Brasil](https://stripe.com/br/pricing), [Pix](https://docs.stripe.com/payments/pix), [Connect](https://docs.stripe.com/connect)
- Banco Central: [Voto BCB 159/2025](https://normativos.bcb.gov.br/Votos/BCB/2025159/Voto_do_BC_159_2025.pdf), [Circular 3.682/2013 (revogada pela Resolução BCB 150/2021)](https://normativos.bcb.gov.br/Lists/Normativos/Attachments/48838/Circ_3682_v19_P.pdf)

**Preço de referência**
- CEAGESP: [cotações](https://ceagesp.gov.br/cotacoes/), [boletim de preço](https://ceagesp.gov.br/comunicacao/noticias/boletim-de-preco-da-ceagesp/), [índice CEAGESP](https://ceagesp.gov.br/indice-ceagesp/), [dados abertos](https://ceagesp.gov.br/acesso-a-informacao/dados-abertos/)
- CONAB: [preços agropecuários](https://www.gov.br/conab/pt-br/atuacao/informacoes-agropecuarias/precos-agropecuarios), [Portal de Informações](https://portaldeinformacoes.conab.gov.br/), [download de arquivos](https://portaldeinformacoes.conab.gov.br/download-arquivos.html), [Prohort](https://www.gov.br/conab/pt-br/atuacao/informacoes-agropecuarias/hortigranjeiros-prohort), [dados abertos](https://www.gov.br/conab/pt-br/acesso-a-informacao/dados-abertos), [CC BY-ND 3.0](https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR)
- Cepea: [política de direitos autorais](https://www.cepea.org.br/br/politica-de-direitos-autorais-1.aspx), [cotações no seu site](https://www.cepea.org.br/br/widget.aspx), [indicador do milho](https://www.cepea.org.br/br/indicador/milho.aspx)

**PAA, PNAE, agricultura familiar**
- PNAE: [FAQ de agricultura familiar no PNAE (FNDE)](https://www.gov.br/fnde/pt-br/acesso-a-informacao/acoes-e-programas/programas/pnae/agricultura-familiar-no-pnae), [notícia da lei dos 45%](https://www.gov.br/fnde/pt-br/assuntos/noticias/lei-amplia-compra-da-agricultura-familiar-para-o-pnae), [Lei 15.226/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15226.htm), [Lei 11.947/2009](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l11947.htm)
- PAA: [Lei 14.628/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14628.htm), [Decreto 11.802/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/d11802.htm), [Decreto 11.476/2023 (revogado em parte)](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/d11476.htm), [Compra direta (Conab, gov.br)](https://www.gov.br/pt-br/servicos/vender-alimentos-da-agricultura-familiar-para-a-conab-compra-direta)
- Agricultura familiar e CAF: [Lei 11.326/2006](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11326.htm), [Decreto 9.064/2017](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9064.htm), [Cadastro Nacional da Agricultura Familiar (gov.br)](https://www.gov.br/pt-br/servicos/cadastrar-se-no-caf-cadastro-nacional-da-agricultura-familiar)

**ODS**
- [FAO, indicador 2.3.2](https://www.fao.org/sustainable-development-goals-data-portal/data/indicators/average-income-of-small-scale-food-producers-by-sex-and-indigenous-status/en), [IBGE SIDRA, ODS](https://sidra.ibge.gov.br/pesquisa/ods), [ODS Brasil, indicadores](https://odsbrasil.gov.br/produtores/relatorio), [Ipea, ODS 2](https://ipea.gov.br/ods/ods2.html), [ECOSOC, definição de pequeno produtor (não li)](https://ecosoc.un.org/sites/default/files/documents/2023/BG-Item3j-small-scale-food-producers-definition-FAO-E.pdf)
