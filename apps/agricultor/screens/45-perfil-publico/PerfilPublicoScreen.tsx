import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck, Clock, Factory, MapPin, Star, type LucideIcon } from 'lucide-react-native';
import { dataCurta, formatarDuracao, podeVerMidia } from '@agrodireto/dominio';
import { AppText, Button, colors, Foto, kg, Screen, ScreenHeader, sizes, spacing, StatusPill } from '@agrodireto/ui';
import { useAgricultor, useMidias } from '@/hooks/dados';
import { rotasAgricultor } from '@/routes';

/** 45 · Perfil público — como os compradores veem a propriedade (mesma regra de mídia do app Cliente). */
export default function PerfilPublicoScreen() {
  const router = useRouter();
  const a = useAgricultor();
  // Só entram as mídias que um comprador aprovado pode ver (contrato em @agrodireto/dominio).
  const visiveis = useMidias().filter((m) => podeVerMidia(m, 'cliente', { compradorAprovado: true }));
  const video = visiveis.find((m) => m.tipo !== 'foto');

  return (
    <Screen
      header={<ScreenHeader title={a.propriedade} subtitle="Prévia do perfil público" />}
      footer={<Button label="Ver lotes" onPress={() => router.push(rotasAgricultor.lotes)} />}
    >
      <Foto tipo="sitio" height={150} />

      <View style={styles.info}>
        <Linha icon={MapPin} texto={`${a.cidade} · ${a.uf}`} />
        {a.cadastroVerificado ? <Linha icon={CircleCheck} texto="Cadastro verificado" destaque /> : null}
        <Linha icon={Star} texto={`${String(a.avaliacao).replace('.', ',')} (${a.avaliacoes} avaliações)`} />
        <Linha icon={Factory} texto={`Capacidade: ${kg(a.capacidadeKgSemana)}/semana`} />
      </View>

      {video ? (
        <>
          <Foto tipo="drone" video duracao={video.duracaoSeg ? formatarDuracao(video.duracaoSeg) : undefined} height={110} />
          <View style={styles.meta}>
            <AppText variant="caption" color="textSecondary" style={styles.flex}>
              {dataCurta(video.capturadaEm)} · {video.autor}
            </AppText>
            {video.status === 'pendente' ? <StatusPill label="Não verificado" tone="warning" icon={Clock} /> : null}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function Linha({ icon: Icon, texto, destaque }: { icon: LucideIcon; texto: string; destaque?: boolean }) {
  return (
    <View style={styles.linha}>
      <Icon size={sizes.iconMd} color={destaque ? colors.primary : colors.textSecondary} />
      <AppText variant={destaque ? 'bodyStrong' : 'body'} color={destaque ? 'primary' : 'textPrimary'}>
        {texto}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  info: { gap: spacing.md },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
});
