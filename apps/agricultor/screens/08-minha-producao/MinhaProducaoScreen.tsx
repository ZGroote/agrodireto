import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, Info, Package, Plus, Sprout, Tag } from 'lucide-react-native';
import { AppText, Card, CalendarMonth, colors, Divider, fontFamily, kg, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { CulturaFoto } from '@/components/CulturaFoto';
import { useDiasColheita, usePrevisao } from '@/hooks/dados';
import { lerCulturas, type CulturaLocal } from '@/lib/culturasLocais';
import { rotasAgricultor } from '@/routes';

/** 08 · Minha produção (tab) — calendário de safra e cultura em andamento. */
export default function MinhaProducaoScreen() {
  const router = useRouter();
  const previsao = usePrevisao();
  const dias = useDiasColheita();
  const hoje = new Date();
  const [mes, setMes] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
  const [culturas, setCulturas] = useState<CulturaLocal[] | null>(null);
  const [erroCulturas, setErroCulturas] = useState(false);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setErroCulturas(false);
    void lerCulturas().then(
      (registros) => { if (ativo) setCulturas(registros); },
      () => { if (ativo) setErroCulturas(true); },
    );
    return () => { ativo = false; };
  }, []));
  // Os dias destacados valem só para o mês corrente (as previsões virão do Supabase).
  const destacados = mes.ano === hoje.getFullYear() && mes.mes === hoje.getMonth() ? dias : [];

  return (
    <Screen withTabBar header={<ScreenHeader title="Minha produção" />}>
      <Card>
        <AppText variant="heading">Culturas neste dispositivo</AppText>
        {erroCulturas && <AppText variant="caption">Não foi possível abrir as culturas salvas.</AppText>}
        {!erroCulturas && culturas?.length === 0 && <AppText variant="caption">Nenhuma cultura cadastrada.</AppText>}
        {!erroCulturas && culturas?.map((cultura) => (
          <ListRow
            key={cultura.id}
            icon={Sprout}
            title={cultura.cultura}
            subtitle={[cultura.variedade, `${cultura.area} ha`, cultura.etapa].filter(Boolean).join(' · ')}
            onPress={() => router.push({ pathname: rotasAgricultor.novaCultura, params: { id: cultura.id } })}
          />
        ))}
        <ListRow icon={Plus} title="Cadastrar cultura" onPress={() => router.push(rotasAgricultor.novaCultura)} />
      </Card>
      <AppText variant="caption" color="textSecondary">Previsão de demonstração</AppText>
      <Card>
        <CalendarMonth highlighted={destacados} onMonthChange={(ano, m) => setMes({ ano, mes: m })} />
      </Card>

      <Card>
        <View style={styles.cultura}>
          <CulturaFoto cultura={previsao.cultura} tipo={previsao.foto} size={sizes.thumb + spacing.sm} />
          <View style={styles.flex}>
            <AppText variant="heading">{previsao.cultura}</AppText>
            <AppText variant="caption" color="textSecondary">
              Janela de colheita
            </AppText>
            <AppText variant="bodyStrong">{previsao.janela}</AppText>
          </View>
        </View>
        <View style={styles.estimativa}>
          <Info size={sizes.iconSm} color={colors.textSecondary} />
          <AppText variant="caption" color="textSecondary">
            Estimativa declarada: <AppText variant="caption" style={styles.negrito}>{kg(previsao.estimativaKg)}</AppText>
          </AppText>
        </View>
        <Divider />
        <ListRow
          title="Ver previsão"
          tone="primary"
          trailing={<ChevronRight size={sizes.iconMd} color={colors.primary} />}
          chevron={false}
          onPress={() => router.push(rotasAgricultor.previsao)}
        />
      </Card>

      {/* Acessos às telas 10, 16 e 30 — o mockup não mostra por onde se chega a elas. */}
      <Card>
        <ListRow icon={Package} title="Meus lotes" onPress={() => router.push(rotasAgricultor.lotes)} />
        <Divider />
        <ListRow icon={Tag} title="Cotações" onPress={() => router.push(rotasAgricultor.cotacoes)} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  cultura: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  estimativa: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  negrito: { fontFamily: fontFamily.bold },
});
