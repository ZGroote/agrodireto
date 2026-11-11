import { useRouter } from 'expo-router';
import { AppText, Button, Screen, ScreenHeader } from '@agrodireto/ui';
import { rotasAgricultor } from '@/routes';

export default function RecuperarAcessoScreen() {
  const router = useRouter();

  return (
    <Screen header={<ScreenHeader title="Recuperar acesso" />}>
      <AppText>A recuperação de senha ainda está indisponível. Se perdeu o acesso, fale com a equipe do AgroDireto.</AppText>
      <Button label="Voltar ao login" onPress={() => router.replace(rotasAgricultor.entrar)} />
    </Screen>
  );
}
