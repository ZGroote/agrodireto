import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppText, Button, Card } from '@agrodireto/ui';
import { autorizarFotoCatalogo, baixarEvidencia, enviarEvidencia, listarEvidencias, solicitarRevisao, type EvidenciaEnviada } from '@/lib/evidenciasRemotas';
import { lerRascunhosLote, type EvidenciaDraft } from './rascunhosLote';

export function EvidenciasPublicadas({ lote, rascunho, retirada }: { lote: string; rascunho: string; retirada: boolean }) {
  const [locais, setLocais] = useState<EvidenciaDraft[]>([]);
  const [enviadas, setEnviadas] = useState<EvidenciaEnviada[]>([]);
  const [ocupada, setOcupada] = useState<string>();
  const [mensagem, setMensagem] = useState('');
  const [carregada, setCarregada] = useState(false);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregada(false);
    void listarEvidencias(lote).then(
      (dados) => { if (ativo) { setEnviadas(dados); setCarregada(true); } },
      () => { if (ativo) setMensagem('Não foi possível consultar as evidências. Abra a tela novamente para tentar.'); },
    );
    void lerRascunhosLote().then(
      (dados) => { if (ativo) setLocais(dados.find((item) => item.id === rascunho)?.campos.evidencias ?? []); },
      () => { if (ativo) setLocais([]); },
    );
    return () => { ativo = false; };
  }, [lote, rascunho]));

  async function enviar(item: EvidenciaDraft) {
    if (ocupada || retirada) return;
    setOcupada(item.id);
    setMensagem('');
    try {
      await enviarEvidencia(lote, rascunho, item);
      setEnviadas(await listarEvidencias(lote));
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível enviar a evidência.');
    } finally {
      setOcupada(undefined);
    }
  }

  async function pedirRevisao(chave: string) {
    if (ocupada || retirada) return;
    setOcupada(chave);
    setMensagem('');
    try {
      await solicitarRevisao(lote, chave);
      setEnviadas(await listarEvidencias(lote));
    } catch {
      setMensagem('Não foi possível solicitar a revisão. Tente novamente.');
    } finally {
      setOcupada(undefined);
    }
  }

  async function mudarAutorizacao(item: EvidenciaEnviada) {
    if (ocupada) return;
    setOcupada(item.chave);
    setMensagem('');
    try {
      await autorizarFotoCatalogo(lote, item.chave, !item.autorizada_catalogo);
      setEnviadas(await listarEvidencias(lote));
    } catch {
      setMensagem('Não foi possível atualizar o compartilhamento. Tente novamente.');
    } finally {
      setOcupada(undefined);
    }
  }

  return (
    <Card>
      <AppText variant="heading">Evidências privadas</AppText>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {carregada && enviadas.length === 0 && <AppText>Nenhuma evidência enviada.</AppText>}
      {enviadas.map((item, indice) => (
        <Card key={item.chave}>
          <AppText>{item.revisao === 'aprovada' ? 'Aprovada pela equipe' : item.revisao === 'rejeitada' ? 'Rejeitada pela equipe' : item.solicitada_em ? 'Em revisão' : 'Privada'}</AppText>
          {!!item.motivo_rejeicao && <AppText>{item.motivo_rejeicao}</AppText>}
          <Button variant="secondary" label={`Baixar ${item.tipo === 'foto' ? 'foto' : 'vídeo'} ${indice + 1}`}
            onPress={() => void baixarEvidencia(item.arquivo).catch(() => setMensagem('Não foi possível baixar. Tente novamente.'))} />
          {!item.solicitada_em && !retirada && <Button label="Enviar à equipe para revisão" disabled={!!ocupada} onPress={() => void pedirRevisao(item.chave)} />}
          {item.revisao === 'aprovada' && (!retirada || item.autorizada_catalogo) && (
            <>
              {item.autorizada_catalogo && !retirada && <AppText variant="caption">{item.copia_catalogo ? 'Cópia disponível aos compradores autorizados.' : 'Aguardando preparo da cópia para o catálogo.'}</AppText>}
              <Button label={`${item.autorizada_catalogo ? 'Retirar' : 'Autorizar'} ${item.tipo === 'foto' ? 'foto' : 'vídeo'} ${item.autorizada_catalogo ? 'do' : 'no'} catálogo`} variant="secondary"
                disabled={!!ocupada} onPress={() => void mudarAutorizacao(item)} />
            </>
          )}
        </Card>
      ))}
      {carregada && !retirada && locais.filter((local) => !enviadas.some((item) => item.chave === local.id)).map((item) => (
        <Button key={item.id} label={`Enviar ${item.nome}`} disabled={!!ocupada} loading={ocupada === item.id} onPress={() => void enviar(item)} />
      ))}
      {carregada && !retirada && locais.some((local) => !enviadas.some((item) => item.chave === local.id)) && (
        <AppText variant="caption">Até 6 MiB por arquivo.</AppText>
      )}
    </Card>
  );
}
