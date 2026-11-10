import { Redirect } from 'expo-router';
import { rotasAgricultor } from '@/routes';

/** Entrada do app: Onboarding → Paywall → Auth. */
export default function Index() {
  return <Redirect href={rotasAgricultor.onboarding} />;
}
