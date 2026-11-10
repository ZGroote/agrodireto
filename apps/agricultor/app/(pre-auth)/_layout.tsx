import { Stack } from 'expo-router';
import { VoltarProvider } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';

export default function Layout() {
  return (
    <VoltarProvider inicio={rotasAgricultor.onboarding}>
      <Stack screenOptions={{ headerShown: false }} />
    </VoltarProvider>
  );
}
