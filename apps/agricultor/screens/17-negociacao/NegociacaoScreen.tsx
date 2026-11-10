import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Package, Tag } from 'lucide-react-native';
import { brl, Button, ChatBubble, colors, kg, Screen, ScreenHeader, sizes, spacing, TextLink, AppText } from '@agrodireto/ui';
import { useCotacao, useNegociacao } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 17 · Negociação — histórico de propostas (imutável, PRD 8.7) e termos atuais. Param: ?id= (cotação) */
export default function NegociacaoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const cotacao = useCotacao(id);
  const negociacao = useNegociacao();

  const aceitar = () => {
    // Aceite real: Edge Function cria o pedido (nunca no client). Aqui, abre o pedido de exemplo.
    router.dismissAll();
    router.navigate(rotasAgricultor.pedidos);
  };

  return (
    <Screen
      header={<ScreenHeader title={`${cotacao.id} · ${cotacao.loteId}`} subtitle={`${cotacao.comprador} · Oferta v${cotacao.versao}`} />}
      footer={
        <>
          <Button label="Aceitar proposta" onPress={aceitar} />
          <TextLink label="Contrapropor" onPress={() => router.push(rotasAgricultor.contraproposta({ id: cotacao.id }))} />
        </>
      }
    >
      <View style={styles.chat}>
        {negociacao.mensagens.map((m) => (
          <ChatBubble key={m.id} author={m.autor} time={m.hora} text={m.texto} mine={m.minha} />
        ))}
      </View>

      <View style={styles.termos}>
        <Termo icon={Package} rotulo="Quantidade:" valor={kg(cotacao.quantidadeKg)} />
        <Termo icon={Tag} rotulo="Preço:" valor={`${brl(cotacao.precoKg, { centavos: true })}/kg`} />
        <Termo icon={Calendar} rotulo="Retirada:" valor={negociacao.retirada} />
      </View>
    </Screen>
  );
}

function Termo({ icon: Icon, rotulo, valor }: { icon: typeof Package; rotulo: string; valor: string }) {
  return (
    <View style={styles.termo}>
      <Icon size={sizes.iconMd} color={colors.textSecondary} />
      <AppText variant="body" color="textSecondary" style={styles.flex}>
        {rotulo}
      </AppText>
      <AppText variant="bodyStrong">{valor}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chat: { gap: spacing.md },
  termos: { gap: spacing.md },
  termo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
});
