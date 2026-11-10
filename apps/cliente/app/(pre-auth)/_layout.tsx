import { Stack } from 'expo-router';
import { VoltarProvider } from '@agrodireto/ui';
import { rotasCliente } from '@/routes';

export default function Layout() {
  return (
    <VoltarProvider inicio={rotasCliente.onboarding}>
      <Stack screenOptions={{ headerShown: false }} />
    </VoltarProvider>
  );
}
