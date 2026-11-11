begin;

-- Catálogo do piloto: as 63 culturas nomeadas na lista PAM/IBGE 2025 enviada pelo usuário em
-- 11/11/2026 (35 temporárias + 28 permanentes; a lista cita 37 + 33, mas nomeia só estas). Segmento e unidades são a classificação inicial do Maestro;
-- ajustar por update. Idempotente: não duplica nem altera linhas existentes.
insert into public.catalogo_culturas (nome, segmento, unidades)
select v.nome, v.segmento, v.unidades
  from (values
    -- Grãos e sementes: vendidos a peso.
    ('Amendoim', 'graos', array['kg', 't']),
    ('Arroz', 'graos', array['kg', 't']),
    ('Aveia', 'graos', array['kg', 't']),
    ('Cacau', 'graos', array['kg', 't']),
    ('Café', 'graos', array['kg', 't']),
    ('Canola', 'graos', array['kg', 't']),
    ('Cevada', 'graos', array['kg', 't']),
    ('Feijão', 'graos', array['kg', 't']),
    ('Gergelim', 'graos', array['kg', 't']),
    ('Girassol', 'graos', array['kg', 't']),
    ('Guaraná', 'graos', array['kg', 't']),
    ('Mamona', 'graos', array['kg', 't']),
    ('Milho', 'graos', array['kg', 't']),
    ('Pimenta-do-reino', 'graos', array['kg', 't']),
    ('Soja', 'graos', array['kg', 't']),
    ('Sorgo granífero', 'graos', array['kg', 't']),
    ('Trigo', 'graos', array['kg', 't']),
    ('Triticale', 'graos', array['kg', 't']),
    ('Urucum', 'graos', array['kg', 't']),
    -- Matéria-prima de agroindústria: vendida a peso.
    ('Algodão herbáceo', 'agroindustria', array['kg', 't']),
    ('Borracha', 'agroindustria', array['kg', 't']),
    ('Cana-de-açúcar', 'agroindustria', array['kg', 't']),
    ('Dendê', 'agroindustria', array['kg', 't']),
    ('Erva-mate', 'agroindustria', array['kg', 't']),
    ('Fumo', 'agroindustria', array['kg', 't']),
    ('Sisal', 'agroindustria', array['kg', 't']),
    -- Hortaliças, raízes e frutas: peso ou caixa.
    ('Abacate', 'hortifruti', array['kg', 'cx', 't']),
    ('Abacaxi', 'hortifruti', array['kg', 'cx', 't']),
    ('Abóbora', 'hortifruti', array['kg', 'cx', 't']),
    ('Açaí', 'hortifruti', array['kg', 'cx', 't']),
    ('Acerola', 'hortifruti', array['kg', 'cx', 't']),
    ('Alface', 'hortifruti', array['kg', 'cx', 't']),
    ('Alho', 'hortifruti', array['kg', 'cx', 't']),
    ('Banana', 'hortifruti', array['kg', 'cx', 't']),
    ('Batata-doce', 'hortifruti', array['kg', 'cx', 't']),
    ('Batata-inglesa', 'hortifruti', array['kg', 'cx', 't']),
    ('Castanha-de-caju', 'hortifruti', array['kg', 'cx', 't']),
    ('Cebola', 'hortifruti', array['kg', 'cx', 't']),
    ('Cenoura', 'hortifruti', array['kg', 'cx', 't']),
    ('Chuchu', 'hortifruti', array['kg', 'cx', 't']),
    ('Coco-da-baía', 'hortifruti', array['kg', 'cx', 't']),
    ('Cupuaçu', 'hortifruti', array['kg', 'cx', 't']),
    ('Figo', 'hortifruti', array['kg', 'cx', 't']),
    ('Goiaba', 'hortifruti', array['kg', 'cx', 't']),
    ('Graviola', 'hortifruti', array['kg', 'cx', 't']),
    ('Inhame', 'hortifruti', array['kg', 'cx', 't']),
    ('Laranja', 'hortifruti', array['kg', 'cx', 't']),
    ('Limão', 'hortifruti', array['kg', 'cx', 't']),
    ('Maçã', 'hortifruti', array['kg', 'cx', 't']),
    ('Mamão', 'hortifruti', array['kg', 'cx', 't']),
    ('Mandioca', 'hortifruti', array['kg', 'cx', 't']),
    ('Manga', 'hortifruti', array['kg', 'cx', 't']),
    ('Maracujá', 'hortifruti', array['kg', 'cx', 't']),
    ('Melancia', 'hortifruti', array['kg', 'cx', 't']),
    ('Melão', 'hortifruti', array['kg', 'cx', 't']),
    ('Milho verde', 'hortifruti', array['kg', 'cx', 't']),
    ('Morango', 'hortifruti', array['kg', 'cx', 't']),
    ('Pêssego', 'hortifruti', array['kg', 'cx', 't']),
    ('Pimentão', 'hortifruti', array['kg', 'cx', 't']),
    ('Repolho', 'hortifruti', array['kg', 'cx', 't']),
    ('Tangerina', 'hortifruti', array['kg', 'cx', 't']),
    ('Tomate', 'hortifruti', array['kg', 'cx', 't']),
    ('Uva', 'hortifruti', array['kg', 'cx', 't'])
  ) as v (nome, segmento, unidades)
 where not exists (
   select 1 from public.catalogo_culturas c
    where c.segmento = v.segmento and lower(c.nome) = lower(v.nome)
 );

commit;
