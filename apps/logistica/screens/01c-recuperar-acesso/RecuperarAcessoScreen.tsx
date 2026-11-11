import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyRound, Lock, Mail } from 'lucide-react-native';
import { AppText, Button, Screen, ScreenHeader, TextField, TextLink } from '@agrodireto/ui';
import { supabase } from '@/lib/supabase';
import { lerCadastroTransportadora } from '@/lib/transportadora';
import { rotasLogistica } from '@/routes';

/** 01c · Recuperar acesso — código por e-mail e nova senha, sem sair do app. */
export default function RecuperarAcessoScreen() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function enviarCodigo() {
    if (!supabase || ocupado) return;
    setOcupado(true);
    setMensagem('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setOcupado(false);
    // Mesma resposta exista ou não a conta; só o limite de envio é avisado.
    if (error?.status === 429) return setMensagem('Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.');
    if (error && error.status !== 400) return setMensagem('Não foi possível enviar o código. Tente novamente.');
    setEtapa('codigo');
    setMensagem('Se houver uma conta com este e-mail, enviamos um código. Confira a caixa de entrada.');
  }

  async function trocarSenha() {
    if (!supabase || ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo, type: 'recovery' });
      if (error) throw new Error('Código inválido ou expirado. Peça um novo código.');
      const { error: erroSenha } = await supabase.auth.updateUser({ password: senha });
      if (erroSenha) throw new Error('Não foi possível trocar a senha. Escolha outra senha e tente novamente.');
      const cadastro = await lerCadastroTransportadora().catch(() => null);
      router.replace(cadastro ? rotasLogistica.inicio : rotasLogistica.transportadora);
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível trocar a senha.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Recuperar acesso" />}>
      {!supabase && <AppText>Ambiente de integração indisponível.</AppText>}
      <TextField label="E-mail" icon={Mail} keyboardType="email-address" autoCapitalize="none" value={email} editable={etapa === 'email'} onChangeText={setEmail} />
      {etapa === 'codigo' && (
        <>
          <TextField label="Código recebido" icon={KeyRound} keyboardType="number-pad" value={codigo} onChangeText={(t) => setCodigo(t.replace(/\D/g, ''))} maxLength={10} />
          <TextField label="Nova senha (mínimo de 8 caracteres)" icon={Lock} secure value={senha} onChangeText={setSenha} />
        </>
      )}
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {etapa === 'email' ? (
        <Button label="Enviar código" loading={ocupado} disabled={!supabase || ocupado || !email.includes('@')} onPress={() => void enviarCodigo()} />
      ) : (
        <>
          <Button label="Trocar senha" loading={ocupado} disabled={!supabase || ocupado || codigo.length < 6 || senha.length < 8} onPress={() => void trocarSenha()} />
          <TextLink label="Enviar outro código" onPress={() => { setEtapa('email'); setCodigo(''); setMensagem(''); }} />
        </>
      )}
      <TextLink label="Voltar ao login" onPress={() => router.replace(rotasLogistica.entrar)} />
    </Screen>
  );
}
