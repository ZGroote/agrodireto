import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Mail, UserMinus, UserPlus } from 'lucide-react-native';
import {
  AppText, Button, Card, Divider, ListRow, Screen, ScreenHeader, SelectField, type SelectOption, spacing, StatusPill, TextField,
} from '@agrodireto/ui';
import { acoes, concederAcesso, listarEquipe, papeis, pode, revogarAcesso, type MembroEquipe, type Papel } from '@/lib/equipe';
import { supabase } from '@/lib/supabase';
import { usePode } from '@/components/PapelEquipe';

const opcoesPapel: SelectOption<Papel>[] = papeis.map((p) => ({ value: p.value, label: p.label }));
const nomePapel = (papel: Papel) => papeis.find((p) => p.value === papel)?.label ?? papel;

/**
 * 18 · Papéis e permissões — o que cada papel pode (só leitura: a matriz é fixa no servidor, equipe_pode)
 * e, fora do mockup, a equipe: o geral concede, troca e revoga por e-mail; o auditor só consulta.
 */
export default function PapeisPermissoesScreen() {
  const gerir = usePode()('gerir_equipe');
  const [funcao, setFuncao] = useState<Papel>();
  const [equipe, setEquipe] = useState<MembroEquipe[] | null>(null);
  const [eu, setEu] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [papelNovo, setPapelNovo] = useState<Papel>();
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(() => {
    let ativo = true;
    void Promise.all([listarEquipe(), supabase?.auth.getSession()]).then(
      ([lista, sessao]) => { if (ativo) { setEquipe(lista); setEu(sessao?.data.session?.user.id ?? null); } },
      (e) => { if (ativo) setMensagem(e instanceof Error ? e.message : 'Não foi possível consultar a equipe.'); },
    );
    return () => { ativo = false; };
  }, []);
  useFocusEffect(carregar);

  async function executar(acao: () => Promise<string | void>) {
    if (ocupado) return;
    setOcupado(true);
    setMensagem('');
    try {
      setMensagem((await acao()) ?? 'Acesso revogado.');
      carregar();
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Não foi possível concluir. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Screen withTabBar header={<ScreenHeader title="Papéis e permissões" />}>
      <SelectField label="Função" value={funcao} options={opcoesPapel} onChange={setFuncao} placeholder="Selecione" />

      {/* Desvio do mockup (DOC 036): no lugar dos toggles e de "Salvar permissões", só leitura — a matriz é do servidor. */}
      {funcao ? (
        <View style={styles.section}>
          <AppText variant="heading">Permissões</AppText>
          <Card>
            {acoes.map((a, i) => (
              <View key={a.value}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={a.label}
                  trailing={pode(funcao, a.value) ? <StatusPill label="Pode" /> : <StatusPill label="Não pode" tone="neutral" />}
                />
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {/* Não está no mockup: equipe e concessão de acesso (B05). */}
      <View style={styles.section}>
        <AppText variant="heading">Equipe</AppText>
        {!!mensagem && <AppText accessibilityLiveRegion="polite">{mensagem}</AppText>}
        {equipe ? (
          <Card>
            {equipe.map((m, i) => (
              <View key={m.usuario_id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={m.email}
                  subtitle={`${nomePapel(m.papel)} · desde ${new Date(m.concedido_em).toLocaleDateString('pt-BR')}`}
                  trailing={gerir && m.usuario_id !== eu ? (
                    <Button label="Revogar" variant="secondary" icon={UserMinus} disabled={ocupado} onPress={() => void executar(() => revogarAcesso(m.usuario_id))} />
                  ) : undefined}
                />
              </View>
            ))}
          </Card>
        ) : null}
        {gerir ? (
          <Card>
            <View style={styles.section}>
              <AppText variant="caption" color="textSecondary">
                Concede ou troca o papel de uma conta já criada. A sua própria conta não pode ser alterada aqui.
              </AppText>
              <TextField label="E-mail" icon={Mail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="nome@agrodireto.com" />
              <SelectField label="Papel" value={papelNovo} options={opcoesPapel} onChange={setPapelNovo} placeholder="Selecione" />
              <Button
                label="Conceder acesso"
                icon={UserPlus}
                loading={ocupado}
                disabled={ocupado || !email.trim() || !papelNovo}
                onPress={() => papelNovo && void executar(async () => {
                  const resultado = await concederAcesso(email, papelNovo);
                  if (resultado === 'Acesso concedido.') setEmail('');
                  return resultado;
                })}
              />
            </View>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
});
