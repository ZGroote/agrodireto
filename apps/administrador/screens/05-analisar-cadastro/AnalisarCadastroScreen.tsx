import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, House, Image as ImageIcon } from 'lucide-react-native';
import { AppText, Button, Card, Divider, EMPTY, IconBadge, ListRow, Screen, ScreenHeader, spacing, TextLink } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/** 05 · Analisar cadastro — propriedade, documento de identificação e evidências. Param: ?id= */
export default function AnalisarCadastroScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const abrirDocumentos = () => router.push(rotasAdministrador.documentosMidias({ id }));

  return (
    <Screen
      header={<ScreenHeader title="Analisar cadastro" />}
      footer={
        <>
          {/* Aprovação real: Edge Function muda o status e grava a auditoria (23). */}
          <Button label="Aprovar cadastro" onPress={() => router.back()} />
          {/* Pedido de ajuste ao produtor: sem mockup — fase de dados. */}
          <TextLink label="Solicitar ajuste" />
        </>
      }
    >
      <View style={styles.head}>
        <IconBadge icon={House} />
        <View>
          <AppText variant="heading">{EMPTY}</AppText>
          <AppText variant="caption" color="textSecondary">
            {EMPTY}
          </AppText>
        </View>
      </View>

      <Card>
        <ListRow title="Propriedade" onPress={abrirDocumentos} />
        <Divider />
        <ListRow title="Documento de identificação" subtitle={EMPTY} onPress={abrirDocumentos} />
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Evidências</AppText>
        <Card>
          <ListRow icon={ImageIcon} title="Foto da propriedade" onPress={abrirDocumentos} />
          <Divider />
          <ListRow icon={FileText} title="Documento da propriedade" onPress={abrirDocumentos} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { gap: spacing.sm },
});
