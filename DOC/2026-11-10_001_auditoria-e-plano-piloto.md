# Auditoria do projeto e plano para piloto real

**Data/hora:** 10/11/2026, 10:55 (America/Sao_Paulo).
**Pedido:** verificar o trabalho anterior com Claude e mapear um plano de desenvolvimento.
**Prioridade confirmada pelo usuário:** MVP funcional para um piloto com usuários reais.

## Plano da ação

1. Ler instruções locais, PRD, memória e histórico.
2. Auditar em paralelo frontend, backend/mídia e decisões de produto.
3. Executar verificações existentes sem instalar dependências ou publicar serviços.
4. Registrar diagnóstico, marcos, riscos, dependências e backlog.

## Resultado

- Quatro apps separados com 124 componentes de tela no inventário atual: Agricultor 46, Cliente 26, Logística 26 e Administrador 26.
- A implementação é um protótipo navegável avançado; autenticação e transação comercial não estão integradas.
- Agricultor usa demo autorizada; os demais apps têm majoritariamente estados vazios.
- Backend comercial, migrations, RLS e cliente Supabase nos apps não foram localizados. As variáveis Supabase/RevenueCat dos quatro apps estão vazias.
- Worker possui implementação real e testes, mas adaptador, segurança dos arquivos, retomada e integração precisam trabalho antes de dados reais.
- A cópia extraída não contém repositório Git acessível; atribuição histórica baseada em DOC/memória/código, não em commits.
- O uso de worker próprio e dados de demonstração foi autorizado nos registros anteriores; não foi tratado como violação das regras antigas.

Entregues:
- [Plano de desenvolvimento](../tasks/plan.md), com sete etapas, escopo, riscos e critérios de saída.
- [Backlog](../tasks/todo.md), com 43 tarefas, responsáveis funcionais, dependências, aceite e verificação.
- Revisão independente do plano frente ao PRD, incorporando vídeos, avaliações, qualidade e retenção.

## Verificação

| Verificação | Resultado |
|---|---|
| Node / npm | 24.15.0 / 11.12.1 |
| `npm run typecheck` | Aprovado nos sete workspaces |
| `npm run lint` | Aprovado |
| `npm run test --workspaces --if-present` | 42 aprovados, 0 falhas, 0 pulados |
| Domínio | 15 testes |
| Worker | 27 testes, incluindo o teste opcional com FFmpeg real |
| Export web Agricultor | Aprovado |
| Export web Cliente | Aprovado |
| Export web Logística | Aprovado |
| Export web Administrador | Aprovado |
| Consistência do backlog | 43 IDs únicos; 43 seções de aceite e verificação |

Comando de export executado a partir de cada app, usando o Expo já instalado:
`../../node_modules/.bin/expo.cmd export --platform web --output-dir <diretório temporário do app>`.

Saídas: `C:/Users/respawn/AppData/Local/Temp/agrodireto-audit-20261110/<app>`.
A exportação gerou caches/artefatos locais; não houve deploy nem servidor novo mantido em execução por esta ação.

Limites: não houve build Android/iOS, teste em aparelho, inspeção visual do app em execução, integração real Supabase/PSP, Docker, teste de carga nem auditoria completa de dependências. O teste real de vídeo aceita retorno “mantida”; não valida todos os codecs, origens ou aparelhos.

## Arquivos alterados pela ação

- `tasks/plan.md` — novo.
- `tasks/todo.md` — novo.
- Este registro — novo.
- `DOC/README.md` — índice.
- `memoria.md` — última ação.

Nenhuma funcionalidade de aplicação foi alterada. Nenhuma biblioteca foi instalada. Não houve edição do CLAUDE.md.

## Decisões e limites de escopo

- Planejamento por marcos verificáveis; sem prometer calendário sem capacidade de equipe e dependências externas.
- Região/culturas, papel comercial, frete, PSP, monetização e regras de evidência continuam decisões abertas.
- Mantida a arquitetura existente; não iniciado backend, migração ou correção do worker.
- Ruflo/ToolSearch não estavam disponíveis no catálogo de ferramentas da sessão. A análise paralela usou os agentes disponíveis, sem inventar integração com Ruflo.
- Sugestão para regra permanente, sujeita a revisão: atualizar o CLAUDE.md para refletir monorepo, demo autorizada e exceção do worker.

## Memória anterior preservada

A memória de 06/11/2026 relatava:
- Worker com sharp/libvips, WebP e PSNR ≥ 38 dB; FFmpeg/x265, AV1 opcional e VMAF ≥ 95; fila, HTTP, adaptador Supabase e Dockerfile.
- Domínio em ES modules com 15 testes; worker com 26 testes.
- Image-picker ligado às telas 05, 12 e 30, com limites de 100 fotos/100 vídeos e listas de 52/37 formatos.
- Typecheck/lint aprovados e 41 testes; FFmpeg/VMAF reais, Docker, Supabase e aparelho não testados naquele ambiente.
- Aguardava autorização para construir Docker e testar FFmpeg, com downloads estimados.
- Informava servidor Agricultor na porta 19000.

Este registro preserva o contexto anterior. O servidor na porta 19000 não foi confirmado nesta auditoria. Não foi necessário instalar FFmpeg: já estava disponível neste host e o teste real executou. Docker e adaptador Supabase continuam sem validação nesta ação.

## Próximo passo

Revisar o recorte do piloto e iniciar a Etapa 0 após aprovação da fase. Primeira entrega funcional recomendada: cadastro real de produtor, propriedade persistida e aprovação administrativa, seguida de publicação do lote visível no Cliente.

