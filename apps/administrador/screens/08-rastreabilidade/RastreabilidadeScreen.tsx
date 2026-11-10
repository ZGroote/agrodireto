import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, Card, EMPTY, ListRow, QRPlaceholder, Screen, ScreenHeader, SelectField, type SelectOption, spacing, Timeline } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

type Motivo = 'qualidade' | 'documentacao' | 'origem' | 'sanitario' | 'outro';

/** Catálogo de motivos de bloqueio (produto) — revisar com o negócio. */
const MOTIVOS: SelectOption<Motivo>[] = [
  { value: 'qualidade', label: 'Divergência de qualidade' },
  { value: 'documentacao', label: 'Documentação irregular' },
  { value: 'origem', label: 'Origem não comprovada' },
  { value: 'sanitario', label: 'Risco sanitário' },
  { value: 'outro', label: 'Outro' },
];

/** 08 · Rastreabilidade — origem, coleta, recebimento, pedidos afetados e bloqueio do lote. Param: ?id= */
export default function RastreabilidadeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [motivo, setMotivo] = useState<Motivo>();

  return (
    <Screen
      header={<ScreenHeader title="Rastreabilidade" />}
      // Bloqueio real: Edge Function bloqueia o lote, avisa os pedidos afetados e grava a auditoria.
      footer={<Button label="Bloquear lote" variant="danger" disabled={!motivo} onPress={() => router.back()} />}
    >
      <View style={styles.head}>
        <View style={styles.flex}>
          <AppText variant="title">{id ?? EMPTY}</AppText>
          <AppText variant="bodyStrong">{EMPTY}</AppText>
        </View>
        {/* QR real exige lib de QR (aprovação pendente). */}
        <QRPlaceholder size={64} />
      </View>

      <Timeline
        steps={[
          { title: `Origem: ${EMPTY}`, status: 'todo' },
          { title: `Coleta: ${EMPTY}`, status: 'todo' },
          { title: `Recebimento: ${EMPTY}`, status: 'todo' },
        ]}
      />

      <Card>
        <ListRow title="Nenhum pedido afetado" onPress={() => router.push(rotasAdministrador.pedidoCarga())} />
      </Card>

      <SelectField label="Motivo do bloqueio (obrigatório)" value={motivo} options={MOTIVOS} onChange={setMotivo} placeholder="Selecione" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
});
