import { useLocalSearchParams } from 'expo-router';
import { ClipboardCheck, ShieldCheck } from 'lucide-react-native';
import { Card, EmptyState, ListRow, Screen, ScreenHeader, StatusPill, VStack } from '@agrodireto/ui';
import { useInspecoes, useLote } from '@/hooks/dados';

/** 31 · Inspeções do lote — resultado das inspeções feitas pela equipe AgroDireto (somente leitura). Param: ?id= */
export default function InspecoesLoteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const lote = useLote(id);
  const inspecoes = useInspecoes();

  return (
    <Screen header={<ScreenHeader title="Inspeções" subtitle={`${lote.id} · ${lote.produto}`} />}>
      {inspecoes.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Nenhuma inspeção" description="As inspeções do lote aparecem aqui." />
      ) : (
        <VStack gap="sm">
          {inspecoes.map((i) => (
            <Card key={i.id}>
              <ListRow
                icon={ShieldCheck}
                title={i.titulo}
                subtitle={i.legenda}
                trailing={<StatusPill label={i.resultado === 'aprovada' ? 'Aprovada' : 'Agendada'} tone={i.resultado === 'aprovada' ? 'success' : 'info'} />}
              />
            </Card>
          ))}
        </VStack>
      )}
    </Screen>
  );
}
