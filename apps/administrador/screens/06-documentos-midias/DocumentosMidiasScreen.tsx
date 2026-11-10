import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, FileText, MapPin, User, Video, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, colors, EMPTY, EmptyState, ImagePlaceholder, Screen, ScreenHeader, SegmentedControl, sizes, spacing } from '@agrodireto/ui';

type Aba = 'documentos' | 'midias';

/**
 * 06 · Documentos e mídias — validação dos arquivos enviados pelo cadastro. Param: ?id=
 * Com dados: StatusPill de verificação (ex.: "Não verificado", warning).
 */
export default function DocumentosMidiasScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('midias');

  return (
    <Screen
      header={<ScreenHeader title="Documentos e mídias" />}
      // Validação real: Edge Function marca o arquivo como verificado e grava a auditoria.
      footer={<Button label={aba === 'midias' ? 'Validar mídia' : 'Validar documento'} onPress={() => router.back()} />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'documentos', label: 'Documentos' },
          { key: 'midias', label: 'Mídias' },
        ]}
      />

      {aba === 'midias' ? (
        <>
          {/* Mídia virá do Storage do Supabase. */}
          <ImagePlaceholder height={160} video label="Nenhuma mídia enviada" />
          <View style={styles.meta}>
            <Line icon={Video} text={`Origem: ${EMPTY}`} />
            <Line icon={CalendarDays} text={EMPTY} />
            <Line icon={User} text={EMPTY} />
            <Line icon={MapPin} text={EMPTY} />
          </View>
        </>
      ) : (
        <EmptyState icon={FileText} title="Nenhum documento enviado" />
      )}
    </Screen>
  );
}

function Line({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.line}>
      <Icon size={sizes.iconMd} color={colors.textSecondary} />
      <AppText variant="body">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { gap: spacing.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
