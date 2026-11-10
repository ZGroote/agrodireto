import { Stack } from 'expo-router';
import { VoltarProvider } from '@agrodireto/ui';
import { rotasAdministrador } from '@/routes';

export default function Layout() {
  return (
    <VoltarProvider inicio={rotasAdministrador.onboarding}>
      <Stack screenOptions={{ headerShown: false }} />
    </VoltarProvider>
  );
}
