import { useState } from 'react';
import { Building2, CreditCard, FileText, Hash, User } from 'lucide-react-native';
import { Button, Screen, ScreenHeader, SelectField, TextField } from '@agrodireto/ui';
import { opcoes } from '@/lib/opcoes';

const BANCOS = ['Banco do Brasil', 'Caixa Econômica Federal', 'Bradesco', 'Itaú', 'Santander', 'Sicredi', 'Sicoob'];
const TIPOS = ['Conta corrente', 'Conta poupança'];

/** 25 · Dados bancários — conta que recebe os repasses. Gravação no Supabase na fase de dados. */
export default function DadosBancariosScreen() {
  const [banco, setBanco] = useState<string>();
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [tipo, setTipo] = useState<string>();
  const [titular, setTitular] = useState('');
  const [documento, setDocumento] = useState('');

  return (
    <Screen
      header={<ScreenHeader title="Dados bancários" subtitle="Prévia do formulário de repasse. Use apenas dados de teste." />}
      footer={<Button label="Envio indisponível" disabled />}
    >
      <SelectField label="Banco" icon={Building2} value={banco} options={opcoes(BANCOS)} onChange={setBanco} />
      <TextField label="Agência" icon={Hash} placeholder="0000" keyboardType="number-pad" value={agencia} onChangeText={setAgencia} />
      <TextField label="Conta" icon={CreditCard} placeholder="00000-0" keyboardType="numbers-and-punctuation" value={conta} onChangeText={setConta} />
      <SelectField label="Tipo de conta" value={tipo} options={opcoes(TIPOS)} onChange={setTipo} />
      <TextField label="Titular" icon={User} placeholder="Nome completo" value={titular} onChangeText={setTitular} autoCapitalize="words" />
      <TextField label="CPF ou CNPJ do titular" icon={FileText} placeholder="000.000.000-00" keyboardType="number-pad" value={documento} onChangeText={setDocumento} />
    </Screen>
  );
}
