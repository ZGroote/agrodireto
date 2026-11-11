import { createContext, useContext, type ReactNode } from 'react';
import { ShieldOff } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader } from '@agrodireto/ui';
import { pode, type Acao, type Papel } from '@/lib/equipe';

/** Papel da conta na equipe, lido pelo layout de (app) em papel_equipe(). */
export const PapelEquipeContext = createContext<Papel | null>(null);

export const usePode = () => {
  const papel = useContext(PapelEquipeContext);
  return (acao: Acao) => pode(papel, acao);
};

/** Tela fora do papel (URL direta): mostra aviso. O servidor nega de qualquer jeito. */
export function Permitido({ acao, children }: { acao: Acao; children: ReactNode }) {
  const permitido = usePode();
  if (permitido(acao)) return children;
  return (
    <Screen header={<ScreenHeader title="Sem permissão" />}>
      <EmptyState icon={ShieldOff} title="Sem permissão para esta área" description="Seu papel na equipe não inclui esta área. Fale com a administração geral." />
    </Screen>
  );
}
