import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Building2, CreditCard, FileText, Hash, User } from 'lucide-react-native';
import { Button, Screen, ScreenHeader, SelectField, TextField, VerifiedBadge, VStack } from '@agrodireto/ui';
import { useDadosBancarios } from '@/hooks/dados';
import { opcoes } from '@/lib/opcoes';

const BANCOS = ['Banco do Brasil', 'Caixa Econômica Federal', 'Bradesco', 'Itaú', 'Santander', 'Sicredi', 'Sicoob'];
const TIPOS = ['Conta corrente', 'Conta poupança'];

/** 25 · Dados bancários — conta que recebe os repasses. Gravação no Supabase na fase de dados. */
export default function DadosBancariosScreen() {
  const router = useRouter();
  const d = useDadosBancarios();
  const [banco, setBanco] = useState<string | undefined>(d.banco);
  const [agencia, setAgencia] = useState(d.agencia);
  const [conta, setConta] = useState(d.conta);
  const [tipo, setTipo] = useState<string | undefined>(d.tipo);
  const [titular, setTitular] = useState(d.titular);
  const [documento, setDocumento] = useState(d.documento);

  const valido = !!banco && !!tipo && agencia.trim().length > 0 && conta.trim().length > 0 && titular.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Dados bancários" subtitle="Informe a conta que vai receber seus repasses." />}
      footer={<Button label="Salvar dados bancários" disabled={!valido} onPress={() => router.back()} />}
    >
      {d.verificado ? (
        <VStack gap="xs">
          <VerifiedBadge label="Verificado" />
        </VStack>
      ) : null}
      <SelectField label="Banco" icon={Building2} value={banco} options={opcoes(BANCOS)} onChange={setBanco} />
      <TextField label="Agência" icon={Hash} placeholder="0000" keyboardType="number-pad" value={agencia} onChangeText={setAgencia} />
      <TextField label="Conta" icon={CreditCard} placeholder="00000-0" keyboardType="numbers-and-punctuation" value={conta} onChangeText={setConta} />
      <SelectField label="Tipo de conta" value={tipo} options={opcoes(TIPOS)} onChange={setTipo} />
      <TextField label="Titular" icon={User} placeholder="Nome completo" value={titular} onChangeText={setTitular} autoCapitalize="words" />
      <TextField label="CPF ou CNPJ do titular" icon={FileText} placeholder="000.000.000-00" keyboardType="number-pad" value={documento} onChangeText={setDocumento} />
    </Screen>
  );
}
