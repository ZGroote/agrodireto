import { CalendarClock, ClipboardCheck, Truck } from 'lucide-react-native';
import { type OnboardingSlide, OnboardingTemplate } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

const slides: OnboardingSlide[] = [
  {
    icon: Truck,
    titulo: 'Receba ofertas de carga',
    descricao: 'Veja coletas compatíveis com seus veículos, com rota, peso, janela e frete antes de aceitar.',
  },
  {
    icon: CalendarClock,
    titulo: 'Organize sua agenda',
    descricao: 'Coletas e entregas do dia em ordem, com rota e previsão de chegada.',
  },
  {
    icon: ClipboardCheck,
    titulo: 'Comprove cada etapa',
    descricao: 'Registre peso, fotos e assinatura na coleta e na entrega — mesmo sem internet.',
  },
];

export default function OnboardingScreen() {
  return <OnboardingTemplate perfil="Logística" slides={slides} proximo={rotasLogistica.paywall} />;
}
