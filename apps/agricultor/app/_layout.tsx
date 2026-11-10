import { Stack } from 'expo-router';
import { AppProviders, colors } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';

export default function RootLayout() {
  return (
    <AppProviders inicio={rotasAgricultor.inicio}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(pre-auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="telas" />
      </Stack>
    </AppProviders>
  );
}
