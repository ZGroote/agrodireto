import Tela from '@/screens/20-regras-operacao/RegrasOperacaoScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="sem_acao_no_servidor"><Tela /></Permitido>;
}
