import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Mail, UserPlus } from 'lucide-react-native';
import { AppText, Button, Card, Screen, ScreenHeader, TextField, VStack } from '@agrodireto/ui';
import { contextoAtual, incluirMembro, listarVinculos, type Vinculo } from '@/lib/organizacoes';

const confirmacaoNeutra = 'Solicitação processada. Se a conta existir, o vínculo estará disponível.';

/** 26 · Equipe — o titular da empresa em uso inclui membro por e-mail (sem convite; resposta neutra). */
export default function EquipeScreen() {
  const [empresa, setEmpresa] = useState<Vinculo | null | undefined>(undefined);
  const [erro, setErro] = useState('');
  const [email, setEmail] = useState('');
  const [incluindo, setIncluindo] = useState(false);
  const [aviso, setAviso] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setErro('');
    void Promise.all([listarVinculos(), contextoAtual()]).then(
      ([lista, contexto]) => { if (ativo) setEmpresa(lista.find((v) => v.organizacao_id === contexto) ?? null); },
      () => { if (ativo) setErro('Não foi possível consultar a empresa em uso. Abra a tela novamente para tentar.'); },
    );
    return () => { ativo = false; };
  }, []));

  async function incluir() {
    if (!empresa || incluindo) return;
    setIncluindo(true);
    setAviso('');
    try {
      await incluirMembro(empresa.organizacao_id, email);
      setEmail('');
      setAviso(confirmacaoNeutra);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não foi possível processar a inclusão. Tente novamente.');
    } finally {
      setIncluindo(false);
    }
  }

  return (
    <Screen withTabBar header={<ScreenHeader title="Equipe e permissões" subtitle={empresa?.nome} />}>
      {erro ? <AppText variant="body" color="danger">{erro}</AppText> : null}
      {empresa === null ? (
        <AppText variant="body" color="textSecondary">Escolha a empresa em uso em Trocar empresa.</AppText>
      ) : null}
      {empresa?.papel === 'membro' ? (
        <AppText variant="body" color="textSecondary">Só o titular da transportadora inclui membros.</AppText>
      ) : null}
      {empresa?.papel === 'titular' ? (
        <Card>
          <VStack gap="md">
            <AppText variant="caption" color="textSecondary">
              A pessoa precisa ter conta no AgroDireto com este e-mail.
            </AppText>
            <TextField label="E-mail" icon={Mail} value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" placeholder="nome@empresa.com" />
            <Button label="Incluir membro" icon={UserPlus} loading={incluindo} disabled={!email.trim()} onPress={() => void incluir()} />
            {aviso ? <AppText variant="caption" color="textSecondary">{aviso}</AppText> : null}
          </VStack>
        </Card>
      ) : null}
    </Screen>
  );
}
