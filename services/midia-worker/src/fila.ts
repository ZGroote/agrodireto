/** Fila simples: no máximo `concorrencia` tarefas ao mesmo tempo (vídeo é pesado). */
export function criarFila(concorrencia: number) {
  let ativos = 0;
  const espera: (() => void)[] = [];

  return async function executar<T>(tarefa: () => Promise<T>): Promise<T> {
    if (ativos >= Math.max(1, concorrencia)) await new Promise<void>((liberado) => espera.push(liberado));
    ativos += 1;
    try {
      return await tarefa();
    } finally {
      ativos -= 1;
      espera.shift()?.();
    }
  };
}
