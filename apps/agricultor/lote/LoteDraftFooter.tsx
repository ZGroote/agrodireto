import { AppText, Button } from '@agrodireto/ui';
import { useLoteDraft } from './LoteDraftContext';

export function LoteDraftFooter({ label, onAvancar, disabled }: {
  label?: string;
  onAvancar?: () => void;
  disabled?: boolean;
}) {
  const { salvar, operacao } = useLoteDraft();
  const gravando = operacao === 'gravando';

  async function salvarEAvancar() {
    if (await salvar()) onAvancar?.();
  }

  return (
    <>
      {operacao === 'salvo' && <AppText variant="caption" accessibilityLiveRegion="polite">Rascunho salvo no dispositivo.</AppText>}
      {operacao === 'erro' && <AppText variant="caption" accessibilityLiveRegion="polite">Não foi possível gravar a alteração. Tente novamente.</AppText>}
      {onAvancar && label && <Button label={label} disabled={disabled || gravando} onPress={() => void salvarEAvancar()} />}
      <Button
        label="Salvar rascunho"
        variant={onAvancar ? 'secondary' : 'primary'}
        loading={gravando}
        onPress={() => void salvar()}
      />
    </>
  );
}
