import { ClipboardCheck, MonitorDot, ShieldCheck } from 'lucide-react-native';
import { type OnboardingSlide, OnboardingTemplate } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

const slides: OnboardingSlide[] = [
  {
    icon: ClipboardCheck,
    titulo: 'Valide cadastros e lotes',
    descricao: 'Analise documentos, mídias e evidências antes de liberar produtores e ofertas.',
  },
  {
    icon: MonitorDot,
    titulo: 'Acompanhe a operação',
    descricao: 'Torre logística, ocorrências e disputas em um só lugar.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Tudo auditado',
    descricao: 'Cada decisão fica registrada com motivo, antes e depois.',
  },
];

export default function OnboardingScreen() {
  return <OnboardingTemplate perfil="Administrador" slides={slides} proximo={rotasAdministrador.paywall} />;
}
