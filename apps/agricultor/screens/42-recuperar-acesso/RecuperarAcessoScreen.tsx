import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { Button, Screen, ScreenHeader, TextField } from '@agrodireto/ui';
import { useAgricultor } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 42 · Recuperar acesso — envia um código ao telefone cadastrado. */
export default function RecuperarAcessoScreen() {
  const router = useRouter();
  const [telefone, setTelefone] = useState(useAgricultor().telefone);

  return (
    <Screen
      header={<ScreenHeader title="Recuperar acesso" subtitle="Informe o telefone da sua conta para receber um código." />}
      footer={<Button label="Receber código" disabled={telefone.trim().length < 10} onPress={() => router.push(rotasAgricultor.verificarCodigo)} />}
    >
      <TextField label="Telefone" icon={Phone} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
    </Screen>
  );
}
