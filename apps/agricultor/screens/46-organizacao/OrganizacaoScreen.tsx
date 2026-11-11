import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Building2, Mail, UserPlus } from 'lucide-react-native';
import { AppText, Button, Card, Divider, EmptyState, ListRow, Screen, ScreenHeader, SectionTitle, StatusPill, TextField, VStack } from '@agrodireto/ui';
import { contextoAtual, incluirMembro, listarVinculos, trocarContexto, type Vinculo } from '@/lib/organizacoes';

const confirmacaoNeutra = 'Solicitação processada. Se a conta existir, o vínculo estará disponível.';

/** 46 · Organização — escolha explícita da organização (troca auditada no servidor) e inclusão de membro pelo titular. */
export default function OrganizacaoScreen() {
  const [vinculos, setVinculos] = useState<Vinculo[] | null>(null);
  const [atual, setAtual] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [trocando, setTrocando] = useState(false);
  const [email, setEmail] = useState('');
  const [incluindo, setIncluindo] = useState(false);
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(() => {
    let ativo = true;
    setErro('');
    void Promise.all([listarVinculos(), contextoAtual()]).then(
      ([lista, contexto]) => { if (ativo) { setVinculos(lista); setAtual(contexto); } },
      () => { if (ativo) setErro('Não foi possível consultar suas organizações. Abra a tela novamente para tentar.'); },
    );
    return () => { ativo = false; };
  }, []);
  useFocusEffect(carregar);

  async function escolher(organizacao: string) {
    if (trocando || organizacao === atual) return;
    setTrocando(true);
    setErro('');
    setAviso('');
    setEmail('');
    try {
      await trocarContexto(organizacao);
      setAtual(organizacao);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível trocar de organização. Tente novamente.');
    } finally {
      setTrocando(false);
    }
  }

  async function incluir() {
    if (!atual || incluindo) return;
    setIncluindo(true);
    setAviso('');
    try {
      await incluirMembro(atual, email);
      setEmail('');
      setAviso(confirmacaoNeutra);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não foi possível processar a inclusão. Tente novamente.');
    } finally {
      setIncluindo(false);
    }
  }

  const selecionada = vinculos?.find((v) => v.organizacao_id === atual);

  return (
    <Screen withTabBar header={<ScreenHeader title="Organização" />}>
      {erro ? <AppText variant="body" color="danger">{erro}</AppText> : null}

      {vinculos && vinculos.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhuma organização" description="Ela é criada quando você envia a primeira propriedade." />
      ) : null}

      {vinculos && vinculos.length > 0 ? (
        <VStack gap="sm">
          <SectionTitle title="Suas organizações" />
          {!selecionada ? (
            <AppText variant="caption" color="textSecondary">Escolha a organização em que você vai trabalhar.</AppText>
          ) : null}
          <Card>
            {vinculos.map((v, i) => (
              <VStack key={v.organizacao_id} gap="xs">
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon={Building2}
                  title={v.nome}
                  subtitle={`${v.papel === 'titular' ? 'Titular' : 'Membro'} · ${v.propriedades_aprovadas} ${v.propriedades_aprovadas === 1 ? 'propriedade aprovada' : 'propriedades aprovadas'}`}
                  trailing={v.organizacao_id === atual ? <StatusPill label="Em uso" /> : undefined}
                  chevron={false}
                  onPress={v.organizacao_id === atual ? undefined : () => void escolher(v.organizacao_id)}
                />
              </VStack>
            ))}
          </Card>
        </VStack>
      ) : null}

      {selecionada?.papel === 'titular' ? (
        <VStack gap="sm">
          <SectionTitle title="Incluir membro" />
          <Card>
            <VStack gap="md">
              <AppText variant="caption" color="textSecondary">
                A pessoa precisa ter conta no AgroDireto com este e-mail.
              </AppText>
              <TextField label="E-mail" icon={Mail} value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" placeholder="nome@exemplo.com" />
              <Button label="Incluir" icon={UserPlus} loading={incluindo} disabled={!email.trim()} onPress={() => void incluir()} />
              {aviso ? <AppText variant="caption" color="textSecondary">{aviso}</AppText> : null}
            </VStack>
          </Card>
        </VStack>
      ) : null}
    </Screen>
  );
}
