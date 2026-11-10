import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors, radius, sizes, spacing, typography } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

/**
 * Pop-ups de inserção de informação: escolher data, escolher período e digitar um valor.
 * Aparecem como folha na base da tela. Os campos que os abrem (DateField, PopupField) têm a mesma
 * aparência dos campos dos mockups.
 */

/* ------------------------------ folha base -------------------------------- */

type FolhaProps = { visible: boolean; onClose: () => void; titulo: string; children: ReactNode };

function Folha({ visible, onClose, titulo, children }: FolhaProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <AppText variant="heading">{titulo}</AppText>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------------------------------- datas --------------------------------- */

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const dois = (n: number) => String(n).padStart(2, '0');

/** Date → "05/11/2026" */
export const formatarData = (d: Date): string => `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;

/** "05/11/2026" → Date (null se o texto não for uma data válida). */
export function lerData(texto: string): Date | null {
  const m = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? d : null;
}

/** Período → "05/11 a 06/11/2026" (ou "05/11/2026 a 06/12/2027" se cruzar o ano). */
export function formatarPeriodo(a: Date, b: Date): string {
  const curto = (d: Date) => `${dois(d.getDate())}/${dois(d.getMonth() + 1)}`;
  return a.getFullYear() === b.getFullYear() ? `${curto(a)} a ${formatarData(b)}` : `${formatarData(a)} a ${formatarData(b)}`;
}

/** "05/11 a 06/11/2026" → [Date, Date]. */
export function lerPeriodo(texto: string): [Date, Date] | null {
  const completo = texto.match(/(\d{2})\/(\d{2})(?:\/(\d{4}))? a (\d{2})\/(\d{2})\/(\d{4})/);
  if (!completo) return null;
  const anoFim = Number(completo[6]);
  const anoIni = completo[3] ? Number(completo[3]) : anoFim;
  const ini = new Date(anoIni, Number(completo[2]) - 1, Number(completo[1]));
  const fim = new Date(anoFim, Number(completo[5]) - 1, Number(completo[4]));
  return [ini, fim];
}

const mesmoDia = (a?: Date, b?: Date) => !!a && !!b && a.toDateString() === b.toDateString();

/* -------------------------------- Calendário ------------------------------ */

type Selecao = { inicio?: Date; fim?: Date };

type CalendarioSheetProps = {
  visible: boolean;
  onClose: () => void;
  titulo: string;
  modo: 'dia' | 'periodo';
  valor?: Selecao;
  onConfirmar: (selecao: { inicio: Date; fim: Date }) => void;
};

/** Pop-up de calendário: escolhe um dia ou um período (primeiro toque = início, segundo = fim). */
export function CalendarioSheet({ visible, onClose, titulo, modo, valor, onConfirmar }: CalendarioSheetProps) {
  return (
    <Folha visible={visible} onClose={onClose} titulo={titulo}>
      {/* O corpo só existe com o pop-up aberto: o estado nasce limpo a cada abertura. */}
      {visible ? <CalendarioCorpo onClose={onClose} modo={modo} valor={valor} onConfirmar={onConfirmar} /> : null}
    </Folha>
  );
}

type CorpoProps = Pick<CalendarioSheetProps, 'onClose' | 'modo' | 'valor' | 'onConfirmar'>;

function CalendarioCorpo({ onClose, modo, valor, onConfirmar }: CorpoProps) {
  const [cursor, setCursor] = useState(() => {
    const base = valor?.inicio ?? new Date();
    return { ano: base.getFullYear(), mes: base.getMonth() };
  });
  const [sel, setSel] = useState<Selecao>(valor ?? {});

  const celulas = useMemo(() => {
    const primeiro = new Date(cursor.ano, cursor.mes, 1).getDay();
    const dias = new Date(cursor.ano, cursor.mes + 1, 0).getDate();
    return [...Array<number | null>(primeiro).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)];
  }, [cursor]);

  const mover = (delta: number) => {
    const d = new Date(cursor.ano, cursor.mes + delta, 1);
    setCursor({ ano: d.getFullYear(), mes: d.getMonth() });
  };

  const tocar = (dia: number) => {
    const d = new Date(cursor.ano, cursor.mes, dia);
    if (modo === 'dia') return setSel({ inicio: d, fim: d });
    if (!sel.inicio || sel.fim) return setSel({ inicio: d });
    if (d < sel.inicio) return setSel({ inicio: d });
    setSel({ inicio: sel.inicio, fim: d });
  };

  const dentro = (d: Date) => !!sel.inicio && !!sel.fim && d > sel.inicio && d < sel.fim;
  const pronto = modo === 'dia' ? !!sel.inicio : !!sel.inicio;

  const confirmar = () => {
    if (!sel.inicio) return;
    onConfirmar({ inicio: sel.inicio, fim: sel.fim ?? sel.inicio });
    onClose();
  };

  return (
    <>
      <View style={styles.cabecalho}>
        <Pressable onPress={() => mover(-1)} hitSlop={8} accessibilityLabel="Mês anterior">
          <ChevronLeft size={sizes.iconMd} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="bodyStrong">
          {MESES[cursor.mes]} {cursor.ano}
        </AppText>
        <Pressable onPress={() => mover(1)} hitSlop={8} accessibilityLabel="Próximo mês">
          <ChevronRight size={sizes.iconMd} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.grade}>
        {SEMANA.map((s, i) => (
          <View key={`s${i}`} style={styles.celula}>
            <AppText variant="caption" color="textSecondary">
              {s}
            </AppText>
          </View>
        ))}
        {celulas.map((dia, i) => {
          if (dia === null) return <View key={`v${i}`} style={styles.celula} />;
          const d = new Date(cursor.ano, cursor.mes, dia);
          const ponta = mesmoDia(d, sel.inicio) || mesmoDia(d, sel.fim);
          return (
            <View key={dia} style={styles.celula}>
              <Pressable
                onPress={() => tocar(dia)}
                accessibilityRole="button"
                accessibilityLabel={formatarData(d)}
                style={[styles.dia, dentro(d) && styles.diaDentro, ponta && styles.diaPonta]}
              >
                <AppText variant="body" color={ponta ? 'textOnPrimary' : 'textPrimary'}>
                  {dia}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>

      <AppText variant="caption" color="textSecondary">
        {modo === 'dia'
          ? sel.inicio
            ? formatarData(sel.inicio)
            : 'Toque em um dia.'
          : sel.inicio
            ? sel.fim && !mesmoDia(sel.inicio, sel.fim)
              ? formatarPeriodo(sel.inicio, sel.fim)
              : `${formatarData(sel.inicio)} · toque no último dia ou confirme só este dia`
            : 'Toque no primeiro dia e depois no último.'}
      </AppText>

      <View style={styles.botoes}>
        <View style={styles.flex}>
          <Button label="Cancelar" variant="outline" onPress={onClose} />
        </View>
        <View style={styles.flex}>
          <Button label="Confirmar" disabled={!pronto} onPress={confirmar} />
        </View>
      </View>
    </>
  );
}

/* --------------------------------- DateField ------------------------------- */

type DateFieldProps = {
  label: string;
  /** Texto exibido ("05/11/2026" ou "05/11 a 06/11/2026") */
  value: string;
  onChange: (valor: string) => void;
  modo?: 'dia' | 'periodo';
  /** Texto fixo antes do valor (ex.: "Até") */
  prefix?: string;
  icon?: LucideIcon;
  placeholder?: string;
};

/** Campo de data/período: mesma aparência do TextField, abre o pop-up de calendário. */
export function DateField({ label, value, onChange, modo = 'dia', prefix, icon: Icon = CalendarDays, placeholder = 'Selecionar' }: DateFieldProps) {
  const [aberto, setAberto] = useState(false);

  const atual: Selecao | undefined = useMemo(() => {
    if (modo === 'periodo') {
      const p = lerPeriodo(value);
      return p ? { inicio: p[0], fim: p[1] } : undefined;
    }
    const d = lerData(value);
    return d ? { inicio: d, fim: d } : undefined;
  }, [value, modo]);

  return (
    <View style={styles.campo}>
      <AppText variant="label" style={styles.rotulo}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setAberto(true)}
        style={({ pressed }) => [styles.box, pressed && styles.pressionado]}
      >
        <Icon size={sizes.iconSm} color={colors.textSecondary} />
        {value && prefix ? <AppText variant="body">{prefix}</AppText> : null}
        <AppText variant="body" color={value ? 'textPrimary' : 'textSecondary'} style={styles.flex} numberOfLines={1}>
          {value || placeholder}
        </AppText>
      </Pressable>
      <CalendarioSheet
        visible={aberto}
        onClose={() => setAberto(false)}
        titulo={label}
        modo={modo}
        valor={atual}
        onConfirmar={({ inicio, fim }) => onChange(modo === 'periodo' ? formatarPeriodo(inicio, fim) : formatarData(inicio))}
      />
    </View>
  );
}

/* ------------------------------- PopupField -------------------------------- */

type PopupFieldProps = {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  /** Título do pop-up (padrão: o rótulo) */
  titulo?: string;
  /** Unidade mostrada depois do valor ("kg") */
  sufixo?: string;
  prefix?: string;
  teclado?: KeyboardTypeOptions;
  /** Formata enquanto digita (ex.: máscara de milhar) */
  mascara?: (texto: string) => string;
  icon?: LucideIcon;
  placeholder?: string;
  descricao?: string;
};

/** Campo que mostra o valor e abre um pop-up para digitar. Ex.: "Estimativa de colheita · 2.000 kg". */
export function PopupField({ label, value, onChange, titulo, sufixo, prefix, teclado = 'default', mascara, icon: Icon, placeholder = 'Informar', descricao }: PopupFieldProps) {
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(value);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  const abrir = () => {
    setRascunho(value);
    setAberto(true);
  };
  const salvar = () => {
    onChange(rascunho.trim());
    setAberto(false);
  };

  useEffect(() => {
    if (aberto) {
      const t = setTimeout(() => input.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [aberto]);

  return (
    <View style={styles.campo}>
      <AppText variant="label" style={styles.rotulo}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={abrir}
        style={({ pressed }) => [styles.box, pressed && styles.pressionado]}
      >
        {Icon ? <Icon size={sizes.iconSm} color={colors.textSecondary} /> : null}
        <AppText variant="body" color={value ? 'textPrimary' : 'textSecondary'} style={styles.flex} numberOfLines={1}>
          {value ? `${prefix ? `${prefix} ` : ''}${value}${sufixo ? ` ${sufixo}` : ''}` : placeholder}
        </AppText>
      </Pressable>

      <Folha visible={aberto} onClose={() => setAberto(false)} titulo={titulo ?? label}>
        {descricao ? (
          <AppText variant="caption" color="textSecondary">
            {descricao}
          </AppText>
        ) : null}
        <View style={styles.entrada}>
          {prefix ? <AppText variant="body">{prefix}</AppText> : null}
          <TextInput
            ref={input}
            style={styles.input}
            value={rascunho}
            onChangeText={(t) => setRascunho(mascara ? mascara(t) : t)}
            keyboardType={teclado}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={salvar}
            accessibilityLabel={label}
          />
          {sufixo ? (
            <AppText variant="body" color="textSecondary">
              {sufixo}
            </AppText>
          ) : null}
        </View>
        <View style={styles.botoes}>
          <View style={styles.flex}>
            <Button label="Cancelar" variant="outline" onPress={() => setAberto(false)} />
          </View>
          <View style={styles.flex}>
            <Button label="Salvar" disabled={rascunho.trim().length === 0} onPress={salvar} />
          </View>
        </View>
      </Folha>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: spacing.xxs },
  dia: { width: 38, height: 34, borderRadius: radius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  diaDentro: { backgroundColor: colors.primarySoft },
  diaPonta: { backgroundColor: colors.primary },
  botoes: { flexDirection: 'row', gap: spacing.sm },
  campo: { gap: spacing.xs + 2 },
  rotulo: { marginLeft: spacing.xxs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.inputHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressionado: { opacity: 0.7 },
  entrada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.inputHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
});
