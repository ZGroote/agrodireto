import { createClient } from '@supabase/supabase-js';

const nomeBucket = 'midias';

export async function prepararStorage(url: string, chave: string): Promise<'criado' | 'existente'> {
  const { storage } = createClient(url, chave, { auth: { persistSession: false } });
  const listar = async () => {
    const { data, error } = await storage.listBuckets();
    if (error) throw new Error(`Não foi possível listar os buckets. ${error.message}`);
    return data.find(({ id }) => id === nomeBucket);
  };
  const conferirPrivacidade = (bucket: { public: boolean }) => {
    if (bucket.public) throw new Error('O bucket midias já existe como público. Revise a configuração antes de usar.');
  };

  const existente = await listar();
  if (existente) {
    conferirPrivacidade(existente);
    return 'existente';
  }

  const criado = await storage.createBucket(nomeBucket, { public: false });
  const confirmado = await listar();
  if (!confirmado) throw new Error(criado.error?.message ?? 'O Supabase não confirmou o bucket midias.');
  conferirPrivacidade(confirmado);
  return criado.error ? 'existente' : 'criado';
}

if (import.meta.main) {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    if (!url || !chave) throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do worker.');
    const resultado = await prepararStorage(url, chave);
    console.log(resultado === 'criado' ? 'Bucket privado midias criado.' : 'Bucket privado midias confirmado.');
  } catch (erro) {
    console.error(erro instanceof Error ? erro.message : 'Falha ao preparar o Storage.');
    process.exitCode = 1;
  }
}
