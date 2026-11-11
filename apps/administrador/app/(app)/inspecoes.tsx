import Tela from '@/screens/09-inspecoes/InspecoesScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="revisar_ofertas"><Tela /></Permitido>;
}
