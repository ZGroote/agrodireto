import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { Check, ChevronDown, Eye, EyeOff, Search, X, type LucideIcon } from 'lucide-react-native';
import { colors, fontFamily, radius, sizes, spacing, typography } from '../theme';
import { AppText } from './AppText';

/* ---------------------------------- Label --------------------------------- */

function FieldLabel({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <AppText variant="label" color="textPrimary" style={styles.label}>
      {label}
    </AppText>
  );
}

/* -------------------------------- TextField ------------------------------- */

export type TextFieldProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  icon?: LucideIcon;
  /** Texto fixo antes do valor (ex.: "R$") */
  prefix?: string;
  suffix?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  editable?: boolean;
};

/** Input com label e ícone à esquerda (Telefone, Nome, Código…). */
export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  prefix,
  suffix,
  secure,
  keyboardType,
  autoCapitalize,
  maxLength,
  editable = true,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.fieldWrap}>
      <FieldLabel label={label} />
      <View style={[styles.box, focused && styles.boxFocused]}>
        {Icon ? <Icon size={sizes.iconSm} color={colors.textSecondary} /> : null}
        {prefix ? <AppText variant="body">{prefix}</AppText> : null}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label ?? placeholder}
        />
        {suffix ? (
          <AppText variant="body" color="textSecondary">
            {suffix}
          </AppText>
        ) : null}
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            {hidden ? (
              <Eye size={sizes.iconSm} color={colors.textSecondary} />
            ) : (
              <EyeOff size={sizes.iconSm} color={colors.textSecondary} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* ------------------------------- SelectField ------------------------------ */

export type SelectOption<V extends string = string> = { label: string; value: V };

type SelectFieldProps<V extends string> = {
  label?: string;
  value?: V;
  options: readonly SelectOption<V>[];
  onChange: (value: V) => void;
  placeholder?: string;
  icon?: LucideIcon;
  /** Texto exibido quando ainda não há opções (ex.: catálogo não carregado) */
  emptyMessage?: string;
};

/** Campo de seleção (dropdown). Abre uma folha com as opções. */
export function SelectField<V extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecionar',
  icon: Icon,
  emptyMessage = 'Nenhuma opção disponível.',
}: SelectFieldProps<V>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.fieldWrap}>
      <FieldLabel label={label} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.box, pressed && styles.pressed]}
      >
        {Icon ? <Icon size={sizes.iconSm} color={colors.textSecondary} /> : null}
        <AppText variant="body" color={selected ? 'textPrimary' : 'textSecondary'} style={styles.flex} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </AppText>
        <ChevronDown size={sizes.iconSm} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          {label ? <AppText variant="heading">{label}</AppText> : null}
          {options.length === 0 ? (
            <AppText variant="body" color="textSecondary" style={styles.sheetEmpty}>
              {emptyMessage}
            </AppText>
          ) : (
            <ScrollView style={styles.sheetList}>
              {options.map((o) => {
                const isOn = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isOn }}
                    onPress={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                  >
                    <AppText variant={isOn ? 'bodyStrong' : 'body'} color={isOn ? 'primary' : 'textPrimary'} style={styles.flex}>
                      {o.label}
                    </AppText>
                    {isOn ? <Check size={sizes.iconMd} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------- SearchField ------------------------------ */

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChangeText, placeholder = 'Buscar' }: SearchFieldProps) {
  return (
    <View style={styles.box}>
      <Search size={sizes.iconSm} color={colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Limpar busca">
          <X size={sizes.iconSm} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------- TextArea -------------------------------- */

type TextAreaProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
};

/** Área de texto com contador ("54/120"). */
export function TextArea({ label, value, onChangeText, placeholder, maxLength = 120 }: TextAreaProps) {
  return (
    <View style={styles.fieldWrap}>
      <FieldLabel label={label} />
      <View style={[styles.box, styles.areaBox]}>
        <TextInput
          style={[styles.input, styles.area]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          accessibilityLabel={label ?? placeholder}
        />
        <AppText variant="caption" color="textSecondary" style={styles.counter}>
          {value.length}/{maxLength}
        </AppText>
      </View>
    </View>
  );
}

/* -------------------------------- OTPInput -------------------------------- */

type OTPInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

/** Código de verificação em caixas separadas (Administrador · Verificação de segurança). */
export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.otpRow} accessibilityLabel="Código de verificação">
      {digits.map((d, i) => (
        <View key={i} style={[styles.otpCell, i === value.length && styles.boxFocused]}>
          <AppText variant="heading">{d}</AppText>
        </View>
      ))}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.otpHidden}
        autoFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { gap: spacing.xs + 2 },
  label: { marginLeft: spacing.xxs },
  box: {
    minHeight: sizes.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  boxFocused: { borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  input: {
    flex: 1,
    ...typography.body,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  flex: { flex: 1 },
  areaBox: { alignItems: 'stretch', flexDirection: 'column', paddingVertical: spacing.sm },
  area: { minHeight: 72 },
  counter: { alignSelf: 'flex-end' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  otpCell: {
    flex: 1,
    height: 52,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpHidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
    maxHeight: '70%',
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetList: { flexGrow: 0 },
  sheetEmpty: { paddingVertical: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.rowMinHeight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
