import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { AppText, Button, Logo, Screen, spacing, TextField } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';
import { consultarAcessoEquipe, supabase } from '@/lib/supabase';

/** Acesso da equipe com e-mail e senha. O ambiente define se exige segundo fator. */
export default function AcessoEquipeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const valido = email.includes('@') && senha.length >= 6;

  async function entrar() {
    if (!supabase || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw error;
      const acesso = await consultarAcessoEquipe();
      if (acesso === 'sem_acesso') {
        await supabase.auth.signOut({ scope: 'local' });
        throw new Error();
      }
      router.replace(acesso === 'requer_mfa' ? rotasAdministrador.verificacao : rotasAdministrador.cadastros);
    } catch {
      setMensagem('Não foi possível entrar com esta conta da equipe.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen>
      <View style={styles.logo}>
        <Logo subtitle="Administrador" />
      </View>

      <AppText variant="title">Acesso da equipe</AppText>

      <TextField
        label="E-mail"
        icon={Mail}
        placeholder="nome@agrodireto.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Senha" icon={Lock} placeholder="Sua senha" secure value={senha} onChangeText={setSenha} />

      <View style={styles.actions}>
        {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
        {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
        <Button label="Entrar" loading={ocupado} disabled={!valido || !supabase || ocupado} onPress={() => void entrar()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  actions: { gap: spacing.xs, paddingTop: spacing.sm },
});
