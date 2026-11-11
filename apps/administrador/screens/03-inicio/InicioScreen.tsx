import { useRouter } from 'expo-router';
import { ChartLine, ClipboardCheck, FileText, Images, Landmark, Package, Truck, TriangleAlert } from 'lucide-react-native';
import { AlertBanner, Card, Divider, EMPTY, ListRow, Screen, ScreenHeader, VStack } from '@agrodireto/ui';
import { rotasAdministrador } from '../../routes';

/** 03 · Início (tab) — pendências do dia da equipe. Contagens virão do Supabase. */
export default function InicioScreen() {
  const router = useRouter();

  return (
    <Screen withTabBar header={<ScreenHeader back={false} title="Hoje" subtitle={EMPTY} />}>
      <VStack gap="sm">
        <Card>
          <ListRow icon={Images} title="Nenhum cadastro pendente" onPress={() => router.navigate(rotasAdministrador.cadastros)} />
        </Card>
        <Card>
          <ListRow icon={TriangleAlert} title="Nenhuma ocorrência aberta" onPress={() => router.navigate(rotasAdministrador.alertas)} />
        </Card>
        <Card>
          <ListRow icon={Truck} title="Nenhuma carga ativa" onPress={() => router.navigate(rotasAdministrador.operacao)} />
        </Card>
      </VStack>

      <AlertBanner icon={FileText} tone="warning" title="Revisar cadastros" onPress={() => router.push(rotasAdministrador.analisarCadastro())} />

      {/* Não estão no mockup: únicos acessos às telas 07, 09, 15 e 16. */}
      <Card>
        <ListRow icon={Package} title="Revisão de lotes" onPress={() => router.push(rotasAdministrador.revisaoLote())} />
        <ListRow icon={ClipboardCheck} title="Revisar evidências" onPress={() => router.push(rotasAdministrador.documentosMidias())} />
        <Divider />
        <ListRow icon={ClipboardCheck} title="Inspeções" onPress={() => router.push(rotasAdministrador.inspecoes)} />
        <Divider />
        <ListRow icon={Landmark} title="Conciliação" onPress={() => router.push(rotasAdministrador.conciliacao)} />
        <Divider />
        <ListRow icon={ChartLine} title="Relatórios" onPress={() => router.push(rotasAdministrador.relatorios)} />
      </Card>
    </Screen>
  );
}
