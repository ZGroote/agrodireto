import { BadgeCheck, Handshake, Sprout } from 'lucide-react-native';
import { OnboardingTemplate, type OnboardingSlide } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';

const slides: OnboardingSlide[] = [
  {
    icon: Sprout,
    titulo: 'Publique sua produção',
    descricao: 'Cadastre lotes com quantidade, padrão, preço e janela de colheita em poucos minutos.',
  },
  {
    icon: Handshake,
    titulo: 'Venda direto ao comprador',
    descricao: 'Receba cotações, negocie e feche pedidos sem intermediários.',
  },
  {
    icon: BadgeCheck,
    titulo: 'Origem que gera confiança',
    descricao: 'Fotos, vídeos e documentos verificados valorizam sua propriedade e seus lotes.',
  },
];

export default function OnboardingScreen() {
  return <OnboardingTemplate perfil="Agricultor" slides={slides} proximo={rotasAgricultor.paywall} />;
}
