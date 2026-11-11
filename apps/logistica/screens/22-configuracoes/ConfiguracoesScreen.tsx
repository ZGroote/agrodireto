import { StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeftRight, Bell, CircleHelp, History, LogOut, ShieldCheck, User, Users, Wallet } from 'lucide-react-native';
import { AppText, Card, colors, Divider, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing, VStack } from '@agrodireto/ui';
import { contextoAtual, listarVinculos, type Vinculo } from '@/lib/organizacoes';
import { supabase } from '@/lib/supabase';
import { rotasLogistica } from '../../routes';

/** 22 · Configurações (tab Perfil) — conta e preferências. */
export default function ConfiguracoesScreen() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Vinculo | null>(null);

  // Cabeçalho mostra a transportadora em uso (B01); sem escolha ou com falha, fica vazio.
  useFocusEffect(useCallback(() => {
    let ativo = true;
    void Promise.all([listarVinculos(), contextoAtual()]).then(
      ([lista, contexto]) => { if (ativo) setEmpresa(lista.find((v) => v.organizacao_id === contexto) ?? null); },
      () => { if (ativo) setEmpresa(null); },
    );
    return () => { ativo = false; };
  }, []));

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
          <AppText variant="heading">{empresa?.nome ?? EMPTY}</AppText>
          <AppText variant="caption" color="textSecondary">
            {empresa ? (empresa.papel === 'titular' ? 'Titular' : 'Membro') : EMPTY}
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

      {/* Não está no mockup: empresa em uso e equipe (B01, telas 25 e 26). */}
      <Card>
        <ListRow icon={ArrowLeftRight} title="Trocar empresa" onPress={() => router.push(rotasLogistica.empresas)} />
        <Divider />
        <ListRow icon={Users} title="Equipe e permissões" onPress={() => router.push(rotasLogistica.equipe)} />
      </Card>

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
