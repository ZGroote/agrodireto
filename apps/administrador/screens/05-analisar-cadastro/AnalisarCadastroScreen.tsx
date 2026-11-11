import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, Card, ListRow, Screen, ScreenHeader, TextField } from '@agrodireto/ui';
import type { PropriedadeEnviada } from '@agrodireto/dominio';
import { lerComprador, revisarComprador, type CompradorEmAnalise } from '@/lib/compradores';
import { lerTransportadora, revisarTransportadora, nomesTiposCarga, type CadastroTransportadora } from '@/lib/transportadoras';
import { lerPropriedade, revisarPropriedade } from '@/lib/propriedades';
import { usePode } from '@/components/PapelEquipe';
import { rotasAdministrador } from '@/routes';

type Cadastro =
  | { tipo: 'propriedade'; id: string; dados: PropriedadeEnviada }
  | { tipo: 'comprador'; id: string; dados: CompradorEmAnalise }
  | { tipo: 'transportadora'; id: string; dados: CadastroTransportadora };

export default function AnalisarCadastroScreen() {
  const { id, tipo } = useLocalSearchParams<{ id?: string; tipo?: string }>();
  return <AnaliseCadastro key={`${tipo ?? 'propriedade'}:${id}`} id={id} tipo={tipo} />;
}

