import { MapaTelas } from '@agrodireto/ui';
import { telasAdministrador } from '@/routes';

/** Mapa de telas (só em desenvolvimento): abre qualquer tela do app. */
export default function Telas() {
  return <MapaTelas perfil="Administrador" telas={telasAdministrador} />;
}
