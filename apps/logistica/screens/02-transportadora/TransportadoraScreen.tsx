import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Building2, FileText, Phone } from 'lucide-react-native';
import { Button, Screen, ScreenHeader, TextField } from '@agrodireto/ui';
import { rotasLogistica } from '../../routes';

/** 02 · Transportadora — dados da empresa. Gravação no Supabase entra na fase de dados. */
export default function TransportadoraScreen() {
  const router = useRouter();
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');

  const valido = razaoSocial.trim().length > 0 && cnpj.replace(/\D/g, '').length === 14 && contato.trim().length >= 10;

  return (
    <Screen
      header={<ScreenHeader title="Transportadora" subtitle="Informe os dados da sua transportadora." />}
      footer={<Button label="Salvar cadastro" disabled={!valido} onPress={() => router.push(rotasLogistica.veiculos)} />}
    >
      <TextField label="Razão social" icon={Building2} placeholder="Nome da empresa" value={razaoSocial} onChangeText={setRazaoSocial} autoCapitalize="words" />
      <TextField label="CNPJ" icon={FileText} placeholder="00.000.000/0000-00" keyboardType="number-pad" value={cnpj} onChangeText={setCnpj} maxLength={18} />
      <TextField label="Contato" icon={Phone} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={contato} onChangeText={setContato} />
    </Screen>
  );
}
