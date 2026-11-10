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
  const { id, salvar, operacao } = useLoteDraft();
  const gravando = operacao === 'gravando';

  async function salvarEAvancar() {
    if (proxima && await salvar(proxima)) router.push(rotasAgricultor.rascunhoLote(id, proxima));
  }

  return (
    <>
      {operacao === 'salvo' && <AppText variant="caption" accessibilityLiveRegion="polite">Rascunho salvo no dispositivo.</AppText>}
      {operacao === 'erro' && <AppText variant="caption" accessibilityLiveRegion="polite">Não foi possível gravar a alteração. Tente novamente.</AppText>}
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
