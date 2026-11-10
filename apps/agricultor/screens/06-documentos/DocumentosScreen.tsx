import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, CircleCheck, FileCheck, IdCard, TriangleAlert } from 'lucide-react-native';
import { AppText, Button, Card, colors, Screen, ScreenHeader, sizes, spacing, StatusPill } from '@agrodireto/ui';
import { useDocumentos } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';
import type { Documento } from '@/types';

/** 06 · Documentos — documentos exigidos, status e validade. */
export default function DocumentosScreen() {
  const router = useRouter();
  const documentos = useDocumentos();

  return (
    <Screen
      header={<ScreenHeader title="Documentos" />}
      footer={<Button label="Enviar documento" onPress={() => router.push(rotasAgricultor.enviarDocumento())} />}
    >
      {documentos.map((d) => (
        <Card key={d.id}>
          <DocumentoItem doc={d} onPress={() => router.push(rotasAgricultor.enviarDocumento({ documento: d.id }))} />
        </Card>
      ))}
    </Screen>
  );
}

/** Item do mockup: ícone verde, título (com o tipo ao lado, menor), status e validade. */
function DocumentoItem({ doc, onPress }: { doc: Documento; onPress: () => void }) {
  const Icon = doc.id === 'identificacao' ? IdCard : FileCheck;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressionado]}>
      <Icon size={sizes.iconLg} color={colors.primary} />
      <View style={styles.corpo}>
        <AppText variant="bodyStrong">
          {doc.titulo}
          {doc.tipoRotulo ? (
            <AppText variant="caption" color="textSecondary">
              {' '}
              {doc.tipoRotulo}
            </AppText>
          ) : null}
        </AppText>

        {doc.status === 'verificada' ? (
          <View style={styles.status}>
            <CircleCheck size={sizes.iconSm} color={colors.primary} />
            <AppText variant="caption" color="primary">
              Verificada
            </AppText>
          </View>
        ) : null}
        {doc.status === 'a-vencer' ? (
          <View style={styles.pill}>
            <StatusPill label="A vencer" tone="warning" icon={TriangleAlert} />
          </View>
        ) : null}
        {doc.status === 'vencida' ? (
          <View style={styles.pill}>
            <StatusPill label="Vencida" tone="danger" icon={TriangleAlert} />
          </View>
        ) : null}
        {doc.status === 'nao-enviado' ? (
          <View style={styles.pill}>
            <StatusPill label="Não enviado" tone="neutral" />
          </View>
        ) : null}

        {doc.validade ? (
          <AppText variant="caption" color="textSecondary">
            Válido até {doc.validade}
          </AppText>
        ) : null}
      </View>
      <ChevronRight size={sizes.iconMd} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  corpo: { flex: 1, gap: spacing.xs },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pill: { alignSelf: 'flex-start' },
  pressionado: { opacity: 0.7 },
});
