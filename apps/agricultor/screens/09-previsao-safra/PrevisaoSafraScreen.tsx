import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, DateField, ListRow, Screen, ScreenHeader, SelectField, TextField, TextLink } from '@agrodireto/ui';
import { lerCulturas, previsaoValida, salvarPrevisao, type Cultura, type Previsao, type Unidade } from '@/lib/culturas';
import { rotasAgricultor } from '@/routes';

export default function PrevisaoSafraScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <PrevisaoPorCultura key={id ?? ''} id={id} />;
}

function PrevisaoPorCultura({ id }: { id?: string }) {
  const router = useRouter();
  const [culturas, setCulturas] = useState<Cultura[]>();
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
      {erro && <AppText>Não foi possível carregar as culturas. Verifique a conexão e tente novamente.</AppText>}
      {!erro && !culturas && <AppText>Carregando culturas…</AppText>}
      {culturas?.length === 0 && (
        <>
          <AppText>Cadastre uma cultura para registrar a previsão.</AppText>
          <TextLink label="Cadastrar cultura" onPress={() => router.push(rotasAgricultor.novaCultura)} />
        </>
      )}
      {!!culturas?.length && (
        <>
          {id && <AppText>Esta cultura não está mais disponível.</AppText>}
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

const nomesUnidade: Record<Unidade, string> = { kg: 'Quilos (kg)', cx: 'Caixas (cx)', t: 'Toneladas (t)', sc: 'Sacas de 60 kg (sc)' };

function FormularioPrevisao({ cultura }: { cultura: Cultura }) {
  const router = useRouter();
  const [unidade, setUnidade] = useState<Unidade | undefined>(cultura.previsao?.unidade ?? (cultura.unidades.length === 1 ? cultura.unidades[0] : undefined));
  const [estimativa, setEstimativa] = useState(cultura.previsao?.estimativa.toString() ?? '');
  const [minimo, setMinimo] = useState(cultura.previsao?.minimo?.toString() ?? '');
  const [maximo, setMaximo] = useState(cultura.previsao?.maximo?.toString() ?? '');
  const [colheita, setColheita] = useState(cultura.previsao?.colheita ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const gravando = useRef(false);

  const previsao: Previsao | null = unidade ? {
    unidade,
    estimativa: peso(estimativa),
    colheita,
    minimo: minimo.trim() ? peso(minimo) : undefined,
    maximo: maximo.trim() ? peso(maximo) : undefined,
  } : null;
  const valida = !!previsao && previsaoValida(previsao, cultura.unidades);
  const quantidadeValida = peso(estimativa) > 0;
  const faixaInvalida = !!(minimo.trim() || maximo.trim()) && (
    !peso(minimo) || !peso(maximo) || peso(minimo) > peso(estimativa) || peso(maximo) < peso(estimativa)
  );

  async function salvar() {
    if (!valida || !previsao || gravando.current) return;
    gravando.current = true;
    setSalvando(true);
    setErro(null);
    try {
      await salvarPrevisao(cultura, previsao);
      router.back();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a previsão. Tente novamente.');
    } finally {
      gravando.current = false;
      setSalvando(false);
    }
  }

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Previsão de safra" subtitle="A previsão é uma estimativa e não conta como estoque." />}
      footer={<Button label="Salvar previsão" disabled={!valida} loading={salvando} onPress={() => void salvar()} />}
    >
      <AppText variant="heading">{cultura.cultura}</AppText>
      {!!cultura.variedade && <AppText variant="caption">{cultura.variedade}</AppText>}
      <DateField label="Data prevista de colheita" value={colheita} onChange={setColheita} />
      <SelectField label="Unidade" value={unidade} onChange={setUnidade}
        options={cultura.unidades.map((u) => ({ label: nomesUnidade[u], value: u }))}
        emptyMessage="Esta cultura não tem unidade no catálogo." />
      <TextField label="Estimativa de colheita" value={estimativa} onChangeText={setEstimativa} suffix={unidade} keyboardType="number-pad" editable={!salvando} />
      {!!estimativa.trim() && !quantidadeValida && <AppText variant="caption">Informe um número inteiro maior que zero.</AppText>}
      <AppText variant="label">Faixa estimada (opcional)</AppText>
      <TextField label="Mínimo" value={minimo} onChangeText={setMinimo} suffix={unidade} keyboardType="number-pad" editable={!salvando} />
      <TextField label="Máximo" value={maximo} onChangeText={setMaximo} suffix={unidade} keyboardType="number-pad" editable={!salvando} />
      {faixaInvalida && <AppText variant="caption">Preencha os dois limites e deixe a estimativa dentro da faixa.</AppText>}
      {erro && <AppText accessibilityLiveRegion="polite">{erro}</AppText>}
    </Screen>
  );
}
