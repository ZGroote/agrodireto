import Tela from '@/screens/06-documentos-midias/DocumentosMidiasScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="revisar_ofertas"><Tela /></Permitido>;
}
