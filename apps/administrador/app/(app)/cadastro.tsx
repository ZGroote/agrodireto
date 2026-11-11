import Tela from '@/screens/05-analisar-cadastro/AnalisarCadastroScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="ler_cadastros"><Tela /></Permitido>;
}
