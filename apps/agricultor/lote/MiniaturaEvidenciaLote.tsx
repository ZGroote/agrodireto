import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, spacing } from '@agrodireto/ui';
import { MiniaturaEvidencia } from '@/components/MiniaturaEvidencia';
import { abrirEvidencia } from './arquivosEvidencia';
import { chaveEvidencia, type EvidenciaDraft } from './rascunhosLote';

export function MiniaturaEvidenciaLote({ loteId, evidencia, remover }: {
  loteId: string;
  evidencia: EvidenciaDraft;
  remover: () => void;
}) {
  const [abertura, setAbertura] = useState<{ uri: string } | 'erro'>();
  const chave = chaveEvidencia(loteId, evidencia);

  useEffect(() => {
    if (evidencia.uri) return;
    let ativo = true;
    let liberar: (() => void) | undefined;
    void abrirEvidencia(chave).then((arquivo) => {
      if (!ativo) {
        arquivo.liberar?.();
        return;
      }
      liberar = arquivo.liberar;
      setAbertura({ uri: arquivo.uri });
    }, () => {
      if (ativo) setAbertura('erro');
    });
    return () => {
      ativo = false;
      liberar?.();
    };
  }, [chave, evidencia.uri]);

  const uri = evidencia.uri ?? (abertura !== 'erro' ? abertura?.uri : undefined);
  if (!uri) {
    return (
      <View style={{ gap: spacing.xs }}>
        <AppText variant="caption">{abertura === 'erro' ? 'Arquivo indisponível' : 'Abrindo evidência…'}</AppText>
        {abertura === 'erro' && <Button label="Remover evidência" variant="secondary" onPress={remover} />}
      </View>
    );
  }

  return <MiniaturaEvidencia uri={uri} tipo={evidencia.tipo} onRemove={remover} />;
}
