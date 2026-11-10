import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FileUp } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Card, colors, DateField, MediaThumb, Screen, ScreenHeader, SelectField, spacing } from '@agrodireto/ui';
import { opcoes } from '@/lib/opcoes';
import { escolherDaGaleria, type ArquivoEscolhido } from '@/lib/selecionarMidia';
import { documentosCadastro, tiposDocumento } from '@/lib/tiposDocumento';

/** 27 · Preparar documento — prévia temporária de foto e validade. */
export default function EnviarDocumentoScreen() {
  const { documento } = useLocalSearchParams<{ documento?: string }>();
  const [tipo, setTipo] = useState<string | undefined>(
    documentosCadastro.find((d) => d.id === documento)?.titulo,
  );
  const [validade, setValidade] = useState('');
  const [foto, setFoto] = useState<ArquivoEscolhido>();
  const [erro, setErro] = useState('');

  async function selecionarFoto() {
    setErro('');
    try {
      const [arquivo] = await escolherDaGaleria('foto', 1);
      if (arquivo) setFoto(arquivo);
    } catch {
      setErro('Não foi possível abrir a foto. Tente novamente.');
    }
  }

  return (
    <Screen
      header={<ScreenHeader title="Preparar documento" subtitle="A foto fica na prévia até você sair da tela." />}
      footer={<Button label="Envio indisponível" disabled />}
    >
      <SelectField label="Tipo de documento" value={tipo} options={opcoes(tiposDocumento)} onChange={setTipo} placeholder="Selecione" />

      <Card>
        <View style={styles.arquivo}>
          {foto ? (
            <>
              <MediaThumb source={{ uri: foto.uri }} onRemove={() => setFoto(undefined)} />
              <AppText variant="body" align="center">Foto selecionada para prévia</AppText>
            </>
          ) : (
            <>
              <FileUp size={spacing.xxxl} color={colors.textSecondary} />
              <AppText variant="body" color="textSecondary" align="center">Nenhuma foto selecionada</AppText>
            </>
          )}
          <AddMediaButton onPress={() => void selecionarFoto()} />
          {!!erro && <AppText accessibilityLiveRegion="polite">{erro}</AppText>}
        </View>
      </Card>

      <DateField label="Validade (se houver)" value={validade} onChange={setValidade} placeholder="Sem validade" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  arquivo: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
});
