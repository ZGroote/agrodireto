import { useState } from 'react';
import { Heart } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';

type Aba = 'produtos' | 'fornecedores';

/**
 * 11 · Favoritos — produtos e fornecedores salvos.
 * Item: Card com MediaThumb, produto, fornecedor · cidade, "Ver oferta" e coração (desfavoritar).
 */
export default function FavoritosScreen() {
  const [aba, setAba] = useState<Aba>('produtos');
  // Favoritos virão do Supabase.
  const favoritos: never[] = [];

  return (
    <Screen withTabBar header={<ScreenHeader title="Favoritos" />}>
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'produtos', label: 'Produtos', count: favoritos.length },
          { key: 'fornecedores', label: 'Fornecedores', count: 0 },
        ]}
      />
      <EmptyState
        icon={Heart}
        title={aba === 'produtos' ? 'Nenhum produto favorito' : 'Nenhum fornecedor favorito'}
        description="Toque no coração de uma oferta ou fornecedor para salvar aqui."
      />
    </Screen>
  );
}
