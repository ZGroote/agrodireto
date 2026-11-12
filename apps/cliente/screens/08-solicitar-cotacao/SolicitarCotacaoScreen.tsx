import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, FileText, MapPin, Package } from 'lucide-react-native';
import type { OfertaCatalogo } from '@agrodireto/dominio';
import { AppText, Button, Card, InlineFieldRow, MediaThumb, Screen, ScreenHeader, sizes, spacing, TextField } from '@agrodireto/ui';
import { solicitarCotacao, type FormCotacao } from '@/lib/cotacoes';
import { consultarCatalogo } from '@/lib/ofertas';
import { organizacaoEmUso } from '@/lib/organizacoes';
import { rotasCliente } from '../../routes';

/** "05032027" → "05/03/2027" */
const mascaraData = (t: string) =>
  t.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');

/** 08 · Solicitar cotação — quantidade, entrega em SP e embalagem/observações para uma oferta. Param: ?oferta= */
export default function SolicitarCotacaoScreen() {
  const router = useRouter();
  const { oferta: id } = useLocalSearchParams<{ oferta?: string }>();
  const [oferta, setOferta] = useState<OfertaCatalogo | null>(null);
  const [form, setForm] = useState<FormCotacao>({ quantidade: '', cidade: '', prazo: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(id ? 'Carregando oferta…' : 'Selecione uma oferta no catálogo.');

  useEffect(() => {
    let ativo = true;
    if (id) consultarCatalogo('', 0, id).then(
      ([item]) => {
        if (!ativo) return;
        setOferta(item ?? null);
        setMensagem(item ? '' : 'Esta oferta não está mais disponível.');
      },
      (erro: unknown) => { if (ativo) setMensagem(erro instanceof Error ? erro.message : 'Não foi possível carregar a oferta.'); },
    );
    return () => { ativo = false; };
  }, [id]);

  function editar(campo: keyof FormCotacao, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setMensagem('');
  }

  async function enviar() {
    if (!oferta || enviando) return;
    setEnviando(true);
    try {
      const organizacao = await organizacaoEmUso();
      if (!organizacao) throw new Error('Cadastre a empresa compradora antes de pedir cotação.');
      await solicitarCotacao(organizacao, oferta.id, form);
      router.dismissTo(rotasCliente.cotacoes);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível enviar a cotação.');
    } finally {
      setEnviando(false);
    }
  }

  const valido = !!oferta && form.quantidade.trim().length > 0 && form.cidade.trim().length > 1 && form.prazo.length === 10;

  return (
    <Screen
      header={<ScreenHeader title="Solicitar cotação" />}
      footer={<Button label="Enviar cotação" disabled={!valido || enviando} loading={enviando} onPress={() => void enviar()} />}
    >
      {oferta && (
        <Card>
          <View style={styles.product}>
            <MediaThumb size={sizes.thumb} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{`${oferta.produto} · ${oferta.fornecedor}`}</AppText>
              <AppText variant="caption" color="textSecondary">
                {`Disponível: ${oferta.quantidade} ${oferta.unidade} · ${oferta.cidade}/${oferta.uf}`}
              </AppText>
            </View>
          </View>
        </Card>
      )}
      {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}

      <InlineFieldRow icon={Package} label="Quantidade">
        <TextField placeholder="0" suffix={oferta?.unidade ?? 'kg'} keyboardType="numeric" value={form.quantidade} onChangeText={(t) => editar('quantidade', t)} />
      </InlineFieldRow>
      <InlineFieldRow icon={MapPin} label="Cidade (SP)">
        <TextField placeholder="Cidade de entrega" value={form.cidade} onChangeText={(t) => editar('cidade', t)} autoCapitalize="words" />
      </InlineFieldRow>
      <InlineFieldRow icon={CalendarDays} label="Entrega">
        <TextField placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} value={form.prazo} onChangeText={(t) => editar('prazo', mascaraData(t))} />
      </InlineFieldRow>
      <InlineFieldRow icon={FileText} label="Embalagem">
        <TextField placeholder="Ex.: caixas de 20 kg" value={form.mensagem} onChangeText={(t) => editar('mensagem', t)} maxLength={500} />
      </InlineFieldRow>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
