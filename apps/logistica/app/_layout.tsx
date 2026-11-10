import { Stack } from 'expo-router';
import { AppProviders, colors } from '@agrodireto/ui';
import { rotasLogistica } from '@/routes';

export default function RootLayout() {
  return (
    <AppProviders inicio={rotasLogistica.inicio}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(pre-auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="telas" />
      </Stack>
    </AppProviders>
  );
}
