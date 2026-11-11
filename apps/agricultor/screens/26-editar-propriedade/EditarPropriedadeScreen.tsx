import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Home, MapPin, Ruler, Sprout } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddMediaButton, AppText, Button, Foto, Screen, ScreenHeader, spacing, TextField } from '@agrodireto/ui';

import { camposPropriedadeVazios, salvarRascunhoPropriedade, type RascunhoPropriedade } from '@/lib/rascunhoPropriedade';
import { enviarPropriedade, lerFormularioPropriedade } from '@/lib/propriedadeRemota';
import { rotasAgricultor } from '@/routes';

type Campo = keyof RascunhoPropriedade;

/** 26 · Editar propriedade — nome, local, área, culturas e foto de capa. */
export default function EditarPropriedadeScreen() {
  const router = useRouter();
  const { corrigir } = useLocalSearchParams<{ corrigir?: string }>();
  const [revisao, setRevisao] = useState<string>();
  const [campos, setCampos] = useState(camposPropriedadeVazios);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erroLeitura'>('carregando');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const formulario = await lerFormularioPropriedade(corrigir === '1');
        if (!ativo) return;
        if (!formulario) {
          router.dismissTo(rotasAgricultor.propriedade);
          return;
        }
        setCampos(formulario.campos);
        setRevisao(formulario.revisao);
        setEstado('pronto');
      } catch {
        if (ativo) setEstado('erroLeitura');
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [corrigir, router]);

  function editar(campo: Campo, valor: string) {
    setCampos((anteriores) => ({ ...anteriores, [campo]: valor }));
    setMensagem('');
  }

  async function salvar() {
    if (estado !== 'pronto' || salvando || !campos.nome.trim()) return;
    setSalvando(true);
    setMensagem('');
    try {
      if (revisao) {
        await enviarPropriedade(campos, revisao);
        router.dismissTo(rotasAgricultor.propriedade);
        return;
      }
      await salvarRascunhoPropriedade(campos);
      setErro(false);
      setMensagem('Rascunho salvo neste dispositivo.');
    } catch (falha) {
      setErro(true);
      setMensagem(revisao && falha instanceof Error ? falha.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  const editavel = estado === 'pronto' && !salvando;

  return (
    <Screen
      header={<ScreenHeader title="Editar propriedade" subtitle={revisao ? undefined : 'O rascunho fica neste dispositivo.'} />}
      footer={<Button label={revisao ? 'Reenviar para análise' : 'Salvar rascunho'} disabled={!editavel || !campos.nome.trim()} loading={salvando} onPress={() => void salvar()} />}
    >
      {estado === 'carregando' && <AppText>Carregando rascunho…</AppText>}
      {estado === 'erroLeitura' && <AppText>Não foi possível abrir o rascunho. Saia desta tela e tente novamente.</AppText>}
      {!!mensagem && <AppText accessibilityLiveRegion="polite" color={erro ? 'textPrimary' : 'primary'}>{mensagem}</AppText>}
      <View style={styles.capa}>
        <AppText variant="label">Foto de capa</AppText>
        <View style={styles.linha}>
          <View style={styles.flex}>
            <Foto tipo="sitio" height={76} />
          </View>
          {/* Troca de foto exige expo-image-picker (aprovação pendente). */}
          <AddMediaButton />
        </View>
      </View>

      <TextField label="Nome da propriedade" icon={Home} value={campos.nome} editable={editavel} onChangeText={(t) => editar('nome', t)} autoCapitalize="words" />
      <View style={styles.linha}>
        <View style={styles.cidade}>
          <TextField label="Cidade" icon={MapPin} value={campos.cidade} editable={editavel} onChangeText={(t) => editar('cidade', t)} autoCapitalize="words" />
        </View>
        <View style={styles.uf}>
          <TextField label="UF" value={campos.uf} editable={editavel} onChangeText={(t) => editar('uf', t.toUpperCase())} maxLength={2} autoCapitalize="characters" />
        </View>
      </View>
      <TextField label="Área produtiva" icon={Ruler} suffix="ha" keyboardType="numeric" value={campos.area} editable={editavel} onChangeText={(t) => editar('area', t)} />
      <TextField label="Culturas" icon={Sprout} placeholder="Ex.: Tomate, Abobrinha" value={campos.culturas} editable={editavel} onChangeText={(t) => editar('culturas', t)} autoCapitalize="words" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  capa: { gap: spacing.sm },
  linha: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  flex: { flex: 1 },
  cidade: { flex: 2 },
  uf: { flex: 1 },
});
