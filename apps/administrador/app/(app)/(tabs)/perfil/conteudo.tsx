import Tela from '@/screens/21-conteudo-notificacoes/ConteudoNotificacoesScreen';
import { Permitido } from '@/components/PapelEquipe';

export default function Rota() {
  return <Permitido acao="sem_acao_no_servidor"><Tela /></Permitido>;
}
