import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BadgeCheck, CalendarDays, MapPinned, Package, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Divider, InlineFieldRow, MapPlaceholder, Screen, ScreenHeader, SelectField, type SelectOption, TextField, Toggle } from '@agrodireto/ui';

type Distancia = '50' | '100' | '200' | 'qualquer';

const DISTANCIAS: SelectOption<Distancia>[] = [
  { value: '50', label: 'Até 50 km' },
  { value: '100', label: 'Até 100 km' },
  { value: '200', label: 'Até 200 km' },
  { value: 'qualquer', label: 'Qualquer distância' },
];

/** 04 · Mapa e filtros — região no mapa e filtros da busca de ofertas. */
export default function MapaFiltrosScreen() {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState('');
  const [padrao, setPadrao] = useState<string>();
  const [janela, setJanela] = useState('');
  const [distancia, setDistancia] = useState<Distancia>();
  const [certificacao, setCertificacao] = useState(false);
  // Padrões vêm da tabela de qualidade por produto (Admin · Catálogo).
  const padroes: SelectOption[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Mapa e filtros" />}
      // Na fase de dados, os filtros vão para a consulta da tab Ofertas.
      footer={<Button label="Aplicar filtros" onPress={() => router.back()} />}
    >
      {/* Mapa real exige react-native-maps (aprovação pendente). */}
      <MapPlaceholder height={130} />

      <Card>
        <InlineFieldRow icon={Package} label="Quantidade">
          <TextField placeholder="0" suffix="kg" keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />
        </InlineFieldRow>
        <Divider />
        <InlineFieldRow icon={ShieldCheck} label="Padrão">
          <SelectField value={padrao} options={padroes} onChange={setPadrao} placeholder="Todos" emptyMessage="Nenhum padrão cadastrado." />
        </InlineFieldRow>
        <Divider />
        <InlineFieldRow icon={CalendarDays} label="Janela de entrega">
          <TextField placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} value={janela} onChangeText={setJanela} />
        </InlineFieldRow>
        <Divider />
        <InlineFieldRow icon={MapPinned} label="Distância máxima">
          <SelectField value={distancia} options={DISTANCIAS} onChange={setDistancia} placeholder="Qualquer" />
        </InlineFieldRow>
        <Divider />
        <InlineFieldRow icon={BadgeCheck} label="Com certificação">
          <Toggle value={certificacao} onChange={setCertificacao} />
        </InlineFieldRow>
      </Card>
    </Screen>
  );
}
