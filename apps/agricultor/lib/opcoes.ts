import type { SelectOption } from '@agrodireto/ui';

/** ['A', 'B'] → [{ label: 'A', value: 'A' }, ...] para o SelectField. */
export const opcoes = (lista: readonly string[]): SelectOption[] => lista.map((v) => ({ label: v, value: v }));
