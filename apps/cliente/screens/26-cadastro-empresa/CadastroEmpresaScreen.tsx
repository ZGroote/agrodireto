import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import type { CadastroComprador } from '@agrodireto/dominio';
import { AppText, Button, Card, ListRow, Screen, ScreenHeader, TextField } from '@agrodireto/ui';
import { mensagemEscolherEmpresa } from '@/lib/organizacoes';
import { enviarCadastroComprador, lerCadastroComprador, type DadosEmpresa } from '@/lib/cadastroComprador';
import { rotasCliente } from '@/routes';

const vazio: DadosEmpresa = {
  razao_social: '', cnpj: '', contato_nome: '', contato_telefone: '', cidade: '', uf: '', endereco_entrega: '',
};

const situacao = {
  em_analise: 'Cadastro em análise pela equipe AgroDireto. As ofertas ficam disponíveis após a aprovação.',
  ajustes_solicitados: 'A equipe pediu ajustes. Corrija os dados e envie de novo.',
  aprovada: 'Empresa aprovada. Você já pode consultar as ofertas.',
} as const;

/** 26 · Cadastro da empresa compradora: envio, situação da análise e ajustes. */
export default function CadastroEmpresaScreen() {
  const router = useRouter();
  const [atual, setAtual] = useState<CadastroComprador | null>(null);
  const [dados, setDados] = useState<DadosEmpresa>(vazio);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro' | 'escolher'>('carregando');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(() => {
    let ativo = true;
    setEstado('carregando');
    void lerCadastroComprador().then(
      (cadastro) => {
        if (!ativo) return;
        setAtual(cadastro);
        if (cadastro) {
          const { razao_social, cnpj, contato_nome, contato_telefone, cidade, uf, endereco_entrega } = cadastro;
          setDados({ razao_social, cnpj, contato_nome, contato_telefone, cidade, uf, endereco_entrega });
        }
        setEstado('pronto');
      },
      (erro) => { if (ativo) setEstado(erro instanceof Error && erro.message === mensagemEscolherEmpresa ? 'escolher' : 'erro'); },
    );
    return () => { ativo = false; };
  }, []);
  useFocusEffect(carregar);

  const editavel = !atual || atual.status === 'ajustes_solicitados';
  const campo = (chave: keyof DadosEmpresa) => (valor: string) => setDados((d) => ({ ...d, [chave]: valor }));

  async function enviar() {
    if (ocupado || !editavel) return;
    setOcupado(true);
    setMensagem('');
    try {
      await enviarCadastroComprador(dados, atual ?? undefined);
      carregar();
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível enviar o cadastro. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Sua empresa" subtitle="Dados para comprar no AgroDireto" />}>
      {estado === 'carregando' && <AppText>Carregando…</AppText>}
      {estado === 'erro' && <AppText>Não foi possível consultar o cadastro. Confira sua conexão e tente novamente.</AppText>}
      {estado === 'escolher' && (
        <>
          <AppText>{mensagemEscolherEmpresa}</AppText>
          <Button label="Escolher empresa" onPress={() => router.push(rotasCliente.empresas)} />
        </>
      )}
      {estado === 'pronto' && (
        <>
          {atual && (
            <Card>
              <ListRow title={atual.razao_social} subtitle={situacao[atual.status]} />
              {atual.status === 'ajustes_solicitados' && !!atual.motivo_ajuste && <ListRow title="Motivo" subtitle={atual.motivo_ajuste} />}
            </Card>
          )}
          {atual?.status === 'aprovada' && <Button label="Ver ofertas" onPress={() => router.replace(rotasCliente.ofertas)} />}
          {editavel && (
            <>
              <TextField label="Razão social" value={dados.razao_social} onChangeText={campo('razao_social')} maxLength={160} />
              <TextField label="CNPJ" value={dados.cnpj} onChangeText={campo('cnpj')} autoCapitalize="characters" maxLength={18} />
              <TextField label="Nome do contato de compras" value={dados.contato_nome} onChangeText={campo('contato_nome')} maxLength={120} />
              <TextField label="Telefone com DDD" keyboardType="phone-pad" value={dados.contato_telefone} onChangeText={campo('contato_telefone')} maxLength={15} />
              <TextField label="Cidade" value={dados.cidade} onChangeText={campo('cidade')} maxLength={100} />
              <TextField label="UF" autoCapitalize="characters" value={dados.uf} onChangeText={campo('uf')} maxLength={2} />
              <TextField label="Endereço de entrega" value={dados.endereco_entrega} onChangeText={campo('endereco_entrega')} maxLength={300} />
              {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
              <Button label={atual ? 'Reenviar para análise' : 'Enviar para análise'} loading={ocupado} disabled={ocupado} onPress={() => void enviar()} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}
