import { useRouter } from 'expo-router';
import { Columns2 } from 'lucide-react-native';
import { Button, ComparisonTable, EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

type OfertaComparada = { fornecedor: string; precoKg: string; padrao: string; quantidade: string; frete: string; janela: string };

/** 07 · Comparar ofertas — tabela lado a lado (preço/kg, padrão, quantidade, frete, janela). */
export default function CompararOfertasScreen() {
  const router = useRouter();
  // Ofertas escolhidas para comparar virão da seleção na tab Ofertas (fase de dados).
  const ofertas: OfertaComparada[] = [];

  return (
    <Screen
      header={<ScreenHeader title="Comparar ofertas" />}
      footer={<Button label="Selecionar oferta" disabled={ofertas.length === 0} onPress={() => router.push(rotasCliente.resumoCompra)} />}
    >
      {ofertas.length === 0 ? (
        <EmptyState icon={Columns2} title="Nenhuma oferta para comparar" description="Escolha duas ou mais ofertas na busca para ver lado a lado." />
      ) : (
        <ComparisonTable
          columns={ofertas.map((o) => o.fornecedor)}
          rows={[
            { label: 'Preço/kg', values: ofertas.map((o) => o.precoKg) },
            { label: 'Padrão', values: ofertas.map((o) => o.padrao) },
            { label: 'Quantidade', values: ofertas.map((o) => o.quantidade) },
            { label: 'Frete', values: ofertas.map((o) => o.frete) },
            { label: 'Janela', values: ofertas.map((o) => o.janela) },
          ]}
        />
      )}
    </Screen>
  );
}
