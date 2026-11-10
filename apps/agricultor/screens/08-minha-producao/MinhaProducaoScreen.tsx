import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { CalendarDays, Package, Plus, Sprout, Tag } from 'lucide-react-native';
import { AppText, Card, CalendarMonth, Divider, kg, ListRow, Screen, ScreenHeader } from '@agrodireto/ui';
import { lerCulturas, lerDataColheita, type CulturaLocal } from '@/lib/culturasLocais';
import { rotasAgricultor } from '@/routes';

export default function MinhaProducaoScreen() {
  const router = useRouter();
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

  const registros = erroCulturas ? [] : culturas ?? [];
  const destacados = [...new Set(registros.flatMap(({ previsao }) => {
    const data = previsao && lerDataColheita(previsao.colheita);
    return data && data.getFullYear() === mes.ano && data.getMonth() === mes.mes ? [data.getDate()] : [];
  }))];

  return (
    <Screen withTabBar header={<ScreenHeader title="Minha produção" />}>
      <Card>
        <AppText variant="heading">Culturas neste dispositivo</AppText>
        {erroCulturas && <AppText variant="caption">Não foi possível abrir as culturas salvas.</AppText>}
        {!erroCulturas && culturas?.length === 0 && <AppText variant="caption">Nenhuma cultura cadastrada.</AppText>}
        {registros.map((cultura) => (
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

      <Card>
        <AppText variant="heading">Previsão de safra</AppText>
        <CalendarMonth highlighted={destacados} onMonthChange={(ano, m) => setMes({ ano, mes: m })} />
        {registros.map(({ id, cultura, variedade, previsao }) => (
          <ListRow
            key={id}
            icon={CalendarDays}
            title={`${previsao ? 'Editar' : 'Registrar'} previsão · ${cultura}`}
            subtitle={[variedade, previsao && `${kg(previsao.estimativaKg)} · ${previsao.colheita}`].filter(Boolean).join(' · ') || undefined}
            onPress={() => router.push({ pathname: rotasAgricultor.previsao, params: { id } })}
          />
        ))}
        {!erroCulturas && culturas?.length === 0 && <AppText variant="caption">Cadastre uma cultura para registrar a previsão.</AppText>}
      </Card>

      <Card>
        <ListRow icon={Package} title="Meus lotes" onPress={() => router.push(rotasAgricultor.lotes)} />
        <Divider />
        <ListRow icon={Tag} title="Cotações" onPress={() => router.push(rotasAgricultor.cotacoes)} />
      </Card>
    </Screen>
  );
}
