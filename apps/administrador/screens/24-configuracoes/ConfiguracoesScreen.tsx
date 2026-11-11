import { StyleSheet, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, type Href } from 'expo-router';
import {
  Bell,
  Building2,
  CircleHelp,
  FolderTree,
  History,
  Lock,
  LogOut,
  Megaphone,
  Plug,
  Scale,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react-native';
import { AppText, Card, colors, Divider, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';
import { usePode } from '@/components/PapelEquipe';

/** 24 · Configurações (tab Perfil) — conta, empresa ativa, segurança e administração da plataforma. */
export default function ConfiguracoesScreen() {
  const router = useRouter();
  const ir = (href: Href) => () => router.push(href);
  const permitido = usePode();
  const geral = permitido('sem_acao_no_servidor');

  return (
    <Screen withTabBar header={<ScreenHeader title="Configurações" />}>
      <Card>
        <ListRow
          title={EMPTY}
          subtitle={EMPTY}
          leading={
            <View style={styles.avatar}>
              <User size={sizes.iconMd} color={colors.textSecondary} />
            </View>
          }
          chevron
        />
      </Card>

      <View style={styles.section}>
        <AppText variant="label">Empresa ativa</AppText>
        <Card>
          <ListRow icon={Building2} title="AgroDireto" subtitle={EMPTY} />
        </Card>
      </View>

      {/* Sub-telas sem mockup (Notificações, Privacidade, Segurança, MFA, Ajuda) — fases seguintes. */}
      <Card>
        <ListRow icon={Bell} title="Notificações" chevron />
        <Divider />
        <ListRow icon={Shield} title="Privacidade" chevron />
        <Divider />
        <ListRow icon={Lock} title="Segurança e sessões" chevron />
        <Divider />
        <Divider />
        <ListRow icon={CircleHelp} title="Ajuda e suporte" chevron />
      </Card>

      {/* Não está no mockup: únicos acessos às telas 17–23 (o mockup mostra a tab bar nelas). Cada linha só para o papel que pode (B05). */}
      {(geral || permitido('ler_equipe')) && (
        <View style={styles.section}>
          <AppText variant="label">Administração</AppText>
          <Card>
            {geral && (
              <>
                <ListRow icon={Users} title="Usuários e empresas" onPress={ir(rotasAdministrador.usuarios)} />
                <Divider />
              </>
            )}
            {permitido('ler_equipe') && <ListRow icon={ShieldCheck} title="Papéis e permissões" onPress={ir(rotasAdministrador.papeis)} />}
            {geral && (
              <>
                <Divider />
                <ListRow icon={FolderTree} title="Catálogo e regiões" onPress={ir(rotasAdministrador.catalogo)} />
                <Divider />
                <ListRow icon={Scale} title="Regras da operação" onPress={ir(rotasAdministrador.regras)} />
                <Divider />
                <ListRow icon={Megaphone} title="Conteúdo e notificações" onPress={ir(rotasAdministrador.conteudo)} />
                <Divider />
                <ListRow icon={Plug} title="Integrações" onPress={ir(rotasAdministrador.integracoes)} />
                <Divider />
                <ListRow icon={History} title="Auditoria" onPress={ir(rotasAdministrador.auditoria)} />
              </>
            )}
          </Card>
        </View>
      )}

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
  section: { gap: spacing.sm },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