function AnaliseCadastro({ id, tipo }: { id?: string; tipo?: string }) {
  const router = useRouter();
  const podeRevisar = usePode()('escrever_cadastros');
  const tipoCadastro = tipo ?? 'propriedade';
  const comprador = tipoCadastro === 'comprador';
  const transportadora = tipoCadastro === 'transportadora';
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);
  const [mensagem, setMensagem] = useState('Carregando…');
  const [ocupado, setOcupado] = useState(false);
  const [revisaoSalva, setRevisaoSalva] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    let ativo = true;
    if (!id) return;
    if (!['propriedade', 'comprador', 'transportadora'].includes(tipoCadastro)) {
      return;
    }
    const leitura: Promise<Cadastro | null> = comprador
      ? lerComprador(id).then((dados) => dados && { tipo: 'comprador', id: dados.organizacao_id, dados })
      : transportadora
        ? lerTransportadora(id).then((dados) => dados && { tipo: 'transportadora', id: dados.organizacao_id, dados })
        : lerPropriedade(id).then((dados) => dados && { tipo: 'propriedade', id: dados.id, dados });
    void leitura.then(
      (dados) => { if (ativo) { setCadastro(dados); setMensagem(dados ? '' : 'Cadastro não encontrado.'); } },
      () => { if (ativo) setMensagem('Não foi possível consultar o cadastro. Tente novamente.'); },
    );
    return () => { ativo = false; };
  }, [id, comprador, transportadora, tipoCadastro]);

  async function revisar(motivoAjuste: string | null) {
    if (!cadastro || cadastro.id !== id || cadastro.tipo !== tipoCadastro || ocupado || revisaoSalva || cadastro.dados.status !== 'em_analise') return;
    setOcupado(true);
    setMensagem('');
    try {
      if (cadastro.tipo === 'comprador') await revisarComprador(cadastro.dados, motivoAjuste);
      else if (cadastro.tipo === 'transportadora') await revisarTransportadora(cadastro.dados, motivoAjuste);
      else await revisarPropriedade(cadastro.dados, motivoAjuste);
      setRevisaoSalva(true);
      if (cadastro.tipo === 'comprador') {
        const dados = await lerComprador(cadastro.id);
        if (!dados) throw new Error('Revisão salva. Reabra o cadastro para consultar a decisão.');
        setCadastro({ ...cadastro, dados });
      } else if (cadastro.tipo === 'transportadora') {
        const dados = await lerTransportadora(cadastro.id);
        if (!dados) throw new Error('Revisão salva. Reabra o cadastro para consultar a decisão.');
        setCadastro({ ...cadastro, dados });
      } else router.dismissTo(rotasAdministrador.cadastros);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível salvar a revisão. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  const nome = comprador ? 'empresa' : transportadora ? 'transportadora' : 'propriedade';
  const decisao = cadastro && cadastro.tipo !== 'propriedade' && cadastro.dados.status !== 'em_analise'
    ? { autor: cadastro.dados.status === 'aprovada' ? cadastro.dados.aprovada_por : cadastro.dados.ajuste_solicitado_por,
      data: cadastro.dados.status === 'aprovada' ? cadastro.dados.aprovada_em : cadastro.dados.ajuste_solicitado_em } : null;
  return (
    <Screen header={<ScreenHeader title={comprador ? 'Analisar empresa compradora' : transportadora ? 'Analisar transportadora' : 'Analisar propriedade'} />}>
      {!id && <AppText>Selecione um cadastro na lista de cadastros.</AppText>}
      {!['propriedade', 'comprador', 'transportadora'].includes(tipoCadastro)
        ? <AppText>Tipo de cadastro inválido. Volte à lista.</AppText>
        : !!mensagem && !!id && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {cadastro && cadastro.id === id && cadastro.tipo === tipoCadastro && (
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
          ) : cadastro.tipo === 'comprador' ? (
            <>
              <Card>
                <ListRow title={cadastro.dados.razao_social} subtitle={`CNPJ ${cadastro.dados.cnpj}`} />
                <ListRow title="Contato de compras" subtitle={`${cadastro.dados.contato_nome} · ${cadastro.dados.contato_telefone}`} />
                <ListRow title="Entrega" subtitle={`${cadastro.dados.endereco_entrega} · ${cadastro.dados.cidade} · ${cadastro.dados.uf}`} />
              </Card>
              <AppText>Confira o CNPJ na Receita Federal antes de aprovar. Aprovada, a empresa passa a ver as ofertas do catálogo.</AppText>
            </>
          ) : (
            <Card>
              <ListRow title={cadastro.dados.razao_social} subtitle={`CNPJ ${cadastro.dados.cnpj}`} />
              <ListRow title="Contato" subtitle={`${cadastro.dados.contato_nome} · ${cadastro.dados.contato_telefone}`} />
              <ListRow title="Sede" subtitle={`${cadastro.dados.cidade} · ${cadastro.dados.uf}`} />
              <ListRow title="Estados atendidos" subtitle={cadastro.dados.ufs_atendidas.join(', ')} />
              <ListRow title="Tipos de carga" subtitle={cadastro.dados.tipos_carga.map((carga) => nomesTiposCarga[carga]).join(', ')} />
            </Card>
          )}
          {revisaoSalva && cadastro.dados.status === 'em_analise' && (
            <Card>
              <AppText>Revisão salva. Reabra o cadastro para consultar a decisão atualizada.</AppText>
              <Button label="Voltar aos cadastros" onPress={() => router.dismissTo(rotasAdministrador.cadastros)} />
            </Card>
          )}
          {!revisaoSalva && cadastro.dados.status === 'em_analise' && !podeRevisar && (
            <AppText color="textSecondary">Seu papel permite consultar, mas não aprovar ou pedir ajustes.</AppText>
          )}
          {!revisaoSalva && cadastro.dados.status === 'em_analise' && podeRevisar && (
            <>
              <Button label={`Aprovar ${nome}`} disabled={ocupado} onPress={() => void revisar(null)} />
              <TextField label="Motivo do ajuste" value={motivo} onChangeText={setMotivo} editable={!ocupado} maxLength={500} />
              <Button label="Solicitar ajustes" disabled={ocupado || !motivo.trim()} onPress={() => void revisar(motivo.trim())} />
            </>
          )}
          {cadastro.dados.status === 'aprovada' && <AppText>Cadastro aprovado.</AppText>}
          {cadastro.dados.status === 'ajustes_solicitados' && <AppText>Ajustes solicitados. {cadastro.dados.motivo_ajuste}</AppText>}
          {decisao && (
            <Card>
              <ListRow title="Autor da última decisão (ID)" subtitle={decisao.autor ?? 'Autor indisponível'} />
              <ListRow title="Data da última decisão" subtitle={decisao.data ? new Date(decisao.data).toLocaleString('pt-BR') : 'Data indisponível'} />
              <Button label="Voltar aos cadastros" onPress={() => router.dismissTo(rotasAdministrador.cadastros)} />
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}
