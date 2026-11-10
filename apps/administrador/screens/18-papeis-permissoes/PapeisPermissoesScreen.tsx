import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardCheck, Landmark, Package, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, Card, colors, Divider, Screen, ScreenHeader, SelectField, type SelectOption, sizes, spacing, Toggle } from '@agrodireto/ui';

type Funcao = 'administrador' | 'operador' | 'qualidade' | 'financeiro' | 'suporte';
type Permissao = 'lotes' | 'inspecoes' | 'financeiro';

/** Funções e permissões da equipe (produto) — revisar com o negócio. */
const FUNCOES: SelectOption<Funcao>[] = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'operador', label: 'Operador' },
  { value: 'qualidade', label: 'Operador de qualidade' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'suporte', label: 'Suporte' },
];

const PERMISSOES: { key: Permissao; label: string; icon: LucideIcon }[] = [
  { key: 'lotes', label: 'Lotes', icon: Package },
  { key: 'inspecoes', label: 'Inspeções', icon: ClipboardCheck },
  { key: 'financeiro', label: 'Financeiro', icon: Landmark },
];

/** 18 · Papéis e permissões — o que cada função pode acessar. As permissões valem no servidor (RLS). */
export default function PapeisPermissoesScreen() {
  const router = useRouter();
  const [funcao, setFuncao] = useState<Funcao>();
  const [ativas, setAtivas] = useState<Record<Permissao, boolean>>({ lotes: false, inspecoes: false, financeiro: false });

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Papéis e permissões" />}
      footer={<Button label="Salvar permissões" disabled={!funcao} onPress={() => router.back()} />}
    >
      <SelectField label="Função" value={funcao} options={FUNCOES} onChange={setFuncao} placeholder="Selecione" />

      <View style={styles.section}>
        <AppText variant="heading">Permissões</AppText>
        <Card>
          {PERMISSOES.map((p, i) => (
            <View key={p.key}>
              <View style={styles.row}>
                <p.icon size={sizes.iconMd} color={colors.textPrimary} />
                <View style={styles.flex}>
                  <Toggle label={p.label} value={ativas[p.key]} onChange={(v) => setAtivas((a) => ({ ...a, [p.key]: v }))} />
                </View>
              </View>
              {i < PERMISSOES.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  flex: { flex: 1 },
});
