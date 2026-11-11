import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, Card, ListRow, Screen, ScreenHeader, TextField } from '@agrodireto/ui';
import type { PropriedadeEnviada } from '@agrodireto/dominio';
import { lerPropriedade, revisarPropriedade } from '@/lib/propriedades';
import { rotasAdministrador } from '@/routes';

export default function AnalisarCadastroScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [cadastro, setCadastro] = useState<PropriedadeEnviada | null>(null);
  const [mensagem, setMensagem] = useState('Carregando…');
  const [ocupado, setOcupado] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    let ativo = true;
    if (!id) return;
    void lerPropriedade(id).then(
      (dados) => { if (ativo) { setCadastro(dados); setMensagem(dados ? '' : 'Propriedade não encontrada.'); } },
      () => { if (ativo) setMensagem('Não foi possível consultar a propriedade. Tente novamente.'); },
    );
    return () => { ativo = false; };
  }, [id]);

  async function revisar(motivoAjuste: string | null) {
    if (!cadastro || cadastro.id !== id || ocupado || cadastro.status !== 'em_analise') return;
    setOcupado(true);
    setMensagem('');
    try {
      await revisarPropriedade(cadastro, motivoAjuste);
      router.dismissTo(rotasAdministrador.cadastros);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível salvar a revisão. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Analisar propriedade" />}>
      {!id && <AppText>Selecione uma propriedade na lista de cadastros.</AppText>}
      {!!mensagem && !!id && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {cadastro && cadastro.id === id && (
        <>
          <Card>
            <ListRow title={cadastro.nome} subtitle={`${cadastro.cidade} · ${cadastro.uf}`} />
            <ListRow title="Área produtiva" subtitle={`${cadastro.area} ha`} />
            <ListRow title="Culturas" subtitle={cadastro.culturas} />
          </Card>
          <AppText>A aprovação desta etapa abrange os dados da propriedade. Documentos e dados bancários aguardam validação nas próximas etapas.</AppText>
          {cadastro.status === 'em_analise' && (
            <>
              <Button label="Aprovar propriedade" disabled={ocupado} onPress={() => void revisar(null)} />
              <TextField label="Motivo do ajuste" value={motivo} onChangeText={setMotivo} editable={!ocupado} maxLength={500} />
              <Button label="Solicitar ajustes" disabled={ocupado || !motivo.trim()} onPress={() => void revisar(motivo.trim())} />
            </>
          )}
          {cadastro.status === 'aprovada' && <AppText>Propriedade aprovada.</AppText>}
          {cadastro.status === 'ajustes_solicitados' && <AppText>Ajustes solicitados. {cadastro.motivo_ajuste}</AppText>}
        </>
      )}
    </Screen>
  );
}
