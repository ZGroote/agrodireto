import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Thermometer } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Card, Checkbox, EMPTY, InlineFieldRow, KeyValueRow, MediaThumb, Screen, ScreenHeader, SelectField, type SelectOption, sizes, spacing, TextField } from '@agrodireto/ui';

type Resultado = 'aprovado' | 'ressalvas' | 'reprovado';

const RESULTADOS: SelectOption<Resultado>[] = [
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'ressalvas', label: 'Aprovado com ressalvas' },
  { value: 'reprovado', label: 'Reprovado' },
];

/** 10 · Inspecionar lote — checklist, temperatura, evidências e resultado. Param: ?id= */
export default function InspecionarLoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [embalagem, setEmbalagem] = useState(false);
  const [qualidade, setQualidade] = useState(false);
  const [temperatura, setTemperatura] = useState('');
  const [resultado, setResultado] = useState<Resultado>();

  return (
    <Screen
      header={<ScreenHeader title="Inspecionar lote" />}
      // Conclusão real: grava a inspeção (visível no lote do Agricultor e na oferta do Cliente).
      footer={<Button label="Concluir inspeção" disabled={!resultado} onPress={() => router.back()} />}
    >
      <Card>
        <View style={styles.product}>
          <MediaThumb size={sizes.thumb} />
          <View style={styles.flex}>
            <AppText variant="heading">{id ?? EMPTY}</AppText>
            <AppText variant="body">{EMPTY}</AppText>
          </View>
        </View>
      </Card>

      <KeyValueRow label="Quantidade a inspecionar" value={EMPTY} />

      <View style={styles.block}>
        <Checkbox checked={embalagem} onChange={setEmbalagem} label="Embalagem conforme" />
        <Checkbox checked={qualidade} onChange={setQualidade} label="Qualidade conforme" />
      </View>

      <InlineFieldRow icon={Thermometer} label="Temperatura">
        <TextField placeholder="Não medida" suffix="°C" keyboardType="numeric" value={temperatura} onChangeText={setTemperatura} />
      </InlineFieldRow>

      <View style={styles.block}>
        <AppText variant="label">Evidências (0)</AppText>
        {/* Foto exige expo-image-picker (aprovação pendente). */}
        <AddMediaButton />
      </View>

      <SelectField label="Resultado da inspeção" value={resultado} options={RESULTADOS} onChange={setResultado} placeholder="Selecione" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  block: { gap: spacing.sm },
});
