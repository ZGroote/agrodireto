import Tela from '@/screens/04-cadastros/CadastrosScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="ler_cadastros"><Tela /></Permitido>;
}
