import { Stack, useLocalSearchParams } from 'expo-router';
import { LoteDraftProvider } from '@/lote/LoteDraftContext';

export default function Layout() {
  const { rascunhoId } = useLocalSearchParams<{ rascunhoId: string }>();
  return (
    <LoteDraftProvider key={rascunhoId} id={rascunhoId}>
      <Stack screenOptions={{ headerShown: false }} />
    </LoteDraftProvider>
  );
}
