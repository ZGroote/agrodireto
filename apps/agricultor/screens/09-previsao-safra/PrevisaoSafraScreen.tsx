import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, DateField, ListRow, Screen, ScreenHeader, TextField, TextLink } from '@agrodireto/ui';
import { lerCulturas, previsaoValida, salvarPrevisao, type CulturaLocal, type PrevisaoLocal } from '@/lib/culturasLocais';
import { rotasAgricultor } from '@/routes';

export default function PrevisaoSafraScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <PrevisaoPorCultura key={id ?? ''} id={id} />;
}

function PrevisaoPorCultura({ id }: { id?: string }) {
  const router = useRouter();
  const [culturas, setCulturas] = useState<CulturaLocal[]>();
  const [erro, setErro] = useState(false);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    void lerCulturas().then(
      (itens) => { if (ativo) setCulturas(itens); },
      () => { if (ativo) setErro(true); },
    );
    return () => { ativo = false; };
  }, []));

  const cultura = culturas?.find((item) => item.id === id);
  if (cultura) return <FormularioPrevisao cultura={cultura} />;

  return (
    <Screen withTabBar header={<ScreenHeader title="Previsão de safra" />}>
      {erro && <AppText>Não foi possível carregar as culturas deste dispositivo.</AppText>}
      {!erro && !culturas && <AppText>Carregando culturas…</AppText>}
      {culturas?.length === 0 && (
        <>
          <AppText>Cadastre uma cultura para registrar a previsão.</AppText>
          <TextLink label="Cadastrar cultura" onPress={() => router.push(rotasAgricultor.novaCultura)} />
        </>
      )}
      {!!culturas?.length && (
        <>
          {id && <AppText>Esta cultura não está disponível neste dispositivo.</AppText>}
          <AppText variant="label">Escolha a cultura</AppText>
          {culturas.map((item) => (
            <ListRow key={item.id} title={item.cultura} subtitle={item.variedade || undefined} onPress={() => router.replace({
              pathname: rotasAgricultor.previsao, params: { id: item.id },
            })} />
          ))}
        </>
      )}
    </Screen>
  );
}

function peso(valor: string) {
  const texto = valor.trim();
  return /^\d+$/.test(texto) ? Number(texto) : 0;
}

function FormularioPrevisao({ cultura }: { cultura: CulturaLocal }) {
  const router = useRouter();
  const [estimativa, setEstimativa] = useState(cultura.previsao?.estimativaKg?.toString() ?? '');
  const [minimo, setMinimo] = useState(cultura.previsao?.minimoKg?.toString() ?? '');
  const [maximo, setMaximo] = useState(cultura.previsao?.maximoKg?.toString() ?? '');
  const [colheita, setColheita] = useState(cultura.previsao?.colheita ?? '');
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const gravando = useRef(false);

  const previsao: PrevisaoLocal = {
    estimativaKg: peso(estimativa),
    colheita,
    minimoKg: minimo.trim() ? peso(minimo) : undefined,
    maximoKg: maximo.trim() ? peso(maximo) : undefined,
  };
  const valida = previsaoValida(previsao);
  const quantidadeValida = Number.isSafeInteger(previsao.estimativaKg) && previsao.estimativaKg > 0;
  const faixaInvalida = !!(minimo.trim() || maximo.trim()) && (
    !previsao.minimoKg || !previsao.maximoKg
    || !Number.isSafeInteger(previsao.minimoKg) || !Number.isSafeInteger(previsao.maximoKg)
    || previsao.minimoKg > previsao.estimativaKg || previsao.maximoKg < previsao.estimativaKg
  );

  async function salvar() {
    if (!valida || gravando.current) return;
    gravando.current = true;
    setSalvando(true);
    setErro(false);
    try {
      await salvarPrevisao(cultura.id, previsao);
      router.back();
    } catch {
      setErro(true);
    } finally {
      gravando.current = false;
      setSalvando(false);
    }
  }

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Previsão de safra" subtitle="A previsão fica salva neste dispositivo." />}
      footer={<Button label="Salvar previsão" disabled={!valida} loading={salvando} onPress={() => void salvar()} />}
    >
      <AppText variant="heading">{cultura.cultura}</AppText>
      {!!cultura.variedade && <AppText variant="caption">{cultura.variedade}</AppText>}
      <DateField label="Data prevista de colheita" value={colheita} onChange={setColheita} />
      <TextField label="Estimativa de colheita" value={estimativa} onChangeText={setEstimativa} suffix="kg" keyboardType="number-pad" editable={!salvando} />
      {!!estimativa.trim() && !quantidadeValida && <AppText variant="caption">Informe um número inteiro de quilos maior que zero.</AppText>}
      <AppText variant="label">Faixa estimada (opcional)</AppText>
      <TextField label="Mínimo" value={minimo} onChangeText={setMinimo} suffix="kg" keyboardType="number-pad" editable={!salvando} />
      <TextField label="Máximo" value={maximo} onChangeText={setMaximo} suffix="kg" keyboardType="number-pad" editable={!salvando} />
      {faixaInvalida && <AppText variant="caption">Preencha os dois limites e deixe a estimativa dentro da faixa.</AppText>}
      {erro && <AppText accessibilityLiveRegion="polite">Não foi possível salvar a previsão. Tente novamente.</AppText>}
    </Screen>
  );
}
