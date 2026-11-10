import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, FileText } from 'lucide-react-native';
import { AppText, Button, Card, colors, EmptyState, Screen, ScreenHeader, SegmentedControl, SelectField, type SelectOption, sizes, spacing } from '@agrodireto/ui';

type Aba = 'notificacoes' | 'conteudo';
type Template = 'coleta-agendada' | 'pedido-confirmado' | 'entrega-realizada' | 'ocorrencia';
type Canal = 'push' | 'email' | 'sms';

/** Templates do produto: texto com variáveis entre chaves, preenchidas no envio. Revisar com o negócio. */
const TEMPLATES: (SelectOption<Template> & { texto: string })[] = [
  { value: 'coleta-agendada', label: 'Coleta agendada', texto: 'Coleta agendada para {data} às {hora}.' },
  { value: 'pedido-confirmado', label: 'Pedido confirmado', texto: 'Pedido {pedido} confirmado.' },
  { value: 'entrega-realizada', label: 'Entrega realizada', texto: 'Entrega do pedido {pedido} realizada às {hora}.' },
  { value: 'ocorrencia', label: 'Ocorrência registrada', texto: 'Ocorrência registrada na carga {carga}.' },
];

const CANAIS: SelectOption<Canal>[] = [
  { value: 'push', label: 'Push' },
  { value: 'email', label: 'E-mail' },
  { value: 'sms', label: 'SMS' },
];

/** 21 · Conteúdo e notificações — templates por canal com pré-visualização. */
export default function ConteudoNotificacoesScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('notificacoes');
  const [template, setTemplate] = useState<Template>();
  const [canal, setCanal] = useState<Canal>();
  const atual = TEMPLATES.find((t) => t.value === template);

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Conteúdo e notificações" />}
      footer={aba === 'notificacoes' ? <Button label="Salvar template" disabled={!template || !canal} onPress={() => router.back()} /> : undefined}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'notificacoes', label: 'Notificações' },
          { key: 'conteudo', label: 'Conteúdo' },
        ]}
      />

      {aba === 'notificacoes' ? (
        <>
          <SelectField label="Template" value={template} options={TEMPLATES} onChange={setTemplate} placeholder="Selecione" />
          <SelectField label="Canal" value={canal} options={CANAIS} onChange={setCanal} placeholder="Selecione" />

          <View style={styles.section}>
            <AppText variant="label">Pré-visualização</AppText>
            <Card tone="soft">
              <View style={styles.preview}>
                <Bell size={sizes.iconLg} color={colors.textPrimary} />
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{atual?.label ?? 'Selecione um template'}</AppText>
                  {atual ? <AppText variant="caption">{atual.texto}</AppText> : null}
                </View>
              </View>
            </Card>
          </View>
        </>
      ) : (
        // Conteúdo (textos de onboarding, termos, ajuda): sem mockup.
        <EmptyState icon={FileText} title="Nenhum conteúdo publicado" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
});
