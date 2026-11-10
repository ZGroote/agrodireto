import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Card, EMPTY, ListRow, Screen, ScreenHeader, SelectField, type SelectOption, spacing, TextArea, TextField, TextLink } from '@agrodireto/ui';

type Tipo = 'atraso' | 'avaria' | 'veiculo' | 'acidente' | 'divergencia' | 'outro';
type Gravidade = 'baixa' | 'media' | 'alta';

/** Catálogo de ocorrências do produto (não é dado de exemplo). */
const TIPOS: SelectOption<Tipo>[] = [
  { value: 'atraso', label: 'Atraso' },
  { value: 'avaria', label: 'Avaria na carga' },
  { value: 'veiculo', label: 'Problema no veículo' },
  { value: 'acidente', label: 'Acidente' },
  { value: 'divergencia', label: 'Divergência de quantidade' },
  { value: 'outro', label: 'Outro' },
];

const GRAVIDADES: SelectOption<Gravidade>[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
];

/** 16 · Registrar ocorrência — tipo, gravidade, descrição, impacto e evidência. Param: ?carga= */
export default function RegistrarOcorrenciaScreen() {
  const router = useRouter();
  const { carga } = useLocalSearchParams<{ carga?: string }>();
  const [tipo, setTipo] = useState<Tipo>();
  const [gravidade, setGravidade] = useState<Gravidade>();
  const [descricao, setDescricao] = useState('');
  const [impacto, setImpacto] = useState('');
  const [acao, setAcao] = useState('');

  const valido = !!tipo && !!gravidade && descricao.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Registrar ocorrência" />}
      footer={
        <>
          {/* Envio real: insert da ocorrência no Supabase (visível para a operação/Administrador). */}
          <Button label="Enviar ocorrência" disabled={!valido} onPress={() => router.back()} />
          {/* Acionar operação: contato direto com a equipe — sem mockup, ligado ao Administrador (Lote D). */}
          <TextLink label="Acionar operação" color="danger" />
        </>
      }
    >
      <Card>
        <ListRow icon={Truck} title={`${carga ?? EMPTY} · PED ${EMPTY}`} />
      </Card>

      <View style={styles.row}>
        <View style={styles.flex}>
          <SelectField label="Tipo" value={tipo} options={TIPOS} onChange={setTipo} placeholder="Selecione" />
        </View>
        <View style={styles.flex}>
          <SelectField label="Gravidade" value={gravidade} options={GRAVIDADES} onChange={setGravidade} placeholder="Selecione" />
        </View>
      </View>

      <TextArea label="Descrição (obrigatória)" value={descricao} onChangeText={setDescricao} placeholder="O que aconteceu?" />
      <TextField label="Impacto" placeholder="Ex.: previsão de entrega mantida" value={impacto} onChangeText={setImpacto} />
      <TextField label="Ação realizada" placeholder="O que foi feito" value={acao} onChangeText={setAcao} />

      <View style={styles.block}>
        <AppText variant="label">Evidência (opcional)</AppText>
        {/* Foto exige expo-image-picker (aprovação pendente). */}
        <AddMediaButton />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  block: { gap: spacing.sm },
});
