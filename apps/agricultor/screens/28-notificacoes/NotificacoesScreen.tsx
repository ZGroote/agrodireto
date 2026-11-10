import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Bell, CheckCheck, FileWarning, MessageCircle, Truck, Wallet, type LucideIcon } from 'lucide-react-native';
import { AppText, Card, colors, EmptyState, Screen, ScreenHeader, sizes, spacing, VStack } from '@agrodireto/ui';
import { useNotificacoes } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';
import type { Notificacao } from '@/types';

const ICONES: Record<Notificacao['tipo'], LucideIcon> = {
  cotacao: MessageCircle,
  pedido: Wallet,
  documento: FileWarning,
  coleta: Truck,
};

const DESTINOS: Record<Notificacao['tipo'], Href> = {
  cotacao: rotasAgricultor.cotacoes,
  pedido: rotasAgricultor.pedidos,
  documento: rotasAgricultor.documentos,
  coleta: rotasAgricultor.pedidos,
};

/** 28 · Central de notificações (sino do Início) — avisos de cotações, pedidos, documentos e coletas. */
export default function NotificacoesScreen() {
  const router = useRouter();
  const todas = useNotificacoes();
  const [lidas, setLidas] = useState<string[]>(todas.filter((n) => n.lida).map((n) => n.id));

  return (
    <Screen
      header={
        <ScreenHeader
          title="Notificações"
          action={{ icon: CheckCheck, label: 'Marcar todas como lidas', onPress: () => setLidas(todas.map((n) => n.id)) }}
        />
      }
    >
      {todas.length === 0 ? (
        <EmptyState icon={Bell} title="Nenhuma notificação" />
      ) : (
        <VStack gap="sm">
          {todas.map((n) => {
            const Icon = ICONES[n.tipo];
            const lida = lidas.includes(n.id);
            return (
              <Card
                key={n.id}
                onPress={() => {
                  setLidas((l) => (l.includes(n.id) ? l : [...l, n.id]));
                  router.push(DESTINOS[n.tipo]);
                }}
              >
                <View style={styles.row}>
                  <Icon size={sizes.iconLg} color={colors.primary} />
                  <View style={styles.flex}>
                    <AppText variant={lida ? 'body' : 'bodyStrong'}>{n.titulo}</AppText>
                    <AppText variant="caption" color="textSecondary">
                      {n.texto}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {n.quando}
                    </AppText>
                  </View>
                  {!lida ? <View style={styles.ponto} /> : null}
                </View>
              </Card>
            );
          })}
        </VStack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
