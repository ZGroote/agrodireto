import { MapaTelas } from '@agrodireto/ui';
import { telasCliente } from '@/routes';

/** Mapa de telas (só em desenvolvimento): abre qualquer tela do app. */
export default function Telas() {
  return <MapaTelas perfil="Cliente" telas={telasCliente} />;
}
