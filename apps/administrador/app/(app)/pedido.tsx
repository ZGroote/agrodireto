import Tela from '@/screens/12-pedido-carga/PedidoCargaScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="sem_acao_no_servidor"><Tela /></Permitido>;
}
