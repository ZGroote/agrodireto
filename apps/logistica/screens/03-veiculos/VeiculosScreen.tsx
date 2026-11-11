import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { CalendarDays, FileText, Hash, Truck, Weight } from 'lucide-react-native';
import {
  AppText, Button, Card, EmptyState, kg, ListRow, mascaraMilhar, Screen, ScreenHeader, SelectField, TextField, VerifiedBadge,
} from '@agrodireto/ui';
import { lerCadastroTransportadora } from '@/lib/transportadora';
import {
  dataBr, lerFrota, mascaraData, rotuloTipo, salvarVeiculo, tiposVeiculo, vencida, type FormVeiculo, type Veiculo,
} from '@/lib/frota';
import { rotasLogistica } from '../../routes';

const vazio: FormVeiculo = { placa: '', renavam: '', tipo: '', capacidade: '', seguroValidade: '' };

const doVeiculo = (v: Veiculo): FormVeiculo => ({
  placa: v.placa, renavam: v.renavam, tipo: v.tipo, capacidade: mascaraMilhar(String(v.capacidade_kg)), seguroValidade: dataBr(v.seguro_validade),
});

async function lerTela() {
  const cadastro = await lerCadastroTransportadora();
  if (!cadastro) return null;
  return { organizacaoId: cadastro.organizacao_id, ...(await lerFrota(cadastro.organizacao_id)) };
}

/**
 * 03 · Veículos — frota da transportadora (tipo, capacidade, placa, seguro).
 * Item: ListRow com ícone Truck, "Baú · 1.000 kg", placa e VerifiedBadge do seguro.
 */
export default function VeiculosScreen() {
  const router = useRouter();
  const [organizacaoId, setOrganizacaoId] = useState<string | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'semTransportadora' | 'erroLeitura'>('carregando');
  // null: lista; 'novo' ou id: formulário.
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  function mostrar(r: Awaited<ReturnType<typeof lerTela>>) {
    if (!r) return setEstado('semTransportadora');
    setOrganizacaoId(r.organizacaoId);
    setVeiculos(r.veiculos);
    setEstado('pronto');
  }

  useEffect(() => {
    let ativo = true;
    lerTela().then(
      (r) => { if (ativo) mostrar(r); },
      () => { if (ativo) setEstado('erroLeitura'); },
    );
    return () => { ativo = false; };
  }, []);

  function abrir(v: Veiculo | null) {
    setEditando(v ? v.id : 'novo');
    setForm(v ? doVeiculo(v) : vazio);
    setMensagem('');
  }

  function editar<K extends keyof FormVeiculo>(campo: K, valor: FormVeiculo[K]) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setMensagem('');
  }

  async function salvar() {
    if (salvando || !organizacaoId) return;
    setSalvando(true);
    try {
      await salvarVeiculo(organizacaoId, form, editando === 'novo' ? null : editando);
      setEditando(null);
      await lerTela().then(mostrar, () => setEstado('erroLeitura'));
    } catch (falha) {
      setMensagem(falha instanceof Error && falha.message ? falha.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  if (editando) {
    return (
      <Screen
        header={<ScreenHeader title={editando === 'novo' ? 'Novo veículo' : 'Editar veículo'} />}
        footer={
          <>
            <Button label="Salvar veículo" disabled={salvando} loading={salvando} onPress={() => void salvar()} />
            <Button label="Cancelar" variant="secondary" disabled={salvando} onPress={() => setEditando(null)} />
          </>
        }
      >
        {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
        <TextField label="Placa" icon={Hash} placeholder="ABC1D23" value={form.placa} onChangeText={(t) => editar('placa', t.toUpperCase())} autoCapitalize="characters" maxLength={8} />
        <TextField label="RENAVAM" icon={FileText} placeholder="11 dígitos" keyboardType="number-pad" value={form.renavam} onChangeText={(t) => editar('renavam', t.replace(/\D/g, ''))} maxLength={11} />
        <SelectField label="Tipo" icon={Truck} options={tiposVeiculo} value={form.tipo || undefined} onChange={(v) => editar('tipo', v)} />
        <TextField label="Capacidade (kg)" icon={Weight} placeholder="1.000" keyboardType="number-pad" value={form.capacidade} onChangeText={(t) => editar('capacidade', mascaraMilhar(t))} />
        <TextField label="Validade do seguro" icon={CalendarDays} placeholder="dd/mm/aaaa" keyboardType="number-pad" value={form.seguroValidade} onChangeText={(t) => editar('seguroValidade', mascaraData(t))} maxLength={10} />
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title="Veículos" />}
      footer={
        <>
          {estado === 'pronto' && <Button label="Adicionar veículo" onPress={() => abrir(null)} />}
          {estado === 'semTransportadora' && <Button label="Cadastrar transportadora" onPress={() => router.replace(rotasLogistica.transportadora)} />}
          {/* "Continuar" não está no mockup: liga o cadastro 02 → 03 → 04 → 05. */}
          <Button label="Continuar" variant="secondary" onPress={() => router.push(rotasLogistica.motoristas)} />
        </>
      }
    >
      {estado === 'carregando' && <AppText>Carregando veículos…</AppText>}
      {estado === 'erroLeitura' && <AppText>Não foi possível abrir a frota. Saia desta tela e tente novamente.</AppText>}
      {estado === 'semTransportadora' && <AppText>Cadastre a transportadora antes dos veículos.</AppText>}
      {estado === 'pronto' && veiculos.length === 0 && (
        <EmptyState icon={Truck} title="Nenhum veículo cadastrado" description="Cadastre os veículos que vão operar as cargas." />
      )}
      {veiculos.map((v) => (
        <Card key={v.id}>
          <ListRow
            icon={Truck}
            title={`${rotuloTipo(v.tipo)} · ${kg(v.capacidade_kg)}`}
            subtitle={v.placa}
            below={vencida(v.seguro_validade)
              ? <VerifiedBadge label={`Seguro vencido em ${dataBr(v.seguro_validade)}`} tone="warning" />
              : <VerifiedBadge label={`Seguro até ${dataBr(v.seguro_validade)}`} />}
            onPress={() => abrir(v)}
          />
        </Card>
      ))}
    </Screen>
  );
}
