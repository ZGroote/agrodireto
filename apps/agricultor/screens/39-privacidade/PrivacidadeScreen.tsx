import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Download, FileText, Shield, Trash2 } from 'lucide-react-native';
import { Card, Divider, ListRow, Screen, ScreenHeader, Toggle, VStack } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';

/** 39 · Privacidade — o que compradores veem e documentos legais. */
export default function PrivacidadeScreen() {
  const router = useRouter();
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [localizacao, setLocalizacao] = useState(true);
  const [drone, setDrone] = useState(true);

  return (
    <Screen withTabBar header={<ScreenHeader title="Privacidade" />}>
      <Card>
        <VStack gap="xs">
          <Toggle label="Perfil público da propriedade" description="Compradores aprovados veem nome, fotos e avaliações." value={perfilPublico} onChange={setPerfilPublico} />
          <Divider />
          <Toggle label="Localização aproximada" description="Mostra só a região (cidade · UF), nunca o endereço exato." value={localizacao} onChange={setLocalizacao} />
          <Divider />
          <Toggle label="Mídias de drone" description="Permite exibir vídeos e fotos aéreas no perfil." value={drone} onChange={setDrone} />
        </VStack>
      </Card>

      <Card>
        <ListRow icon={FileText} title="Termos de Uso" onPress={() => router.push(rotasAgricultor.termos)} />
        <Divider />
        <ListRow icon={Shield} title="Política de Privacidade" onPress={() => router.push(rotasAgricultor.politica)} />
      </Card>

      {/* Exportar e excluir dados (LGPD): fluxo no servidor, sem tela no mockup. */}
      <Card>
        <ListRow icon={Download} title="Baixar meus dados" chevron />
        <Divider />
        <ListRow icon={Trash2} title="Excluir minha conta" tone="danger" chevron />
      </Card>
    </Screen>
  );
}
