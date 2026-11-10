import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2, Headset } from 'lucide-react-native';
import { MessageInput, Screen, ScreenHeader, SegmentedControl, VStack } from '@agrodireto/ui';
import { ConversaCabecalho, ConversaMensagens } from '@/components/Conversa';
import { useAgricultor, useConversas, useSuporte } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';
import type { Mensagem } from '@/types';

type Aba = 'conversas' | 'suporte';

/** 23 · Mensagens (tab) — conversa do pedido com o comprador e chat de suporte. Param: ?conversa= */
export default function MensagensScreen() {
  const router = useRouter();
  const { conversa: id } = useLocalSearchParams<{ conversa?: string }>();
  const a = useAgricultor();
  const conversas = useConversas();
  const suporte = useSuporte();
  const [aba, setAba] = useState<Aba>(id === 'suporte' ? 'suporte' : 'conversas');
  const [texto, setTexto] = useState('');
  const [extras, setExtras] = useState<Record<string, Mensagem[]>>({});

  const atual = aba === 'suporte' ? suporte : (conversas.find((c) => c.id === id) ?? conversas[0]);
  const mensagens = [...atual.mensagens, ...(extras[atual.id] ?? [])];

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    // Envio real: insert no Supabase (Realtime). Aqui só acrescenta o balão na tela.
    const m: Mensagem = { id: `local-${Date.now()}`, autor: a.nome, hora: 'agora', texto: t, minha: true };
    setExtras((e) => ({ ...e, [atual.id]: [...(e[atual.id] ?? []), m] }));
    setTexto('');
  };

  return (
    <Screen
      withTabBar
      header={<ScreenHeader title="Mensagens" />}
      footer={<MessageInput value={texto} onChangeText={setTexto} onSend={enviar} onAttach={() => undefined} />}
    >
      <SegmentedControl
        value={aba}
        onChange={setAba}
        segments={[
          { key: 'conversas', label: 'Conversas' },
          { key: 'suporte', label: 'Suporte' },
        ]}
      />
      <VStack gap="md">
        <ConversaCabecalho
          conversa={atual}
          icon={aba === 'suporte' ? Headset : Building2}
          onPress={aba === 'conversas' ? () => router.push(rotasAgricultor.conversas) : undefined}
        />
        <ConversaMensagens mensagens={mensagens} />
      </VStack>
    </Screen>
  );
}
