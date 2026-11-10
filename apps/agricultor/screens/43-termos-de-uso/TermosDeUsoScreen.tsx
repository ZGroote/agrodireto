import { StyleSheet } from 'react-native';
import { AppText, Card, Screen, ScreenHeader, spacing, VStack } from '@agrodireto/ui';

/** Seções do documento. O texto jurídico oficial deve ser fornecido pelo negócio. */
const SECOES = [
  { titulo: '1. Sobre o AgroDireto', texto: 'O AgroDireto conecta agricultores a compradores, com origem comprovada e entrega rastreada.' },
  { titulo: '2. Cadastro e verificação', texto: 'Para vender, o agricultor informa seus dados, sua propriedade e seus documentos, que passam por validação.' },
  { titulo: '3. Ofertas, cotações e pedidos', texto: 'As ofertas publicadas seguem o padrão e o preço informados. Cotações e pedidos ficam registrados na plataforma.' },
  { titulo: '4. Pagamentos e repasses', texto: 'O repasse ao agricultor é liberado após a confirmação do recebimento, descontada a taxa da plataforma.' },
];

/** 43 · Termos de Uso — texto provisório até o jurídico fornecer a versão oficial. */
export default function TermosDeUsoScreen() {
  return (
    <Screen header={<ScreenHeader title="Termos de Uso" subtitle="Versão provisória, a revisar com o jurídico." />}>
      <Card>
        <VStack gap="lg">
          {SECOES.map((s) => (
            <VStack key={s.titulo} gap="xs">
              <AppText variant="heading">{s.titulo}</AppText>
              <AppText variant="body" color="textSecondary" style={styles.texto}>
                {s.texto}
              </AppText>
            </VStack>
          ))}
        </VStack>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  texto: { lineHeight: spacing.xl },
});
