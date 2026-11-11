import Tela from '@/screens/19-catalogo-regioes/CatalogoRegioesScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="sem_acao_no_servidor"><Tela /></Permitido>;
}
