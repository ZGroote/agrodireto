import { StyleSheet } from 'react-native';
import { AppText, Card, Screen, ScreenHeader, spacing, VStack } from '@agrodireto/ui';

/** Seções do documento. O texto oficial (LGPD) deve ser fornecido pelo negócio. */
const SECOES = [
  { titulo: '1. Dados que coletamos', texto: 'Nome, telefone, dados da propriedade, documentos, fotos e vídeos enviados, e localização aproximada.' },
  { titulo: '2. Como usamos', texto: 'Para validar seu cadastro, publicar suas ofertas, rastrear entregas e processar repasses.' },
  { titulo: '3. Compartilhamento', texto: 'Compradores aprovados veem o perfil público da propriedade, conforme a visibilidade que você escolher.' },
  { titulo: '4. Seus direitos', texto: 'Você pode acessar, corrigir e solicitar a exclusão dos seus dados pelo suporte.' },
];

/** 44 · Política de Privacidade — texto provisório até o jurídico fornecer a versão oficial. */
export default function PoliticaPrivacidadeScreen() {
  return (
    <Screen header={<ScreenHeader title="Política de Privacidade" subtitle="Versão provisória, a revisar com o jurídico." />}>
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
