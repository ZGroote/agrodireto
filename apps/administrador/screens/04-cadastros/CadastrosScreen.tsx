import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

type Aba = 'agricultores' | 'compradores';

/**
 * 04 · Cadastros (tab) — agricultores e compradores por status.
 * Item: Card + ListRow com ícone, nome, cidade · UF e StatusPill (Em análise = warning, Ativo = success).
 */
export default function CadastrosScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('agricultores');
  // Lista virá do Supabase.
  const cadastros: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Cadastros" />}
      footer={<Button label="Analisar cadastro" onPress={() => router.push(rotasAdministrador.analisarCadastro())} />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'agricultores', label: 'Agricultores' },
          { key: 'compradores', label: 'Compradores' },
        ]}
      />
      {cadastros.length === 0 ? (
        <EmptyState icon={Building2} title={aba === 'agricultores' ? 'Nenhum agricultor cadastrado' : 'Nenhum comprador cadastrado'} />
      ) : null}
    </Screen>
  );
}
