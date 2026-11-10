import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { CotacaoItem } from '@/components/CotacaoItem';
import { useCotacoes } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 16 · Cotações (Produção) — cotações recebidas dos compradores. Item abre 17 · Negociação. */
export default function CotacoesScreen() {
  const router = useRouter();
  const cotacoes = useCotacoes();

  return (
    <Screen withTabBar header={<ScreenHeader title="Cotações" />}>
      {cotacoes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma cotação recebida"
          description="Quando um comprador pedir cotação dos seus lotes, ela aparece aqui."
        />
      ) : (
        <VStack gap="md">
          {cotacoes.map((c) => (
            <CotacaoItem key={c.id} cotacao={c} onPress={() => router.push(rotasAgricultor.negociacao({ id: c.id }))} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}
