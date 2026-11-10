import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, ShieldCheck, User } from 'lucide-react-native';
import { AppText, Button, Checkbox, Screen, ScreenHeader, spacing, TextField } from '@agrodireto/ui';
import { useAgricultor, useCodigoValidacao } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 02 · Criar conta — nome, telefone, código de validação e aceite dos termos. */
export default function CriarContaScreen() {
  const router = useRouter();
  const agricultor = useAgricultor();
  const [nome, setNome] = useState(agricultor.nome);
  const [telefone, setTelefone] = useState(agricultor.telefone);
  const [codigo, setCodigo] = useState(useCodigoValidacao());
  const [aceite, setAceite] = useState(true);

  const valido = nome.trim().length > 1 && telefone.trim().length >= 10 && codigo.length === 6 && aceite;

  return (
    <Screen
      header={<ScreenHeader title="Criar conta" subtitle="Informe seu cadastro para criar sua conta de agricultor." />}
      footer={<Button label="Continuar" disabled={!valido} onPress={() => router.replace(rotasAgricultor.cadastro)} />}
    >
      <TextField label="Nome" icon={User} placeholder="Seu nome completo" value={nome} onChangeText={setNome} autoCapitalize="words" />
      <TextField label="Telefone" icon={Phone} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
      <TextField
        label="Código de validação (6 dígitos)"
        icon={ShieldCheck}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={codigo}
        onChangeText={(t) => setCodigo(t.replace(/\D/g, ''))}
      />
      <View style={styles.aceite}>
        <Checkbox checked={aceite} onChange={setAceite} />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          Li e concordo com os{' '}
          <AppText variant="caption" color="primary" onPress={() => router.push(rotasAgricultor.termos)}>
            Termos de Uso
          </AppText>{' '}
          e a{' '}
          <AppText variant="caption" color="primary" onPress={() => router.push(rotasAgricultor.politica)}>
            Política de Privacidade
          </AppText>
          .
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  aceite: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
});
