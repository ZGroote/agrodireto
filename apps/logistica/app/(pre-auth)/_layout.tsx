import { Stack } from 'expo-router';
import { VoltarProvider } from '@agrodireto/ui';
import { rotasLogistica } from '@/routes';

export default function Layout() {
  return (
    <VoltarProvider inicio={rotasLogistica.onboarding}>
      <Stack screenOptions={{ headerShown: false }} />
    </VoltarProvider>
  );
}
