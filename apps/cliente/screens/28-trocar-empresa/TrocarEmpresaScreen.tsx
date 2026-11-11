import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { AppText, Card, Divider, EmptyState, ListRow, Screen, ScreenHeader, StatusPill, VStack } from '@agrodireto/ui';
import { contextoAtual, listarVinculos, trocarContexto, type Vinculo } from '@/lib/organizacoes';

const situacao = { em_analise: 'Em análise', ajustes_solicitados: 'Ajustes solicitados', aprovada: 'Aprovada' } as const;

/** 28 · Trocar empresa — escolha explícita da empresa em uso (troca auditada no servidor). */
export default function TrocarEmpresaScreen() {
  const [vinculos, setVinculos] = useState<Vinculo[] | null>(null);
  const [atual, setAtual] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [trocando, setTrocando] = useState(false);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setErro('');
    void Promise.all([listarVinculos(), contextoAtual()]).then(
      ([lista, contexto]) => { if (ativo) { setVinculos(lista); setAtual(contexto); } },
      () => { if (ativo) setErro('Não foi possível consultar suas empresas. Abra a tela novamente para tentar.'); },
    );
    return () => { ativo = false; };
  }, []));

  async function escolher(organizacao: string) {
    if (trocando || organizacao === atual) return;
    setTrocando(true);
    setErro('');
    try {
      await trocarContexto(organizacao);
      setAtual(organizacao);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível trocar de empresa. Tente novamente.');
    } finally {
      setTrocando(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Trocar empresa" />}>
      {erro ? <AppText variant="body" color="danger">{erro}</AppText> : null}
      {vinculos && vinculos.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhuma empresa" description="Ela é criada quando você envia o cadastro da empresa." />
      ) : null}
      {vinculos && vinculos.length > 0 ? (
        <VStack gap="sm">
          {!vinculos.some((v) => v.organizacao_id === atual) ? (
            <AppText variant="caption" color="textSecondary">Escolha a empresa em que você vai comprar.</AppText>
          ) : null}
          <Card>
            {vinculos.map((v, i) => (
              <VStack key={v.organizacao_id} gap="xs">
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon={Building2}
                  title={v.nome}
                  subtitle={`${v.papel === 'titular' ? 'Titular' : 'Membro'}${v.status_cadastro ? ` · ${situacao[v.status_cadastro]}` : ''}`}
                  trailing={v.organizacao_id === atual ? <StatusPill label="Em uso" /> : undefined}
                  chevron={false}
                  onPress={v.organizacao_id === atual ? undefined : () => void escolher(v.organizacao_id)}
                />
              </VStack>
            ))}
          </Card>
        </VStack>
      ) : null}
    </Screen>
  );
}
