import Tela from '@/screens/08-rastreabilidade/RastreabilidadeScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="sem_acao_no_servidor"><Tela /></Permitido>;
}
