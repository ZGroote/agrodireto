import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { AppText, Card, EmptyState, ListRow, Screen, ScreenHeader } from '@agrodireto/ui';
import type { PropriedadeEnviada } from '@agrodireto/dominio';
import { listarPendencias } from '@/lib/propriedades';
import { rotasAdministrador } from '@/routes';

export default function CadastrosScreen() {
  const router = useRouter();
  const [cadastros, setCadastros] = useState<PropriedadeEnviada[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setEstado('carregando');
    void listarPendencias().then(
      (dados) => { if (ativo) { setCadastros(dados); setEstado('pronto'); } },
      () => { if (ativo) setEstado('erro'); },
    );
    return () => { ativo = false; };
  }, []));

  return (
    <Screen withTabBar header={<ScreenHeader title="Propriedades em análise" />}>
      {estado === 'carregando' && <AppText>Carregando…</AppText>}
      {estado === 'erro' && <AppText>Não foi possível consultar os cadastros. Confira sua conexão e entre novamente.</AppText>}
      {estado === 'pronto' && cadastros.length === 0 && <EmptyState icon={Building2} title="Nenhuma propriedade aguardando análise" />}
      {estado === 'pronto' && cadastros.map((cadastro) => (
        <Card key={cadastro.usuario_id}>
          <ListRow title={cadastro.nome} subtitle={`${cadastro.cidade} · ${cadastro.uf}`} onPress={() => router.push(rotasAdministrador.analisarCadastro({ id: cadastro.usuario_id }))} />
        </Card>
      ))}
    </Screen>
  );
}
