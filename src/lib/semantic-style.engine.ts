/** Плоские semantic slots: классы накапливаются, CSS-строки сохраняют source порядок слоёв. */
type Semantic<Key extends string, Props> = Partial<Record<Key, string>>
  | ((info: { props: Props; }) => Partial<Record<Key, string>> | undefined);

export function mergeComponentSemantics<Key extends string, Props extends { style?: string | null; }>(
  context: {
    classNames?: Semantic<Key, Props>;
    styles?: Semantic<Key, Props>;
    style?: string | null;
  } | undefined,
  props: Props & { classNames?: Semantic<Key, Props>; styles?: Semantic<Key, Props>; },
  keys: readonly Key[]
) {
  const resolve = (value: Semantic<Key, Props> | undefined): Partial<Record<Key, string>> =>
    (typeof value === 'function' ? value({ props }) : value) ?? {};
  const contextClasses = resolve(context?.classNames);
  const localClasses = resolve(props.classNames);
  const contextStyles = resolve(context?.styles);
  const localStyles = resolve(props.styles);
  const join = (values: (string | null | undefined)[], separator: string) =>
    values.filter(Boolean).join(separator) || undefined;
  const classes: Partial<Record<Key, string>> = {};
  const styles: Partial<Record<Key, string>> = {};

  for (const key of keys) {
    classes[key] = join([contextClasses[key], localClasses[key]], ' ');
    styles[key] = join([
      contextStyles[key],
      key === 'root' ? context?.style : undefined,
      localStyles[key],
      key === 'root' ? props.style : undefined
    ], ';');
  }

  return { classes, styles };
}
