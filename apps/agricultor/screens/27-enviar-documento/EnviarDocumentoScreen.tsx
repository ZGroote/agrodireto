import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileUp } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Card, colors, DateField, Screen, ScreenHeader, SelectField, spacing } from '@agrodireto/ui';
import { useDocumentos } from '@/hooks/dados';
import { opcoes } from '@/lib/opcoes';

const TIPOS = ['Identificação (RG ou CNH)', 'Certificado fitossanitário', 'Comprovante da propriedade', 'Outro'];

/** 27 · Enviar documento — tipo, arquivo e validade. Param: ?documento= (abre já no tipo escolhido). */
export default function EnviarDocumentoScreen() {
  const router = useRouter();
  const { documento } = useLocalSearchParams<{ documento?: string }>();
  const existente = useDocumentos().find((d) => d.id === documento);
  const [tipo, setTipo] = useState<string | undefined>(
    existente ? `${existente.titulo}${existente.tipoRotulo ? ` ${existente.tipoRotulo}` : ''}` : undefined,
  );
  const [validade, setValidade] = useState(existente?.validade ?? '');

  return (
    <Screen
      header={<ScreenHeader title="Enviar documento" subtitle="Envie uma foto ou PDF legível do documento." />}
      footer={<Button label="Enviar documento" disabled={!tipo} onPress={() => router.back()} />}
    >
      <SelectField label="Tipo de documento" value={tipo} options={opcoes(TIPOS)} onChange={setTipo} placeholder="Selecione" />

      <Card>
        <View style={styles.arquivo}>
          <FileUp size={spacing.xxxl} color={colors.textSecondary} />
          <AppText variant="body" color="textSecondary" align="center">
            Nenhum arquivo selecionado
          </AppText>
          {/* Seleção de arquivo exige expo-document-picker (aprovação pendente). */}
          <AddMediaButton />
        </View>
      </Card>

      <DateField label="Validade (se houver)" value={validade} onChange={setValidade} placeholder="Sem validade" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  arquivo: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
});
