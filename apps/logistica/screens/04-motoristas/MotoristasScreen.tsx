import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { BadgeCheck, CalendarDays, FileText, IdCard, Truck, UserRound } from 'lucide-react-native';
import {
  AppText, Button, Card, EmptyState, kg, ListRow, Screen, ScreenHeader, SelectField, TextField, VerifiedBadge,
} from '@agrodireto/ui';
import { lerCadastroTransportadora } from '@/lib/transportadora';
import {
  categoriasCnh, dataBr, lerFrota, mascaraData, rotuloTipo, salvarMotorista, vencida,
  type FormMotorista, type Motorista, type Veiculo,
} from '@/lib/frota';
import { rotasLogistica } from '../../routes';

const vazio: FormMotorista = { nome: '', cpf: '', cnhNumero: '', cnhCategoria: '', cnhValidade: '', veiculoId: '' };

const doMotorista = (m: Motorista): FormMotorista => ({
  nome: m.nome, cpf: m.cpf, cnhNumero: m.cnh_numero, cnhCategoria: m.cnh_categoria,
  cnhValidade: dataBr(m.cnh_validade), veiculoId: m.veiculo_id ?? '',
});

const descreverVeiculo = (v: Veiculo) => `${rotuloTipo(v.tipo)} · ${kg(v.capacidade_kg)}`;

async function lerTela() {
  const cadastro = await lerCadastroTransportadora();
  if (!cadastro) return null;
  return { organizacaoId: cadastro.organizacao_id, ...(await lerFrota(cadastro.organizacao_id)) };
}

/**
 * 04 · Motoristas — motoristas com CNH e veículo vinculado.
 * Item: ListRow com avatar, nome, VerifiedBadge da CNH e, abaixo,
 * o veículo vinculado (ListRow com Truck, tipo · capacidade, placa).
 */
export default function MotoristasScreen() {
  const router = useRouter();
  const [organizacaoId, setOrganizacaoId] = useState<string | null>(null);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
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
    setMotoristas(r.motoristas);
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

  function abrir(m: Motorista | null) {
    setEditando(m ? m.id : 'novo');
    setForm(m ? doMotorista(m) : vazio);
    setMensagem('');
  }

  function editar<K extends keyof FormMotorista>(campo: K, valor: FormMotorista[K]) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setMensagem('');
  }

  async function salvar() {
    if (salvando || !organizacaoId) return;
    setSalvando(true);
    try {
      await salvarMotorista(organizacaoId, form, editando === 'novo' ? null : editando);
      setEditando(null);
      await lerTela().then(mostrar, () => setEstado('erroLeitura'));
    } catch (falha) {
      setMensagem(falha instanceof Error && falha.message ? falha.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  if (editando) {
    // '' = sem veículo: permite desvincular.
    const opcoesVeiculo = [
      { value: '', label: 'Sem veículo vinculado' },
      ...veiculos.map((v) => ({ value: v.id, label: `${v.placa} · ${descreverVeiculo(v)}` })),
    ];
    return (
      <Screen
        header={<ScreenHeader title={editando === 'novo' ? 'Novo motorista' : 'Editar motorista'} />}
        footer={
          <>
            <Button label="Salvar motorista" disabled={salvando} loading={salvando} onPress={() => void salvar()} />
            <Button label="Cancelar" variant="secondary" disabled={salvando} onPress={() => setEditando(null)} />
          </>
        }
      >
        {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
        <TextField label="Nome" icon={UserRound} value={form.nome} onChangeText={(t) => editar('nome', t)} autoCapitalize="words" />
        <TextField label="CPF" icon={FileText} placeholder="000.000.000-00" keyboardType="number-pad" value={form.cpf} onChangeText={(t) => editar('cpf', t.replace(/\D/g, ''))} maxLength={11} />
        <TextField label="Número da CNH" icon={IdCard} placeholder="11 dígitos" keyboardType="number-pad" value={form.cnhNumero} onChangeText={(t) => editar('cnhNumero', t.replace(/\D/g, ''))} maxLength={11} />
        <SelectField label="Categoria da CNH" icon={BadgeCheck} options={categoriasCnh} value={form.cnhCategoria || undefined} onChange={(v) => editar('cnhCategoria', v)} />
        <TextField label="Validade da CNH" icon={CalendarDays} placeholder="dd/mm/aaaa" keyboardType="number-pad" value={form.cnhValidade} onChangeText={(t) => editar('cnhValidade', mascaraData(t))} maxLength={10} />
        <SelectField label="Veículo vinculado" icon={Truck} options={opcoesVeiculo} value={form.veiculoId} onChange={(v) => editar('veiculoId', v)} />
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title="Motoristas" />}
      footer={
        <>
          {estado === 'pronto' && <Button label="Vincular motorista" onPress={() => abrir(null)} />}
          {estado === 'semTransportadora' && <Button label="Cadastrar transportadora" onPress={() => router.replace(rotasLogistica.transportadora)} />}
          <Button label="Continuar" variant="secondary" onPress={() => router.push(rotasLogistica.documentos)} />
        </>
      }
    >
      {estado === 'carregando' && <AppText>Carregando motoristas…</AppText>}
      {estado === 'erroLeitura' && <AppText>Não foi possível abrir os motoristas. Saia desta tela e tente novamente.</AppText>}
      {estado === 'semTransportadora' && <AppText>Cadastre a transportadora antes dos motoristas.</AppText>}
      {estado === 'pronto' && motoristas.length === 0 && (
        <EmptyState icon={UserRound} title="Nenhum motorista vinculado" description="Vincule motoristas com CNH válida a um veículo." />
      )}
      {motoristas.map((m) => {
        const veiculo = veiculos.find((v) => v.id === m.veiculo_id);
        return (
          <Card key={m.id}>
            <ListRow
              icon={UserRound}
              title={m.nome}
              below={vencida(m.cnh_validade)
                ? <VerifiedBadge label={`CNH vencida em ${dataBr(m.cnh_validade)}`} tone="warning" />
                : <VerifiedBadge label={`CNH ${m.cnh_categoria} até ${dataBr(m.cnh_validade)}`} />}
              onPress={() => abrir(m)}
            />
            {veiculo
              ? <ListRow icon={Truck} title={descreverVeiculo(veiculo)} subtitle={veiculo.placa} />
              : <ListRow icon={Truck} title="Sem veículo vinculado" />}
          </Card>
        );
      })}
    </Screen>
  );
}
