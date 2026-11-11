import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { AppText, Card, EmptyState, ListRow, Screen, ScreenHeader } from '@agrodireto/ui';
import type { CadastroComprador, PropriedadeEnviada } from '@agrodireto/dominio';
import { listarCompradoresPendentes } from '@/lib/compradores';
import { listarTransportadorasPendentes, type CadastroTransportadora } from '@/lib/transportadoras';
import { listarPendencias } from '@/lib/propriedades';
import { rotasAdministrador } from '@/routes';

export default function CadastrosScreen() {
  const router = useRouter();
  const [cadastros, setCadastros] = useState<PropriedadeEnviada[]>([]);
  const [compradores, setCompradores] = useState<CadastroComprador[]>([]);
  const [transportadoras, setTransportadoras] = useState<CadastroTransportadora[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setEstado('carregando');
    void Promise.all([listarPendencias(), listarCompradoresPendentes(), listarTransportadorasPendentes()]).then(
      ([propriedades, empresas, transportes]) => { if (ativo) { setCadastros(propriedades); setCompradores(empresas); setTransportadoras(transportes); setEstado('pronto'); } },
      () => { if (ativo) setEstado('erro'); },
    );
    return () => { ativo = false; };
  }, []));

  return (
    <Screen withTabBar header={<ScreenHeader title="Cadastros em análise" />}>
      {estado === 'carregando' && <AppText>Carregando…</AppText>}
      {estado === 'erro' && <AppText>Não foi possível consultar os cadastros. Confira sua conexão e entre novamente.</AppText>}
      {estado === 'pronto' && cadastros.length === 0 && compradores.length === 0 && transportadoras.length === 0 && <EmptyState icon={Building2} title="Nenhum cadastro aguardando análise" />}
      {estado === 'pronto' && cadastros.map((cadastro) => (
        <Card key={cadastro.id}>
          <ListRow title={cadastro.nome} subtitle={`Propriedade · ${cadastro.cidade} · ${cadastro.uf}`} onPress={() => router.push(rotasAdministrador.analisarCadastro({ id: cadastro.id }))} />
        </Card>
      ))}
      {estado === 'pronto' && compradores.map((empresa) => (
        <Card key={empresa.organizacao_id}>
          <ListRow title={empresa.razao_social} subtitle={`Empresa compradora · ${empresa.cidade} · ${empresa.uf}`} onPress={() => router.push(rotasAdministrador.analisarCadastro({ id: empresa.organizacao_id, tipo: 'comprador' }))} />
        </Card>
      ))}
      {estado === 'pronto' && transportadoras.map((empresa) => (
        <Card key={`transportadora:${empresa.organizacao_id}`}>
          <ListRow title={empresa.razao_social} subtitle={`Transportadora · ${empresa.cidade} · ${empresa.uf}`} onPress={() => router.push(rotasAdministrador.analisarCadastro({ id: empresa.organizacao_id, tipo: 'transportadora' }))} />
        </Card>
      ))}
    </Screen>
  );
}
