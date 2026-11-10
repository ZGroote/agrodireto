import { Stack } from 'expo-router';
import { LoteDraftProvider } from '@/lote/LoteDraftContext';

/** Telas 11 → 14 compartilham o rascunho do lote. */
export default function Layout() {
  return (
    <LoteDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LoteDraftProvider>
  );
}
