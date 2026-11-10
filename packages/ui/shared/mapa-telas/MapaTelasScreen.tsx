import { useRouter, type Href } from 'expo-router';
import { AppText, Card, Divider, ListRow, Screen, ScreenHeader, VStack } from '../../components';

export type TelaCatalogo = { numero: string; nome: string; href: Href };

type Props = { perfil: string; telas: TelaCatalogo[] };

/**
 * Mapa de telas — FERRAMENTA DE DESENVOLVIMENTO (só em __DEV__).
 * Abre qualquer tela do app direto, para conferir fidelidade com o mockup.
 */
export function MapaTelas({ perfil, telas }: Props) {
  const router = useRouter();

  if (!__DEV__) return null;

  return (
    <Screen header={<ScreenHeader title="Mapa de telas" subtitle={`${perfil} · somente em desenvolvimento.`} />}>
      <VStack gap="sm">
        <AppText variant="heading">
          {telas.length} telas
        </AppText>
        <Card>
          {telas.map((t, i) => (
            <VStack key={t.numero} gap="xxs">
              <ListRow title={`${t.numero} · ${t.nome}`} onPress={() => router.push(t.href)} />
              {i < telas.length - 1 ? <Divider /> : null}
            </VStack>
          ))}
        </Card>
      </VStack>
    </Screen>
  );
}
