import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddMediaButton, AppText, Button, Card, EMPTY, ListRow, Screen, ScreenHeader, SelectField, spacing, TextArea } from '@agrodireto/ui';
import { Truck } from 'lucide-react-native';
import { useOcorrenciaRascunho, useTransporte } from '@/hooks/dados';
import { opcoes } from '@/lib/opcoes';

/** Catálogos de ocorrência do produto — revisar com o negócio. */
const TIPOS = ['Motorista atrasado', 'Motorista não chegou', 'Carga recusada', 'Divergência de quantidade', 'Avaria na carga', 'Outro'];
const GRAVIDADES = ['Baixa', 'Média', 'Alta'];

/** 35 · Registrar ocorrência (Agricultor) — problema na coleta ou no transporte. Param: ?pedido= */
export default function RegistrarOcorrenciaScreen() {
  const router = useRouter();
  const { pedido } = useLocalSearchParams<{ pedido?: string }>();
  const t = useTransporte();
  const r = useOcorrenciaRascunho();
  const [tipo, setTipo] = useState<string | undefined>(r.tipo);
  const [gravidade, setGravidade] = useState<string | undefined>(r.gravidade);
  const [descricao, setDescricao] = useState(r.descricao);

  const valido = !!tipo && !!gravidade && descricao.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Registrar ocorrência" />}
      // Envio real: insert da ocorrência no Supabase (a equipe vê no app Administrador).
      footer={<Button label="Enviar ocorrência" disabled={!valido} onPress={() => router.back()} />}
    >
      <Card>
        <ListRow icon={Truck} title={`${t.cargaId} · ${pedido ?? t.pedidoId ?? EMPTY}`} />
      </Card>

      <View style={styles.row}>
        <View style={styles.flex}>
          <SelectField label="Tipo" value={tipo} options={opcoes(TIPOS)} onChange={setTipo} />
        </View>
        <View style={styles.flex}>
          <SelectField label="Gravidade" value={gravidade} options={opcoes(GRAVIDADES)} onChange={setGravidade} />
        </View>
      </View>

      <TextArea label="Descrição (obrigatória)" value={descricao} onChangeText={setDescricao} placeholder="O que aconteceu?" />

      <View style={styles.bloco}>
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
  bloco: { gap: spacing.sm },
});
