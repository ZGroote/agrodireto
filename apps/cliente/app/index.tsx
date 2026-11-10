import { Redirect } from 'expo-router';
import { rotasCliente } from '@/routes';

/** Entrada do app: Onboarding → Paywall → Auth. */
export default function Index() {
  return <Redirect href={rotasCliente.onboarding} />;
}
