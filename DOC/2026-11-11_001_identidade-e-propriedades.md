# Autenticação e cadastro de propriedade em homologação

O pedido foi conectar Agricultor e Administrador ao Supabase e validar o primeiro fluxo de cadastro. O agricultor entra com e-mail e senha, salva um rascunho local por conta e envia a propriedade. O administrador consulta a lista de pendências e aprova a propriedade. O servidor grava a conta responsável e o horário da aprovação. O agricultor vê o status ao reabrir o cadastro.

A primeira migração cria os vínculos de equipe, as propriedades e as funções de envio e aprovação. A segunda acrescenta a configuração privada de segundo fator por ambiente. O banco aplica as permissões e registra a decisão na mesma transação da aprovação. A conta administrativa indicada foi cadastrada pelo usuário e recebeu vínculo de equipe na homologação.

A pedido do usuário, o segundo fator ficou desligado somente no Supabase `agro` de homologação. O login ainda exige e-mail e senha e o banco confere o vínculo da equipe a cada operação. A configuração nasce com segundo fator obrigatório em novos ambientes. A tela do autenticador só abre quando o servidor exige MFA. SMS e WhatsApp ficaram fora desta etapa.

Os dois apps usam SecureStore no Android e iOS, com aprovação do usuário. Na web, a sessão fica em memória e é encerrada ao recarregar a página. O rascunho anterior à integração é associado à primeira conta que o abre no dispositivo. O cadastro envia uma propriedade por usuário. O reenvio conserva o registro já aceito pelo banco.

As migrações foram aplicadas pelo SQL Editor. Antes de usar a CLI para publicar novas migrations no projeto hospedado, concilie o histórico da CLI com as duas versões já aplicadas. Para reativar o segundo fator na homologação, execute como operador do banco:

```sql
update agrodireto_privado.seguranca_equipe
set exige_mfa = true
where unica;
```

A validação no banco usou usuários temporários e transações revertidas. Acesso anônimo, leitura cruzada, autoaprovação, promoção de papel e alteração de configuração foram bloqueados. A aprovação foi confirmada com auditoria e o reenvio não duplicou o registro. Os dois modos de MFA foram exercitados. O login real da conta de equipe chegou ao segundo fator antes da mudança. As rotas protegidas redirecionaram sem sessão nos dois apps. Tipos, lint e 45 testes passaram. As exportações web e os bundles Android e iOS dos dois apps foram gerados.

Pendências: ensaio completo pela interface com contas separadas de produtor e administrador, recuperação de conta, restauração de sessão em aparelho, edição/rejeição de cadastro enviado e uploads. A auditoria do npm sinalizou dependências de tooling e a versão de `sharp` do worker. Tratar a dependência do worker antes de expor o processamento a uploads reais.
