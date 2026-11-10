import { BadgeCheck, Search, Truck } from 'lucide-react-native';
import { type OnboardingSlide, OnboardingTemplate } from '@agrodireto/ui';
import { rotasCliente } from '../../routes';

const slides: OnboardingSlide[] = [
  {
    icon: Search,
    titulo: 'Compre direto do produtor',
    descricao: 'Encontre ofertas por produto, região, padrão e janela de entrega.',
  },
  {
    icon: BadgeCheck,
    titulo: 'Origem comprovada',
    descricao: 'Veja o cadastro, as inspeções e o QR de cada lote antes de cotar.',
  },
  {
    icon: Truck,
    titulo: 'Entrega rastreada',
    descricao: 'Acompanhe a carga, confira o recebimento e registre divergências.',
  },
];

export default function OnboardingScreen() {
  return <OnboardingTemplate perfil="Cliente" slides={slides} proximo={rotasCliente.paywall} />;
}
