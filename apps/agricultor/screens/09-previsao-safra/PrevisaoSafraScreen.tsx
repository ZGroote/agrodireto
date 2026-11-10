import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sprout } from 'lucide-react-native';
import {
  AcaoSheet,
  ActionSheet,
  AppText,
  Button,
  Card,
  colors,
  faixaKg,
  mascaraMilhar,
  PopupField,
  Screen,
  ScreenHeader,
  sizes,
  spacing,
} from '@agrodireto/ui';
import { CulturaFoto } from '@/components/CulturaFoto';
import { useCatalogo, usePrevisao } from '@/hooks/dados';

/** 09 · Previsão de safra — estimativa, faixa estimada, responsável e etapa. */
export default function PrevisaoSafraScreen() {
  const router = useRouter();
  const p = usePrevisao();
  const { etapas } = useCatalogo();
  const [estimativa, setEstimativa] = useState(mascaraMilhar(String(p.estimativaKg)));
  const [etapa, setEtapa] = useState(p.etapa);
  const [aberto, setAberto] = useState(false);

  const n = Number(estimativa.replace(/\D/g, '')) || 0;
  // Faixa de ±10% da estimativa (regra a confirmar com o negócio; o servidor passará a calcular).
  const faixa = n > 0 ? faixaKg(Math.round((n * 0.9) / 100) * 100, Math.round((n * 1.1) / 100) * 100) : '—';
  const acoes: AcaoSheet[] = etapas.map((e) => ({ label: e, icon: e === etapa ? Sprout : undefined, onPress: () => setEtapa(e) }));

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Previsão de safra" />}
      footer={<Button label="Salvar previsão" disabled={n <= 0} onPress={() => router.back()} />}
    >
      <View style={styles.cultura}>
        <CulturaFoto cultura={p.cultura} tipo={p.foto} size={sizes.thumb + spacing.sm} />
        <View style={styles.flex}>
          <AppText variant="heading">{p.cultura}</AppText>
          <AppText variant="caption" color="textSecondary">
            {p.origem}
          </AppText>
        </View>
      </View>

      <PopupField
        label="Estimativa de colheita"
        titulo="Estimativa de colheita"
        descricao="Quantidade que você espera colher desta cultura."
        value={estimativa}
        onChange={setEstimativa}
        sufixo="kg"
        teclado="number-pad"
        mascara={mascaraMilhar}
      />

      <View style={styles.bloco}>
        <AppText variant="caption" color="textSecondary">
          Faixa estimada
        </AppText>
        <AppText variant="heading">{faixa}</AppText>
      </View>

      <View style={styles.bloco}>
        <AppText variant="caption" color="textSecondary">
          Atualizado por
        </AppText>
        <AppText variant="bodyStrong">
          {p.atualizadoPor} em {p.atualizadoEm}
        </AppText>
      </View>

      <Card tone="soft" onPress={() => setAberto(true)}>
        <View style={styles.etapa}>
          <Sprout size={sizes.iconMd} color={colors.primary} />
          <AppText variant="bodyStrong">{etapa}</AppText>
        </View>
      </Card>
      <ActionSheet visible={aberto} onClose={() => setAberto(false)} title="Etapa da safra" acoes={acoes} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  cultura: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bloco: { gap: spacing.xxs },
  etapa: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
