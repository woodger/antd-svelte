import type {
  TimePickerConfig,
  TimePickerProps,
  TimePickerSemantic,
  TimePickerSlots,
  TimePickerPopupSlots
} from './time-picker.types';

export function mergePickerSlots(values: (TimePickerSlots | undefined)[], separator: string) {
  const popup = (value: TimePickerSlots | undefined): TimePickerPopupSlots =>
    typeof value?.popup === 'string' ? { root: value.popup } : value?.popup ?? {};
  const join = (parts: (string | undefined)[]) =>
    parts.filter(Boolean).join(separator) || undefined;

  return {
    root: join(values.map(value => value?.root)),
    prefix: join(values.map(value => value?.prefix)),
    input: join(values.map(value => value?.input)),
    suffix: join(values.map(value => value?.suffix)),
    popup: {
      root: join(values.map(value => popup(value).root)),
      content: join(values.map(value => popup(value).content)),
      item: join(values.map(value => popup(value).item)),
      footer: join(values.map(value => popup(value).footer)),
      container: join(values.map(value => popup(value).container))
    }
  };
}

/** Semantic слои outer TimePicker/inner SinglePicker, включая порядок callbacks. */
export function timePickerSemantic(
  props: TimePickerProps,
  config: TimePickerConfig | undefined,
  resolved: Pick<TimePickerProps, 'variant' | 'size' | 'disabled'>
) {
  const resolve = (value: TimePickerSemantic | undefined, props: TimePickerProps) =>
    typeof value === 'function' ? value({ props }) : value;
  const outerProps = { ...props, variant: resolved.variant };
  const outerClasses = mergePickerSlots([
    resolve(config?.classNames, outerProps), resolve(props.classNames, outerProps)
  ], ' ');
  const outerStyles = mergePickerSlots([
    resolve(config?.styles, outerProps), { root: config?.style },
    resolve(props.styles, outerProps)
  ], ';');
  const innerProps: TimePickerProps = {
    ...outerProps,
    ...resolved,
    classNames: outerClasses,
    styles: outerStyles,
    renderExtraFooter: props.renderExtraFooter
  };

  return {
    classes: mergePickerSlots([resolve(config?.classNames, innerProps), outerClasses], ' '),
    styles: mergePickerSlots([
      resolve(config?.styles, innerProps), { root: config?.style }, outerStyles
    ], ';')
  };
}
