import { useState } from 'react';
import { Monitor, Phone, ShieldAlert } from 'lucide-react-native';
import { Card, Divider, ListRow, Screen, ScreenHeader, Toggle, VStack } from '@agrodireto/ui';
import { useAgricultor } from '@/hooks/dados';

/** 40 · Segurança — telefone, sessões ativas e verificação em duas etapas. */
export default function SegurancaScreen() {
  const a = useAgricultor();
  const [duasEtapas, setDuasEtapas] = useState(false);

  return (
    <Screen withTabBar header={<ScreenHeader title="Segurança" />}>
      <Card>
        <ListRow icon={Phone} title="Telefone de acesso" subtitle={a.telefone} chevron />
        <Divider />
        <ListRow icon={Monitor} title="Sessões ativas" subtitle="Este aparelho · agora" chevron />
      </Card>

      <Card>
        <VStack gap="xs">
          <Toggle label="Verificação em duas etapas" description="Pede um código extra ao entrar em um aparelho novo." value={duasEtapas} onChange={setDuasEtapas} />
        </VStack>
      </Card>

      <Card>
        <ListRow icon={ShieldAlert} title="Sair de todos os aparelhos" tone="danger" chevron />
      </Card>
    </Screen>
  );
}
