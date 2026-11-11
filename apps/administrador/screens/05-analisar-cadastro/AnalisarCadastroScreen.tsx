import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, Card, ListRow, Screen, ScreenHeader, TextField } from '@agrodireto/ui';
import type { CadastroComprador, PropriedadeEnviada } from '@agrodireto/dominio';
import { lerComprador, revisarComprador } from '@/lib/compradores';
import { lerPropriedade, revisarPropriedade } from '@/lib/propriedades';
import { rotasAdministrador } from '@/routes';

type Cadastro =
  | { tipo: 'propriedade'; id: string; dados: PropriedadeEnviada }
  | { tipo: 'comprador'; id: string; dados: CadastroComprador };

export default function AnalisarCadastroScreen() {
  const router = useRouter();
  const { id, tipo } = useLocalSearchParams<{ id?: string; tipo?: string }>();
  const comprador = tipo === 'comprador';
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);
  const [mensagem, setMensagem] = useState('Carregando…');
  const [ocupado, setOcupado] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    let ativo = true;
    if (!id) return;
    const leitura: Promise<Cadastro | null> = comprador
      ? lerComprador(id).then((dados) => dados && { tipo: 'comprador', id: dados.organizacao_id, dados })
      : lerPropriedade(id).then((dados) => dados && { tipo: 'propriedade', id: dados.id, dados });
    void leitura.then(
      (dados) => { if (ativo) { setCadastro(dados); setMensagem(dados ? '' : 'Cadastro não encontrado.'); } },
      () => { if (ativo) setMensagem('Não foi possível consultar o cadastro. Tente novamente.'); },
    );
    return () => { ativo = false; };
  }, [id, comprador]);

  async function revisar(motivoAjuste: string | null) {
    if (!cadastro || cadastro.id !== id || ocupado || cadastro.dados.status !== 'em_analise') return;
    setOcupado(true);
    setMensagem('');
    try {
      if (cadastro.tipo === 'comprador') await revisarComprador(cadastro.dados, motivoAjuste);
      else await revisarPropriedade(cadastro.dados, motivoAjuste);
      router.dismissTo(rotasAdministrador.cadastros);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível salvar a revisão. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  const nome = comprador ? 'empresa' : 'propriedade';
  return (
    <Screen header={<ScreenHeader title={comprador ? 'Analisar empresa compradora' : 'Analisar propriedade'} />}>
      {!id && <AppText>Selecione um cadastro na lista de cadastros.</AppText>}
      {!!mensagem && !!id && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {cadastro && cadastro.id === id && (
        <>
          {cadastro.tipo === 'propriedade' ? (
            <>
              <Card>
                <ListRow title={cadastro.dados.nome} subtitle={`${cadastro.dados.cidade} · ${cadastro.dados.uf}`} />
                <ListRow title="Área produtiva" subtitle={`${cadastro.dados.area} ha`} />
                <ListRow title="Culturas" subtitle={cadastro.dados.culturas} />
              </Card>
              <AppText>A aprovação desta etapa abrange os dados da propriedade. Documentos e dados bancários aguardam validação nas próximas etapas.</AppText>
            </>
          ) : (
            <>
              <Card>
                <ListRow title={cadastro.dados.razao_social} subtitle={`CNPJ ${cadastro.dados.cnpj}`} />
                <ListRow title="Contato de compras" subtitle={`${cadastro.dados.contato_nome} · ${cadastro.dados.contato_telefone}`} />
                <ListRow title="Entrega" subtitle={`${cadastro.dados.endereco_entrega} · ${cadastro.dados.cidade} · ${cadastro.dados.uf}`} />
              </Card>
              <AppText>Confira o CNPJ na Receita Federal antes de aprovar. Aprovada, a empresa passa a ver as ofertas do catálogo.</AppText>
            </>
          )}
          {cadastro.dados.status === 'em_analise' && (
            <>
              <Button label={`Aprovar ${nome}`} disabled={ocupado} onPress={() => void revisar(null)} />
              <TextField label="Motivo do ajuste" value={motivo} onChangeText={setMotivo} editable={!ocupado} maxLength={500} />
              <Button label="Solicitar ajustes" disabled={ocupado || !motivo.trim()} onPress={() => void revisar(motivo.trim())} />
            </>
          )}
          {cadastro.dados.status === 'aprovada' && <AppText>Cadastro aprovado.</AppText>}
          {cadastro.dados.status === 'ajustes_solicitados' && <AppText>Ajustes solicitados. {cadastro.dados.motivo_ajuste}</AppText>}
        </>
      )}
    </Screen>
  );
}
