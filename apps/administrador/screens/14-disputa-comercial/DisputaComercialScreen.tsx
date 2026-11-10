import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Card, EMPTY, KeyValueRow, ListRow, Screen, ScreenHeader, SelectField, type SelectOption, spacing, TextArea } from '@agrodireto/ui';

type Solucao = 'ajuste' | 'devolucao-parcial' | 'devolucao-total' | 'improcedente';

/** Catálogo de soluções (produto) — revisar com o negócio. */
const SOLUCOES: SelectOption<Solucao>[] = [
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'devolucao-parcial', label: 'Devolução parcial' },
  { value: 'devolucao-total', label: 'Devolução total' },
  { value: 'improcedente', label: 'Improcedente' },
];

/** 14 · Disputa comercial — declarado x recebido, evidências, ajuste, solução e motivo. Param: ?id= */
export default function DisputaComercialScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [solucao, setSolucao] = useState<Solucao>();
  const [motivo, setMotivo] = useState('');

  return (
    <Screen
      header={<ScreenHeader title="Disputa comercial" />}
      // Decisão real: Edge Function aplica o ajuste e grava a auditoria (23).
      footer={<Button label="Registrar decisão" disabled={!solucao || motivo.trim().length === 0} onPress={() => router.back()} />}
    >
      <Card>
        <ListRow icon={FileText} title={id ?? `PED ${EMPTY}`} />
        <KeyValueRow label="Declarado" value={EMPTY} />
        <KeyValueRow label="Recebido" value={EMPTY} />
      </Card>

      <View style={styles.block}>
        <AppText variant="label">Evidências (0)</AppText>
        {/* Evidências do Cliente (20) e da Logística; anexar exige expo-image-picker. */}
        <AddMediaButton />
      </View>

      <AppText variant="bodyStrong">Ajuste: R$ {EMPTY}</AppText>

      <SelectField label="Solução" value={solucao} options={SOLUCOES} onChange={setSolucao} placeholder="Selecione" />
      <TextArea label="Motivo (obrigatório)" value={motivo} onChangeText={setMotivo} placeholder="Justifique a decisão" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
});
