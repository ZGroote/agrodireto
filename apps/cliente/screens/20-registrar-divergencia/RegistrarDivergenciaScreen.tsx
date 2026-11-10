import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddMediaButton, AppText, Button, EMPTY, InlineFieldRow, Screen, ScreenHeader, SelectField, type SelectOption, spacing, TextArea } from '@agrodireto/ui';

type Tipo = 'quantidade' | 'qualidade' | 'avaria' | 'produto' | 'atraso' | 'outro';
type Severidade = 'baixa' | 'media' | 'alta';
type Impacto = 'ajuste' | 'devolucao-parcial' | 'devolucao-total' | 'sem-impacto';

/** Catálogos de divergência do produto (não são dados de exemplo) — revisar com o negócio. */
const TIPOS: SelectOption<Tipo>[] = [
  { value: 'quantidade', label: 'Quantidade' },
  { value: 'qualidade', label: 'Qualidade' },
  { value: 'avaria', label: 'Avaria' },
  { value: 'produto', label: 'Produto diferente' },
  { value: 'atraso', label: 'Atraso' },
  { value: 'outro', label: 'Outro' },
];
const SEVERIDADES: SelectOption<Severidade>[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
];
const IMPACTOS: SelectOption<Impacto>[] = [
  { value: 'ajuste', label: 'Ajuste de valor' },
  { value: 'devolucao-parcial', label: 'Devolução parcial' },
  { value: 'devolucao-total', label: 'Devolução total' },
  { value: 'sem-impacto', label: 'Sem impacto' },
];

/** 20 · Registrar divergência — tipo, severidade, descrição, impacto e fotos. Param: ?pedido= */
export default function RegistrarDivergenciaScreen() {
  const router = useRouter();
  const { pedido } = useLocalSearchParams<{ pedido?: string }>();
  const [tipo, setTipo] = useState<Tipo>();
  const [severidade, setSeveridade] = useState<Severidade>();
  const [descricao, setDescricao] = useState('');
  const [impacto, setImpacto] = useState<Impacto>();

  const valido = !!tipo && !!severidade && descricao.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title={`${pedido ?? `PED ${EMPTY}`} · ${EMPTY}`} />}
      // Envio real: insert da divergência no Supabase (vai para o Administrador · Alertas).
      footer={<Button label="Enviar ocorrência" disabled={!valido} onPress={() => router.back()} />}
    >
      <InlineFieldRow label="Tipo">
        <SelectField value={tipo} options={TIPOS} onChange={setTipo} placeholder="Selecione" />
      </InlineFieldRow>
      <InlineFieldRow label="Severidade">
        <SelectField value={severidade} options={SEVERIDADES} onChange={setSeveridade} placeholder="Selecione" />
      </InlineFieldRow>

      <TextArea label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="O que foi diferente do pedido?" maxLength={120} />
      <SelectField label="Impacto" value={impacto} options={IMPACTOS} onChange={setImpacto} placeholder="Selecione" />

      <View style={styles.block}>
        <AppText variant="label">Fotos</AppText>
        {/* Foto exige expo-image-picker (aprovação pendente). */}
        <AddMediaButton />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
});
