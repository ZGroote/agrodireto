import { Leaf, MapPin, Package, Star } from 'lucide-react-native';
import { Button, Card, EMPTY, ListRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';

/**
 * 19 · Catálogo e regiões — base usada por todos os perfis
 * (produtos do Agricultor, padrões dos filtros do Cliente, regiões das ofertas da Logística).
 */
export default function CatalogoRegioesScreen() {
  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Catálogo e regiões" />}
      // Edição de cada categoria: sem mockup — fase de dados.
      footer={<Button label="Editar categoria" />}
    >
      <VStack gap="sm">
        <Card>
          <ListRow icon={MapPin} title="Regiões" chevron />
        </Card>
        <Card>
          <ListRow icon={Leaf} title="Produtos e variedades" subtitle={EMPTY} chevron />
        </Card>
        <Card>
          <ListRow icon={Star} title="Padrões de qualidade" chevron />
        </Card>
        <Card>
          <ListRow icon={Package} title="Unidades e embalagens" chevron />
        </Card>
      </VStack>
    </Screen>
  );
}
