import { StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftRight,
  Bell,
  Building2,
  CircleHelp,
  Globe,
  Lock,
  LogOut,
  Receipt,
  Shield,
  Users,
} from 'lucide-react-native';
import { AppText, Card, colors, Divider, EMPTY, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { contextoAtual, listarVinculos, type Vinculo } from '@/lib/organizacoes';
import { rotasCliente } from '../../routes';

/** 24 · Configurações (tab Perfil) — empresa, equipe e preferências. */
export default function ConfiguracoesScreen() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Vinculo | null>(null);

  // Cabeçalho mostra a empresa em uso (B01); sem escolha ou com falha, fica vazio.
  useFocusEffect(useCallback(() => {
    let ativo = true;
    void Promise.all([listarVinculos(), contextoAtual()]).then(
      ([lista, contexto]) => { if (ativo) setEmpresa(lista.find((v) => v.organizacao_id === contexto) ?? null); },
      () => { if (ativo) setEmpresa(null); },
    );
    return () => { ativo = false; };
  }, []));

  return (
    <Screen withTabBar header={<ScreenHeader title="Configurações" />}>
      <View style={styles.company}>
        <View style={styles.avatar}>
          <Building2 size={sizes.iconMd} color={colors.primary} />
        </View>
        <View>
          <AppText variant="heading">{empresa?.nome ?? EMPTY}</AppText>
          <AppText variant="caption" color="textSecondary">
            {empresa ? (empresa.papel === 'titular' ? 'Titular' : 'Membro') : EMPTY}
          </AppText>
        </View>
      </View>

      {/* Sub-telas sem mockup (Notificações, Privacidade, Segurança, Região, Ajuda) — fases seguintes. Equipe e Trocar empresa: 29 e 28. */}
      <Card>
        <ListRow icon={Users} title="Equipe e permissões" onPress={() => router.push(rotasCliente.equipe)} />
        <Divider />
        <ListRow icon={ArrowLeftRight} title="Trocar empresa" onPress={() => router.push(rotasCliente.empresas)} />
        <Divider />
        <ListRow icon={Bell} title="Notificações" chevron />
        <Divider />
        <ListRow icon={Shield} title="Privacidade" chevron />
        <Divider />
        <ListRow icon={Lock} title="Segurança" chevron />
        <Divider />
        <ListRow icon={Globe} title="Região e idioma" subtitle="Brasil · Português (BR)" chevron />
        <Divider />
        <ListRow icon={CircleHelp} title="Ajuda" chevron />
        <Divider />
        {/* Não está no mockup: único acesso à 22 · Faturas e financeiro. */}
        <ListRow icon={Receipt} title="Faturas e financeiro" onPress={() => router.push(rotasCliente.faturas)} />
        <Divider />
        <ListRow icon={LogOut} title="Sair" tone="danger" chevron={false} onPress={() => {
          void supabase?.auth.signOut({ scope: 'local' });
        }} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  company: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
