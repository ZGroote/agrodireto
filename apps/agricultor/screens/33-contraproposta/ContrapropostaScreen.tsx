import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Package } from 'lucide-react-native';
import { Button, mascaraMilhar, Screen, ScreenHeader, TextArea, TextField } from '@agrodireto/ui';
import { useCotacao, useNegociacao } from '@/hooks/dados';

/** 33 · Contraproposta — novos termos enviados ao comprador (vira a versão seguinte da oferta). Param: ?id= */
export default function ContrapropostaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const cotacao = useCotacao(id);
  const negociacao = useNegociacao();
  const [quantidade, setQuantidade] = useState(mascaraMilhar(String(cotacao.quantidadeKg)));
  const [preco, setPreco] = useState('5,00');
  const [retirada, setRetirada] = useState(negociacao.retirada);
  const [mensagem, setMensagem] = useState('');

  const valido = Number(quantidade.replace(/\D/g, '')) > 0 && preco.trim().length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Contraproposta" subtitle={`${cotacao.id} · ${cotacao.comprador}`} />}
      // Envio real: nova versão da proposta no Supabase (o histórico anterior é imutável).
      footer={<Button label="Enviar contraproposta" disabled={!valido} onPress={() => router.back()} />}
    >
      <TextField label="Quantidade" icon={Package} suffix="kg" keyboardType="number-pad" value={quantidade} onChangeText={(t) => setQuantidade(mascaraMilhar(t))} />
      <TextField label="Preço por kg" prefix="R$" suffix="/ kg" keyboardType="decimal-pad" value={preco} onChangeText={setPreco} />
      <TextField label="Retirada" icon={Calendar} value={retirada} onChangeText={setRetirada} />
      <TextArea label="Mensagem (opcional)" placeholder="Explique a sua proposta." value={mensagem} onChangeText={setMensagem} />
    </Screen>
  );
}
