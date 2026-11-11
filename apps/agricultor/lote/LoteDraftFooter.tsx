import { useRouter } from 'expo-router';
import { AppText, Button } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';
import { useLoteDraft } from './LoteDraftContext';
import type { EtapaLote } from './rascunhosLote';

export function LoteDraftFooter({ etapa, proxima, label = 'Continuar', disabled }: {
  etapa: EtapaLote;
  proxima?: EtapaLote;
  label?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { id, salvar, tentarEnviar, operacao, mensagem } = useLoteDraft();
  const gravando = operacao === 'gravando';

  async function salvarEAvancar() {
    if (proxima && await salvar(proxima)) router.push(rotasAgricultor.rascunhoLote(id, proxima));
  }

  return (
    <>
      {operacao === 'salvo' && <AppText variant="caption" accessibilityLiveRegion="polite">Rascunho salvo no servidor. Salvar não publica o lote.</AppText>}
      {operacao === 'pendente' && <>
        <AppText variant="caption" accessibilityLiveRegion="polite">Rascunho salvo no dispositivo · envio pendente. {mensagem}</AppText>
        <Button label="Tentar enviar novamente" variant="secondary" onPress={() => void tentarEnviar()} />
      </>}
      {operacao === 'erro' && <AppText variant="caption" accessibilityLiveRegion="polite">{mensagem} Tente novamente.</AppText>}
      {proxima && <Button label={label} disabled={disabled || gravando} onPress={() => void salvarEAvancar()} />}
      <Button
        label="Salvar rascunho"
        variant={proxima ? 'secondary' : 'primary'}
        loading={gravando}
        onPress={() => void salvar(etapa)}
      />
    </>
  );
}
