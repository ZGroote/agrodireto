begin;

-- Mídias dos lotes e propriedades. A linha nasce "aguardando" e é o registro durável do trabalho do worker:
-- o aviso ao worker é só um empurrão; se ele cair, a linha continua na fila.

create table public.midias (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references auth.users (id) on delete cascade,
  lote_id uuid references public.ofertas_lote (id) on delete cascade,
  propriedade_id uuid references public.propriedades (id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'video')),
  -- Original enviado (privado, bucket midias). Nunca é publicado: pode ter EXIF/GPS.
  arquivo text not null unique check (char_length(arquivo) between 1 and 500),
  -- Cópia sem metadados gerada pelo worker. Só ela pode ser publicada.
  arquivo_publicado text unique,
  processamento text not null default 'aguardando'
    check (processamento in ('aguardando', 'otimizando', 'pronta', 'mantida', 'falhou')),
  tentativas_processamento int not null default 0,
  processamento_iniciado_em timestamptz,
  tamanho_original_bytes bigint,
  tamanho_final_bytes bigint,
  motivo_processamento text check (char_length(motivo_processamento) <= 1000),
  criada_em timestamptz not null default now(),
  check (num_nonnulls(lote_id, propriedade_id) = 1),
  check ((processamento = 'pronta') = (arquivo_publicado is not null))
);
create index midias_fila on public.midias (criada_em)
  where processamento in ('aguardando', 'otimizando', 'falhou');

alter table public.midias enable row level security;
revoke all on public.midias from public, anon, authenticated;
grant select on public.midias to authenticated;
create policy midias_dono on public.midias for select to authenticated using (autor_id = (select auth.uid()));
-- Leitura por comprador entra com a exibição (D08) e deve exigir processamento = 'pronta'.

grant select (id, arquivo, processamento, tentativas_processamento) on public.midias to service_role;
grant update (processamento, arquivo_publicado, tamanho_original_bytes, tamanho_final_bytes, motivo_processamento)
  on public.midias to service_role;

-- Assume a próxima mídia da fila (uma por chamada, para o prazo só começar quando o trabalho começa).
-- Retoma "otimizando" cujo prazo venceu (worker caiu), tenta "falhou" de novo após 5 minutos, até 3 tentativas.
-- A tentativa devolvida é a cerca: o worker só grava o resultado se a linha ainda estiver nessa tentativa.
-- Prazo mínimo de 60 s.
create function public.assumir_proxima_midia(p_prazo_seg int)
returns table (midia_id uuid, caminho text, tentativa int)
language sql security definer set search_path = '' as $$
  update public.midias m
     set processamento = 'falhou',
         motivo_processamento = 'Tentativas esgotadas: o processamento parou sem resposta.'
   where m.processamento = 'otimizando' and m.tentativas_processamento >= 3
     and m.processamento_iniciado_em < now() - make_interval(secs => greatest(p_prazo_seg, 60));

  update public.midias m
     set processamento = 'otimizando',
         tentativas_processamento = m.tentativas_processamento + 1,
         processamento_iniciado_em = now(),
         motivo_processamento = null
   where m.id = (
     select c.id from public.midias c
      where c.tentativas_processamento < 3
        and (c.processamento = 'aguardando'
          or (c.processamento = 'falhou' and c.processamento_iniciado_em < now() - interval '5 minutes')
          or (c.processamento = 'otimizando'
              and c.processamento_iniciado_em < now() - make_interval(secs => greatest(p_prazo_seg, 60))))
      order by c.criada_em, c.id
      limit 1
      for update skip locked
   )
  returning m.id, m.arquivo, m.tentativas_processamento;
$$;

revoke all on function public.assumir_proxima_midia(int) from public, anon, authenticated;
grant execute on function public.assumir_proxima_midia(int) to service_role;

commit;
