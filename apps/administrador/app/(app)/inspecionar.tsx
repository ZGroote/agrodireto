import Tela from '@/screens/10-inspecionar-lote/InspecionarLoteScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="revisar_ofertas"><Tela /></Permitido>;
}
