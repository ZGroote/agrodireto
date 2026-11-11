import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppText, Button, Card, ListRow, Screen, ScreenHeader, TextArea } from '@agrodireto/ui';
import { baixarOriginal, listarPendentes, revisarEvidencia, type EvidenciaPendente } from '@/lib/evidencias';

export default function DocumentosMidiasScreen() {
  const [pendentes, setPendentes] = useState<EvidenciaPendente[]>([]);
  const [selecionada, setSelecionada] = useState<EvidenciaPendente | null>(null);
  const [motivo, setMotivo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregou, setCarregou] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregou(false);
    setSelecionada(null);
    const carregar = atualizacao > 0 ? 'Não foi possível atualizar a fila.' : 'Não foi possível consultar a fila.';
    void listarPendentes().then(
      (dados) => { if (ativo) { setPendentes(dados); setMensagem(''); setCarregou(true); } },
      () => { if (ativo) setMensagem(carregar); },
    );
    return () => { ativo = false; };
  }, [atualizacao]));

  async function decidir(aprovada: boolean) {
    if (!selecionada || ocupado || (!aprovada && !motivo.trim())) return;
    setOcupado(true);
    setMensagem('');
    try {
      await revisarEvidencia(selecionada, aprovada, motivo);
      setAtualizacao((n) => n + 1);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível registrar a revisão.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Revisar evidências" />}>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!carregou && !mensagem && <AppText>Carregando evidências…</AppText>}
      {carregou && !selecionada && pendentes.length === 0 && <AppText>Nenhuma evidência aguardando revisão.</AppText>}
      {carregou && !selecionada && pendentes.map((item) => (
        <Card key={`${item.lote_id}/${item.chave}`}>
          <ListRow title={item.produto} subtitle={item.tipo === 'foto' ? 'Foto' : 'Vídeo'} onPress={() => {
            setSelecionada(item);
            setMotivo('');
            setMensagem('');
          }} />
        </Card>
      ))}
      {selecionada && (
        <Card>
          <AppText variant="heading">{selecionada.produto}</AppText>
          <Button label="Baixar para revisão" variant="secondary" disabled={ocupado} onPress={() => {
            void baixarOriginal(selecionada.arquivo).catch(() => setMensagem('Não foi possível baixar o arquivo.'));
          }} />
          <Button label="Aprovar evidência" disabled={ocupado} onPress={() => void decidir(true)} />
          <TextArea label="Motivo da rejeição" value={motivo} onChangeText={setMotivo} maxLength={500} />
          <Button label="Rejeitar evidência" variant="secondary" disabled={ocupado || !motivo.trim()} onPress={() => void decidir(false)} />
        </Card>
      )}
      <Button label="Atualizar fila" variant="secondary" disabled={ocupado} onPress={() => setAtualizacao((n) => n + 1)} />
    </Screen>
  );
}
