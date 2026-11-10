import { useRouter } from 'expo-router';
import { IdCard, ShieldCheck } from 'lucide-react-native';
import { Button, Card, ListRow, Screen, ScreenHeader, VerifiedBadge } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/**
 * 05 · Documentos — documentos exigidos da operação (catálogo do produto).
 * Status e validade virão do Supabase; sem dados, todos "Não enviado".
 */
export default function DocumentosScreen() {
  const router = useRouter();

  return (
    <Screen
      header={<ScreenHeader title="Documentos" />}
      footer={
        <>
          {/* Envio exige expo-document-picker (aprovação pendente). */}
          <Button label="Enviar documento" />
          <Button label="Concluir cadastro" variant="secondary" onPress={() => router.dismissTo(rotasLogistica.inicio)} />
        </>
      }
    >
      <Card>
        <ListRow icon={IdCard} title="CNH" below={<VerifiedBadge label="Não enviado" tone="warning" />} chevron />
      </Card>
      <Card>
        <ListRow icon={ShieldCheck} title="Seguro do veículo" below={<VerifiedBadge label="Não enviado" tone="warning" />} chevron />
      </Card>
    </Screen>
  );
}
