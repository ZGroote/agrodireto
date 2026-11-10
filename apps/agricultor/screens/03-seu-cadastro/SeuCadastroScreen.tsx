import { useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { AlertBanner, Button, Card, ChecklistRow, Screen, ScreenHeader, TextLink } from '@agrodireto/ui';
import { useRascunhoPropriedade } from '@/hooks/useRascunhoPropriedade';
import { rotasAgricultor } from '@/routes';

export default function SeuCadastroScreen() {
  const router = useRouter();
  const propriedade = useRascunhoPropriedade();
  const temRascunho = propriedade.estado === 'pronto' && propriedade.rascunho !== null;
  const rotulos = { carregando: 'Carregando', erro: 'Rascunho indisponível', pronto: 'Não iniciado' };
  const rotuloPropriedade = temRascunho ? 'Rascunho local' : rotulos[propriedade.estado];
  const proximaTela = temRascunho ? rotasAgricultor.documentos : rotasAgricultor.propriedade;

  return (
    <Screen
      header={<ScreenHeader title="Seu cadastro" subtitle="Prepare os dados da sua propriedade e confira as etapas do cadastro." />}
      footer={
        <>
          <Button label="Continuar cadastro" disabled={propriedade.estado === 'carregando'} onPress={() => router.push(proximaTela)} />
          <TextLink label="Fazer depois" color="textSecondary" onPress={() => router.replace(rotasAgricultor.inicio)} />
        </>
      }
    >
      <Card>
        <ChecklistRow title="Identificação" status="todo" statusLabel="Aguardando envio" onPress={() => router.push(rotasAgricultor.documentos)} />
      </Card>
      <Card>
        <ChecklistRow title="Propriedade" status={temRascunho ? 'pending' : 'todo'} statusLabel={rotuloPropriedade} onPress={() => router.push(rotasAgricultor.propriedade)} />
      </Card>
      <Card>
        <ChecklistRow title="Dados bancários" status="todo" statusLabel="Aguardando envio" onPress={() => router.push(rotasAgricultor.dadosBancarios)} />
      </Card>
      <AlertBanner
        icon={FileText}
        tone="warning"
        title="Cadastro em preparação"
        description="A análise começa quando o envio de documentos e dados bancários estiver disponível."
      />
    </Screen>
  );
}
