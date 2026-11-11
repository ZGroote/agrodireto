/**
 * Fila no banco: assume até `concorrencia` trabalhos por vez e processa. `acordar` é chamado no início,
 * a cada aviso do webhook e periodicamente; assim o que ficou na fila depois de um reinício é retomado.
 */
export function criarFila<T>(concorrencia: number, assumir: () => Promise<T | null>, processar: (trabalho: T) => Promise<unknown>) {
  const limite = Math.max(1, concorrencia);
  let ativos = 0;
  let buscando = false;
  let pedido = false;

  return async function acordar(): Promise<void> {
    pedido = true;
    if (buscando) return;
    buscando = true;
    try {
      // Um aviso que chega durante a busca faz buscar de novo, para não perder trabalho novo.
      while (pedido && ativos < limite) {
        pedido = false;
        while (ativos < limite) {
          const trabalho = await assumir();
          if (!trabalho) break;
          ativos += 1;
          void processar(trabalho)
            .catch((e: unknown) => console.error('Falha ao processar trabalho:', e))
            .finally(() => {
              ativos -= 1;
              void acordar();
            });
        }
      }
    } catch (e) {
      console.error('Falha ao consultar a fila:', e instanceof Error ? e.message : e);
    } finally {
      buscando = false;
    }
  };
}
