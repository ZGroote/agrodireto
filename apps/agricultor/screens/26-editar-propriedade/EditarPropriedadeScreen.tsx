import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, MapPin, Ruler, Sprout } from 'lucide-react-native';
import { AddMediaButton, AppText, Button, Foto, Screen, ScreenHeader, spacing, TextField } from '@agrodireto/ui';
import { useAgricultor } from '@/hooks/dados';

/** 26 · Editar propriedade — nome, local, área, culturas e foto de capa. */
export default function EditarPropriedadeScreen() {
  const router = useRouter();
  const a = useAgricultor();
  const [nome, setNome] = useState(a.propriedade);
  const [cidade, setCidade] = useState(a.cidade);
  const [uf, setUf] = useState(a.uf);
  const [area, setArea] = useState(String(a.areaHa));
  const [culturas, setCulturas] = useState(a.culturas.join(', '));

  return (
    <Screen
      header={<ScreenHeader title="Editar propriedade" subtitle="Atualize os dados que compradores veem." />}
      footer={<Button label="Salvar alterações" disabled={nome.trim().length === 0} onPress={() => router.back()} />}
    >
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

      <TextField label="Nome da propriedade" icon={Home} value={nome} onChangeText={setNome} autoCapitalize="words" />
      <View style={styles.linha}>
        <View style={styles.cidade}>
          <TextField label="Cidade" icon={MapPin} value={cidade} onChangeText={setCidade} autoCapitalize="words" />
        </View>
        <View style={styles.uf}>
          <TextField label="UF" value={uf} onChangeText={(t) => setUf(t.toUpperCase())} maxLength={2} autoCapitalize="characters" />
        </View>
      </View>
      <TextField label="Área produtiva" icon={Ruler} suffix="ha" keyboardType="numeric" value={area} onChangeText={setArea} />
      <TextField label="Culturas" icon={Sprout} placeholder="Ex.: Tomate, Abobrinha" value={culturas} onChangeText={setCulturas} autoCapitalize="words" />
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
