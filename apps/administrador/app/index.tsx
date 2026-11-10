import { Redirect } from 'expo-router';
import { rotasAdministrador } from '@/routes';

/** Entrada do app: Onboarding → Paywall → Auth. */
export default function Index() {
  return <Redirect href={rotasAdministrador.onboarding} />;
}
