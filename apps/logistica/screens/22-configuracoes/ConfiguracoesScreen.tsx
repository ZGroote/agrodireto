import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, CircleHelp, History, LogOut, ShieldCheck, User, Wallet } from 'lucide-react-native';
import { AppText, Card, colors, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing, VStack } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';
import { rotasLogistica } from '../../routes';

/** 22 · Configurações (tab Perfil) — conta e preferências. */
export default function ConfiguracoesScreen() {
  const router = useRouter();

  // Sem sessão, o layout de (app) já manda para Entrar; voltar ao início evita a pilha antiga.
  async function sair() {
    await supabase?.auth.signOut();
    router.dismissTo('/');
  }

  return (
    <Screen withTabBar header={<ScreenHeader title="Configurações" />}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <User size={sizes.iconMd} color={colors.textSecondary} />
        </View>
        <View>
          <AppText variant="heading">{EMPTY}</AppText>
          <AppText variant="caption" color="textSecondary">
            {EMPTY}
          </AppText>
        </View>
      </View>

      <VStack gap="sm">
        {/* Notificações e Ajuda: sem mockup — fases seguintes. */}
        <Card>
          <ListRow icon={Bell} title="Notificações" chevron />
        </Card>
        <Card>
          <ListRow icon={CircleHelp} title="Ajuda" chevron />
        </Card>
        <Card>
          <ListRow icon={User} title="Conta" onPress={() => router.push(rotasLogistica.transportadora)} />
        </Card>
        <Card>
          <ListRow icon={ShieldCheck} title="Privacidade e segurança" onPress={() => router.push(rotasLogistica.privacidade)} />
        </Card>
      </VStack>

      {/* Não estão no mockup: únicos acessos a 19 · Histórico e 20 · Repasses fora do fluxo da viagem. */}
      <VStack gap="sm">
        <Card>
          <ListRow icon={History} title="Histórico de viagens" onPress={() => router.push(rotasLogistica.historico)} />
        </Card>
        <Card>
          <ListRow icon={Wallet} title="Repasses" onPress={() => router.push(rotasLogistica.repasses)} />
        </Card>
      </VStack>

      <Card>
        <ListRow icon={LogOut} title="Sair" tone="danger" chevron={false} onPress={() => void sair()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
