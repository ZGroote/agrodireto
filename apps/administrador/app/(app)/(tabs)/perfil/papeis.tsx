import Tela from '@/screens/18-papeis-permissoes/PapeisPermissoesScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="ler_equipe"><Tela /></Permitido>;
}
