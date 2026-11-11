import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AppText, Button, OTPInput, Screen, ScreenHeader } from '@agrodireto/ui';
import { consultarAcessoEquipe, supabase } from '@/lib/supabase';
import { rotasAdministrador } from '@/routes';

export default function VerificacaoScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [fator, setFator] = useState('');
  const [chave, setChave] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const cliente = supabase;
      const acesso = await consultarAcessoEquipe();
      if (!ativo) return;
      if (!cliente || acesso !== 'requer_mfa') {
        router.replace(acesso === 'autorizado' ? rotasAdministrador.cadastros : rotasAdministrador.entrar);
        return;
      }
      const { data, error } = await cliente.auth.mfa.listFactors();
      if (error) throw error;
      if (ativo) {
        setFator(data.totp[0]?.id ?? '');
        setPronto(true);
      }
    }
    void carregar().catch(() => {
      if (ativo) router.replace(rotasAdministrador.entrar);
    });
    return () => { ativo = false; };
  }, [router]);

  async function configurar() {
    if (!supabase || ocupado || !pronto) return;
    setOcupado(true);
    setMensagem('');
    try {
      const fatores = await supabase.auth.mfa.listFactors();
      if (fatores.error) throw fatores.error;
      for (const anterior of fatores.data.all.filter((item) => item.factor_type === 'totp' && item.status === 'unverified')) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: anterior.id });
        if (error) throw error;
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setChave(data.totp.secret);
      setFator(data.id);
    } catch {
      setMensagem('Não foi possível configurar o autenticador. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar() {
    if (!supabase || ocupado || !fator || codigo.length !== 6) return;
    setOcupado(true);
    setMensagem('');
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fator, code: codigo });
      if (error) throw error;
      setChave('');
      router.replace(rotasAdministrador.cadastros);
    } catch {
      setMensagem('Código inválido ou expirado. Confira o autenticador e tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  if (!pronto) return null;
  return (
    <Screen header={<ScreenHeader title="Verificação de segurança" subtitle="Use o código de seis dígitos do seu aplicativo autenticador." />}>
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
      {!!chave && <AppText selectable>Adicione esta chave ao seu aplicativo autenticador: {chave}</AppText>}
      {fator ? (
        <>
          <OTPInput length={6} value={codigo} onChange={setCodigo} />
          <Button label="Confirmar código" loading={ocupado} disabled={ocupado || codigo.length !== 6} onPress={() => void confirmar()} />
        </>
      ) : <Button label="Configurar autenticador" loading={ocupado} disabled={ocupado} onPress={() => void configurar()} />}
    </Screen>
  );
}
