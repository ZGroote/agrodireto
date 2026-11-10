import { PaywallTemplate } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';

const beneficios = [
  'Lotes publicados sem limite',
  'Destaque da propriedade para compradores',
  'Previsão de safra e calendário de produção',
  'Relatórios de vendas e repasses',
];

export default function PaywallScreen() {
  return <PaywallTemplate perfil="Agricultor" beneficios={beneficios} proximo={rotasAgricultor.entrar} />;
}
