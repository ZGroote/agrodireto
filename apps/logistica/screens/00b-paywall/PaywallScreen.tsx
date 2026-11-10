import { PaywallTemplate } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

const beneficios = [
  'Prioridade nas ofertas de carga da sua região',
  'Veículos e motoristas sem limite',
  'Agenda com rotas de coleta e entrega',
  'Relatórios de viagens e repasses',
];

export default function PaywallScreen() {
  return <PaywallTemplate perfil="Logística" beneficios={beneficios} proximo={rotasLogistica.entrar} />;
}
