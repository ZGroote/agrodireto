import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Bell, Camera, CircleHelp, Cloud, FileText, Landmark, LogOut, RefreshCw, ShieldAlert, ShieldCheck, User } from 'lucide-react-native';
import { AppText, Button, Card, colors, Divider, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { useAgricultor, useSincronizacao } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 24 · Configurações (tab Perfil) — conta, preferências e sincronização offline. */
export default function ConfiguracoesScreen() {
  const router = useRouter();
  const a = useAgricultor();
  const sync = useSincronizacao();
  const [pendentes, setPendentes] = useState(sync.pendentes);
  const [ultima, setUltima] = useState(sync.ultima);

  const sincronizar = () => {
    // Sincronização real: envia a fila local (AsyncStorage) ao Supabase.
    setPendentes(0);
    const d = new Date();
    setUltima(`${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`);
  };

  return (
    <Screen withTabBar header={<ScreenHeader title="Configurações" />}>
      <Card>
        <ListRow
          title={a.nome}
          subtitle={`${a.propriedade} · ${a.cidade} · ${a.uf}`}
          leading={
            <View style={styles.avatar}>
              <User size={sizes.iconMd} color={colors.textSecondary} />
            </View>
          }
          onPress={() => router.push(rotasAgricultor.propriedade)}
        />
      </Card>

      <View>
        <ListRow icon={Bell} title="Notificações" onPress={() => router.push(rotasAgricultor.preferenciasNotificacao)} />
        <Divider />
        <ListRow icon={ShieldCheck} title="Privacidade" onPress={() => router.push(rotasAgricultor.privacidade)} />
        <Divider />
        <ListRow icon={ShieldAlert} title="Segurança" onPress={() => router.push(rotasAgricultor.seguranca)} />
        <Divider />
        <ListRow icon={CircleHelp} title="Ajuda" onPress={() => router.push(rotasAgricultor.ajuda)} />
      </View>

      {/* Não está no mockup: atalhos para as telas de cadastro (04, 05, 06 e 25). */}
      <Card>
        <ListRow icon={Camera} title="Fotos e vídeos" onPress={() => router.push(rotasAgricultor.midias)} />
        <Divider />
        <ListRow icon={FileText} title="Documentos" onPress={() => router.push(rotasAgricultor.documentos)} />
        <Divider />
        <ListRow icon={Landmark} title="Dados bancários" onPress={() => router.push(rotasAgricultor.dadosBancarios)} />
      </Card>

      <Card tone="soft">
        <View style={styles.sync}>
          <Cloud size={sizes.iconLg} color={colors.primary} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">
              Salvo no aparelho · {pendentes} {pendentes === 1 ? 'envio pendente' : 'envios pendentes'}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Última sincronização: {ultima}
            </AppText>
          </View>
        </View>
        <Button label="Sincronizar" variant="secondary" icon={RefreshCw} onPress={sincronizar} />
      </Card>

      {/* Sair não está no mockup: é a saída do app (volta ao Onboarding). */}
      <Card>
        <ListRow icon={LogOut} title="Sair" tone="danger" chevron={false} onPress={() => {
          void supabase?.auth.signOut({ scope: 'local' }).then(({ error }) => {
            if (!error) router.dismissTo('/entrar');
          });
        }} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatar: {
    width: sizes.avatar + spacing.sm,
    height: sizes.avatar + spacing.sm,
    borderRadius: (sizes.avatar + spacing.sm) / 2,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sync: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
