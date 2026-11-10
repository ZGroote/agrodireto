import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, Camera, MapPin, MonitorSmartphone, type LucideIcon } from 'lucide-react-native';
import { Card, colors, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing, Toggle } from '@agrodireto/ui';

/**
 * 23 · Privacidade (dentro da tab Perfil) — permissões por operação, sessões e troca de conta.
 * Os toggles começam desligados: nenhuma permissão foi concedida ainda.
 */
export default function PrivacidadeScreen() {
  const router = useRouter();
  // Com expo-location / expo-image-picker, os toggles refletem e pedem a permissão do sistema.
  const [localizacao, setLocalizacao] = useState(false);
  const [evidencias, setEvidencias] = useState(false);

  return (
    <Screen withTabBar header={<ScreenHeader title="Privacidade" />}>
      <Card>
        <PermissionRow
          icon={MapPin}
          value={localizacao}
          onChange={setLocalizacao}
          label="Localização durante a viagem"
          description="Usada para rota, ETA e registro de ocorrências nesta operação."
        />
      </Card>
      <Card>
        <PermissionRow
          icon={Camera}
          value={evidencias}
          onChange={setEvidencias}
          label="Permitir evidências (fotos e assinatura)"
          description="Usada para comprovar coleta e entrega."
        />
      </Card>
      <Card>
        {/* Gestão de sessões: sem mockup — fase de autenticação. */}
        <ListRow icon={MonitorSmartphone} title="Sessões ativas" subtitle={EMPTY} chevron />
      </Card>
      <Card>
        <ListRow icon={ArrowLeftRight} title="Trocar conta" onPress={() => router.dismissTo('/')} />
      </Card>
    </Screen>
  );
}

type PermissionRowProps = {
  icon: LucideIcon;
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
};

function PermissionRow({ icon: Icon, ...toggle }: PermissionRowProps) {
  return (
    <View style={styles.row}>
      <Icon size={sizes.iconMd} color={colors.textPrimary} />
      <View style={styles.flex}>
        <Toggle {...toggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
});
