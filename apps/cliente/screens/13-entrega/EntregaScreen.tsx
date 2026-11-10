import { useState } from 'react';
import { useRouter } from 'expo-router';
import { CalendarDays, MapPin, User } from 'lucide-react-native';
import { Button, Card, EMPTY, ListRow, Screen, ScreenHeader, TextArea } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

/** 13 · Entrega — local, data/horário, responsável e observação para o recebimento. */
export default function EntregaScreen() {
  const router = useRouter();
  const [observacao, setObservacao] = useState('');

  return (
    <Screen header={<ScreenHeader title="Entrega" />} footer={<Button label="Salvar entrega" onPress={() => router.push(rotasCliente.confirmarPedido)} />}>
      {/* Local, data e responsável vêm do cadastro da empresa e da oferta; edição sem mockup. */}
      <Card>
        <ListRow icon={MapPin} title="Local de entrega" subtitle={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={CalendarDays} title="Data e horário" subtitle={EMPTY} />
      </Card>
      <Card>
        <ListRow icon={User} title="Responsável" subtitle={EMPTY} />
      </Card>

      <TextArea label="Observação (opcional)" value={observacao} onChangeText={setObservacao} placeholder="Ex.: instruções de recebimento" maxLength={120} />
    </Screen>
  );
}
