import { MapaTelas } from '@agrodireto/ui';
import { telasAgricultor } from '@/routes';

/** Mapa de telas (só em desenvolvimento): abre qualquer tela do app. */
export default function Telas() {
  return <MapaTelas perfil="Agricultor" telas={telasAgricultor} />;
}
