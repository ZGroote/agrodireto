import { useState } from 'react';
import { Users } from 'lucide-react-native';
import { Button, EmptyState, Screen, ScreenHeader, SegmentedControl } from '@agrodireto/ui';

type Aba = 'usuarios' | 'empresas';

/**
 * 17 · Usuários e empresas — contas da plataforma.
 * Item: Card + ListRow com avatar, nome, papel e StatusPill (Ativo = success).
 */
export default function UsuariosEmpresasScreen() {
  const [aba, setAba] = useState<Aba>('usuarios');
  // Lista virá do Supabase.
  const itens: never[] = [];

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Usuários e empresas" />}
      // Convite (e-mail com link de acesso): sem mockup — fase de autenticação.
      footer={<Button label="Convidar usuário" />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'usuarios', label: 'Usuários' },
          { key: 'empresas', label: 'Empresas' },
        ]}
      />
      {itens.length === 0 ? <EmptyState icon={Users} title={aba === 'usuarios' ? 'Nenhum usuário' : 'Nenhuma empresa'} /> : null}
    </Screen>
  );
}
