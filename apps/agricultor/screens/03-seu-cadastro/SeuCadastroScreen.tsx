import { useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { AlertBanner, Button, Card, ChecklistRow, Screen, ScreenHeader, TextLink } from '@agrodireto/ui';
import { useDocumentoPendente, useEtapasCadastro } from '@/hooks/dados';
import { useRascunhoPropriedade } from '@/hooks/useRascunhoPropriedade';
import { rotasAgricultor } from '@/routes';
import type { EtapaCadastro } from '@/types';

const rotulo = { verificado: 'Verificado', pendente: 'Pendente de análise', 'nao-enviado': 'Não enviado' } as const;
const status = { verificado: 'done', pendente: 'pending', 'nao-enviado': 'todo' } as const;

/** 03 · Seu cadastro — etapas do cadastro e documento pendente. */
export default function SeuCadastroScreen() {
  const router = useRouter();
  const etapas = useEtapasCadastro();
  const pendente = useDocumentoPendente();
  const propriedade = useRascunhoPropriedade();

  const destino = (e: EtapaCadastro) =>
    e.id === 'identificacao' ? rotasAgricultor.documentos : e.id === 'propriedade' ? rotasAgricultor.propriedade : rotasAgricultor.dadosBancarios;

  const concluidas = etapas.filter((e) => e.id !== 'propriedade' && e.status === 'verificado').length;
  const temRascunho = propriedade.estado === 'pronto' && propriedade.rascunho !== null;
  const rotuloPropriedade = propriedade.estado === 'carregando'
    ? 'Carregando'
    : propriedade.estado === 'erro' ? 'Rascunho indisponível' : temRascunho ? 'Rascunho local' : 'Não enviado';

  return (
    <Screen
      header={
        <ScreenHeader
          title="Seu cadastro"
          step={`${concluidas}/${etapas.length + 1}`}
          subtitle="Conclua seu cadastro para começar a operar no AgroDireto."
        />
      }
      footer={
        <>
          <Button label="Continuar cadastro" onPress={() => router.push(rotasAgricultor.documentos)} />
          {/* "Fazer depois" não está no mockup: é a saída para o app sem concluir o cadastro. */}
          <TextLink label="Fazer depois" color="textSecondary" onPress={() => router.replace(rotasAgricultor.inicio)} />
        </>
      }
    >
      {etapas.map((e) => (
        <Card key={e.id}>
          <ChecklistRow
            title={e.titulo}
            status={e.id === 'propriedade' ? (temRascunho ? 'pending' : 'todo') : status[e.status]}
            statusLabel={e.id === 'propriedade' ? rotuloPropriedade : rotulo[e.status]}
            onPress={() => router.push(destino(e))}
          />
        </Card>
      ))}
      <AlertBanner
        icon={FileText}
        tone="warning"
        title={pendente.titulo}
        description={pendente.descricao}
        onPress={() => router.push(rotasAgricultor.documentos)}
      />
    </Screen>
  );
}
