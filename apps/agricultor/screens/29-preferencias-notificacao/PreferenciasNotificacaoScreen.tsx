import { useState } from 'react';
import { AppText, Card, Divider, Screen, ScreenHeader, Toggle, VStack } from '@agrodireto/ui';

const TIPOS = [
  { id: 'cotacoes', label: 'Cotações recebidas', descricao: 'Quando um comprador pedir cotação dos seus lotes.' },
  { id: 'pedidos', label: 'Pedidos e pagamentos', descricao: 'Pedido confirmado, pagamento autorizado e repasse.' },
  { id: 'coleta', label: 'Coleta e transporte', descricao: 'Horário da coleta e andamento da entrega.' },
  { id: 'documentos', label: 'Documentos a vencer', descricao: 'Aviso antes da validade dos seus documentos.' },
  { id: 'mensagens', label: 'Mensagens', descricao: 'Novas mensagens de compradores e do suporte.' },
];

const CANAIS = [
  { id: 'push', label: 'Notificações no aparelho (push)' },
  { id: 'sms', label: 'SMS' },
];

/** 29 · Preferências de notificação — o que e por onde receber. Gravação no Supabase na fase de dados. */
export default function PreferenciasNotificacaoScreen() {
  const [ativos, setAtivos] = useState<Record<string, boolean>>({
    cotacoes: true,
    pedidos: true,
    coleta: true,
    documentos: true,
    mensagens: false,
    push: true,
    sms: false,
  });
  const alternar = (id: string) => (v: boolean) => setAtivos((a) => ({ ...a, [id]: v }));

  return (
    <Screen withTabBar header={<ScreenHeader title="Notificações" subtitle="Escolha o que você quer receber." />}>
      <VStack gap="sm">
        <AppText variant="heading">O que receber</AppText>
        <Card>
          {TIPOS.map((t, i) => (
            <VStack key={t.id} gap="xs">
              <Toggle label={t.label} description={t.descricao} value={ativos[t.id]} onChange={alternar(t.id)} />
              {i < TIPOS.length - 1 ? <Divider /> : null}
            </VStack>
          ))}
        </Card>
      </VStack>

      <VStack gap="sm">
        <AppText variant="heading">Por onde receber</AppText>
        <Card>
          {CANAIS.map((c, i) => (
            <VStack key={c.id} gap="xs">
              <Toggle label={c.label} value={ativos[c.id]} onChange={alternar(c.id)} />
              {i < CANAIS.length - 1 ? <Divider /> : null}
            </VStack>
          ))}
        </Card>
      </VStack>
    </Screen>
  );
}
