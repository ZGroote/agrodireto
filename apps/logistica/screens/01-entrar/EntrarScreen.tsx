import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Button, Logo, Screen, spacing, TextLink } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

export default function EntrarScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.logo}>
        <Logo subtitle="Logística" />
      </View>
      <AppText variant="title">Prévia da logística</AppText>
      <Button label="Abrir prévia" onPress={() => router.replace(rotasLogistica.inicio)} />
      <TextLink label="Ver cadastro de transportadora" onPress={() => router.push(rotasLogistica.transportadora)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
});
