import { PaywallTemplate } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/**
 * Paywall do Administrador — criado a pedido (fluxo Onboarding → Paywall → Auth nos 4 perfis).
 * O Administrador é a equipe interna: avaliar com o negócio se esta etapa deve existir aqui.
 */
const beneficios = [
  'Painel da operação em tempo real',
  'Relatórios com exportação',
  'Auditoria completa das decisões',
  'Integrações e webhooks',
];

export default function PaywallScreen() {
  return <PaywallTemplate perfil="Administrador" beneficios={beneficios} proximo={rotasAdministrador.entrar} />;
}
