import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MessageCircle, Truck, User } from 'lucide-react-native';
import { AppText, brl, Button, Card, colors, Divider, HighlightCard, ListRow, Screen, ScreenHeader, sizes, spacing } from '@agrodireto/ui';
import { useAgricultor, useCotacoes, useFinanceiro, usePedido } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 07 · Início (tab) — o que exige ação hoje. Primeira tela depois do login: sem botão voltar. */
export default function InicioScreen() {
  const router = useRouter();
  const a = useAgricultor();
  const cotacoes = useCotacoes();
  const pedido = usePedido();
  const { aReceber } = useFinanceiro();
  const horaColeta = pedido.retirada.match(/\d{2}h/)?.[0];

  return (
    <Screen
      withTabBar
      header={
        <ScreenHeader
          back={false}
          title="Início"
          action={{ icon: Bell, label: 'Notificações', onPress: () => router.push(rotasAgricultor.notificacoes) }}
        />
      }
      footer={<Button label="Publicar lote" onPress={() => router.push(rotasAgricultor.novoLote)} />}
    >
      <View style={styles.hello}>
        <View style={styles.avatar}>
          <User size={sizes.iconMd} color={colors.textSecondary} />
        </View>
        <View>
          <AppText variant="heading">Olá, {a.nome}</AppText>
          <AppText variant="caption" color="textSecondary">
            {a.propriedade} · {a.cidade} · {a.uf}
          </AppText>
        </View>
      </View>

      <HighlightCard label="A receber" value={brl(aReceber)} onPress={() => router.push(rotasAgricultor.financeiro)} />

      <Card>
        <ListRow
          icon={MessageCircle}
          title={cotacoes.length > 0 ? `${cotacoes.length} cotação para responder` : 'Nenhuma cotação para responder'}
          onPress={() => router.navigate(rotasAgricultor.cotacoes)}
        />
        <Divider />
        <ListRow
          icon={Truck}
          title={`Coleta hoje${horaColeta ? ` · ${horaColeta}` : ''}`}
          subtitle={`${pedido.id} · ${pedido.cargaId}`}
          onPress={() => router.navigate(rotasAgricultor.pedidos)}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: sizes.avatar + spacing.sm,
    height: sizes.avatar + spacing.sm,
    borderRadius: (sizes.avatar + spacing.sm) / 2,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
