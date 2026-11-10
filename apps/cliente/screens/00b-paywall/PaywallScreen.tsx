import { PaywallTemplate } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

const beneficios = [
  'Cotações sem limite',
  'Comparação de ofertas lado a lado',
  'Equipe com permissões de aprovação',
  'Relatórios de compras e faturas',
];

export default function PaywallScreen() {
  return <PaywallTemplate perfil="Cliente" beneficios={beneficios} proximo={rotasCliente.entrar} />;
}
