import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, FileText, Map as MapIcon, MapPin, Phone, Truck, User } from 'lucide-react-native';
import { AppText, Button, Checkbox, Screen, ScreenHeader, spacing, StatusPill, TextField, type StatusTone } from '@agrodireto/ui';
import {
  enviarCadastroTransportadora, lerCadastroTransportadora, tiposCarga,
  type CadastroTransportadora, type FormTransportadora, type TipoCarga,
} from '@/lib/transportadora';
import { rotasLogistica } from '../../routes';

const vazio: FormTransportadora = {
  razaoSocial: '', cnpj: '', contatoNome: '', contatoTelefone: '', cidade: '', uf: '', ufsAtendidas: '', tiposCarga: [],
};

const situacao: Record<CadastroTransportadora['status'], { label: string; tone: StatusTone }> = {
  em_analise: { label: 'Em análise', tone: 'warning' },
  ajustes_solicitados: { label: 'Ajustes solicitados', tone: 'danger' },
  aprovada: { label: 'Aprovada', tone: 'success' },
};

const doCadastro = (c: CadastroTransportadora): FormTransportadora => ({
  razaoSocial: c.razao_social, cnpj: c.cnpj, contatoNome: c.contato_nome, contatoTelefone: c.contato_telefone,
  cidade: c.cidade, uf: c.uf, ufsAtendidas: c.ufs_atendidas.join(', '), tiposCarga: c.tipos_carga,
});

/** 02 · Transportadora — dados da empresa, enviados para análise da operação. */
export default function TransportadoraScreen() {
  const router = useRouter();
  const [cadastro, setCadastro] = useState<CadastroTransportadora | null>(null);
  const [form, setForm] = useState(vazio);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erroLeitura'>('carregando');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  function mostrar(atual: CadastroTransportadora | null) {
    setCadastro(atual);
    if (atual) setForm(doCadastro(atual));
    setEstado('pronto');
  }

  useEffect(() => {
    let ativo = true;
    lerCadastroTransportadora().then(
      (atual) => { if (ativo) mostrar(atual); },
      () => { if (ativo) setEstado('erroLeitura'); },
    );
    return () => { ativo = false; };
  }, []);

  function editar<K extends keyof FormTransportadora>(campo: K, valor: FormTransportadora[K]) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setMensagem('');
  }

  function alternarCarga(tipo: TipoCarga, marcado: boolean) {
    editar('tiposCarga', marcado ? [...form.tiposCarga, tipo] : form.tiposCarga.filter((t) => t !== tipo));
  }

  async function salvar() {
    if (salvando) return;
    setSalvando(true);
    setMensagem('');
    try {
      await enviarCadastroTransportadora(form, cadastro);
      const primeiroEnvio = !cadastro;
      await lerCadastroTransportadora().then(mostrar, () => setEstado('erroLeitura'));
      if (primeiroEnvio) router.push(rotasLogistica.veiculos);
    } catch (falha) {
      setMensagem(falha instanceof Error && falha.message ? falha.message : 'Não foi possível enviar o cadastro. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  // Sem cadastro, preenche; com ajustes pedidos, o titular corrige; em análise ou aprovado, só consulta.
  const corrigir = cadastro?.status === 'ajustes_solicitados' && cadastro.papel === 'titular';
  const editavel = estado === 'pronto' && !salvando && (!cadastro || corrigir);
  const podeEnviar = estado === 'pronto' && (!cadastro || corrigir);

  return (
    <Screen
      header={<ScreenHeader title="Transportadora" subtitle="Informe os dados da sua transportadora." />}
      footer={podeEnviar ? (
        <Button
          label={cadastro ? 'Reenviar para análise' : 'Salvar cadastro'}
          disabled={salvando}
          loading={salvando}
          onPress={() => void salvar()}
        />
      ) : undefined}
    >
      {estado === 'carregando' && <AppText>Carregando cadastro…</AppText>}
      {estado === 'erroLeitura' && <AppText>Não foi possível abrir o cadastro. Saia desta tela e tente novamente.</AppText>}
      {cadastro && (
        <View style={styles.status}>
          <StatusPill dot {...situacao[cadastro.status]} />
          {cadastro.status === 'ajustes_solicitados' && !!cadastro.motivo_ajuste && (
            <AppText variant="body">{cadastro.motivo_ajuste}</AppText>
          )}
          {cadastro.status === 'ajustes_solicitados' && cadastro.papel !== 'titular' && (
            <AppText variant="body" color="textSecondary">Só o titular da transportadora pode corrigir e reenviar o cadastro.</AppText>
          )}
        </View>
      )}
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}

      <TextField label="Razão social" icon={Building2} placeholder="Nome da empresa" value={form.razaoSocial} editable={editavel} onChangeText={(t) => editar('razaoSocial', t)} autoCapitalize="words" />
      <TextField label="CNPJ" icon={FileText} placeholder="00.000.000/0000-00" value={form.cnpj} editable={editavel} onChangeText={(t) => editar('cnpj', t)} autoCapitalize="characters" maxLength={18} />
      <TextField label="Contato" icon={Phone} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={form.contatoTelefone} editable={editavel} onChangeText={(t) => editar('contatoTelefone', t)} />
      <TextField label="Nome do contato" icon={User} placeholder="Quem responde pela transportadora" value={form.contatoNome} editable={editavel} onChangeText={(t) => editar('contatoNome', t)} autoCapitalize="words" />
      <View style={styles.linha}>
        <View style={styles.cidade}>
          <TextField label="Cidade" icon={MapPin} value={form.cidade} editable={editavel} onChangeText={(t) => editar('cidade', t)} autoCapitalize="words" />
        </View>
        <View style={styles.uf}>
          <TextField label="UF" value={form.uf} editable={editavel} onChangeText={(t) => editar('uf', t.toUpperCase())} maxLength={2} autoCapitalize="characters" />
        </View>
      </View>
      <TextField label="Estados atendidos" icon={MapIcon} placeholder="Ex.: SP, MG, PR" value={form.ufsAtendidas} editable={editavel} onChangeText={(t) => editar('ufsAtendidas', t.toUpperCase())} autoCapitalize="characters" />

      {editavel ? (
        <View style={styles.cargas}>
          <AppText variant="label">Tipos de carga</AppText>
          {tiposCarga.map(({ value, label }) => (
            <Checkbox key={value} label={label} checked={form.tiposCarga.includes(value)} onChange={(marcado) => alternarCarga(value, marcado)} />
          ))}
        </View>
      ) : (
        <TextField
          label="Tipos de carga"
          icon={Truck}
          editable={false}
          value={tiposCarga.filter((t) => form.tiposCarga.includes(t.value)).map((t) => t.label).join(', ')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { gap: spacing.xs, alignItems: 'flex-start' },
  linha: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  cidade: { flex: 2 },
  uf: { flex: 1 },
  cargas: { gap: spacing.sm },
});
