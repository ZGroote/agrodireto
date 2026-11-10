import { useRouter } from 'expo-router';
import { FileCheck, IdCard } from 'lucide-react-native';
import { Button, Card, ListRow, Screen, ScreenHeader } from '@agrodireto/ui';
import { documentosCadastro } from '@/lib/tiposDocumento';
import { rotasAgricultor } from '@/routes';

export default function DocumentosScreen() {
  const router = useRouter();

  return (
    <Screen
      header={<ScreenHeader title="Documentos" subtitle="Confira uma foto antes do envio." />}
      footer={<Button label="Preparar documento" onPress={() => router.push(rotasAgricultor.enviarDocumento())} />}
    >
      {documentosCadastro.map((doc) => (
        <Card key={doc.id}>
          <ListRow
            icon={doc.id === 'identificacao' ? IdCard : FileCheck}
            title={doc.titulo}
            subtitle="Aguardando envio"
            onPress={() => router.push(rotasAgricultor.enviarDocumento({ documento: doc.id }))}
          />
        </Card>
      ))}
    </Screen>
  );
}
