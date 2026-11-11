import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { AlertBanner, Button, Card, ChecklistRow, Screen, ScreenHeader, TextLink } from '@agrodireto/ui';
import { useRascunhoPropriedade } from '@/hooks/useRascunhoPropriedade';
import { rotasAgricultor } from '@/routes';
import { lerPropriedadeEnviada } from '@/lib/propriedadeRemota';
import type { PropriedadeEnviada } from '@agrodireto/dominio';

export default function SeuCadastroScreen() {
  const router = useRouter();
  const propriedade = useRascunhoPropriedade();
  const [remota, setRemota] = useState<PropriedadeEnviada | null>(null);
  const [erroRemoto, setErroRemoto] = useState(false);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    void lerPropriedadeEnviada().then(
      (dados) => { if (ativo) { setRemota(dados); setErroRemoto(false); } },
      () => { if (ativo) setErroRemoto(true); },
    );
    return () => { ativo = false; };
  }, []));
  const temRascunho = propriedade.estado === 'pronto' && propriedade.rascunho !== null;
  const rotulos = { carregando: 'Carregando', erro: 'Rascunho indisponível', pronto: 'Não iniciado' };
  const rotuloRemoto = { aprovada: 'Aprovada', ajustes_solicitados: 'Ajustes solicitados', em_analise: 'Em análise' };
  const rotuloPropriedade = erroRemoto ? 'Consulta indisponível' : remota ? rotuloRemoto[remota.status] : temRascunho ? 'Rascunho local' : rotulos[propriedade.estado];
  const proximaTela = rotasAgricultor.propriedade;

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
        <ChecklistRow title="Propriedade" status={remota?.status === 'aprovada' ? 'done' : remota || temRascunho ? 'pending' : 'todo'} statusLabel={rotuloPropriedade} onPress={() => router.push(rotasAgricultor.propriedade)} />
      </Card>
      <Card>
        <ChecklistRow title="Dados bancários" status="todo" statusLabel="Aguardando envio" onPress={() => router.push(rotasAgricultor.dadosBancarios)} />
      </Card>
      <AlertBanner
        icon={FileText}
        tone="warning"
        title="Cadastro em preparação"
        description="Envie a propriedade para análise. Documentos e dados bancários serão tratados nas próximas etapas."
      />
    </Screen>
  );
}
