import type { CardConfig, CardMetaConfig, CardProps, CardMetaProps, CardSlots, CardMetaSlots }
  from './card.types';

type Semantic<Key extends string, Props> = Partial<Record<Key, string>>
  | ((info: { props: Props; }) => Partial<Record<Key, string>>);

function mergeSemantics<Key extends string, Props extends { style?: string; }>(
  context: {
    classNames?: Semantic<Key, Props>;
    styles?: Semantic<Key, Props>;
    style?: string;
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
  const join = (values: (string | undefined)[], separator: string) =>
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

/** Порядок useMergeSemantic Card; legacy header/body остаются ниже merged semantic styles. */
export function cardSemantics(context: CardConfig | undefined, props: CardProps) {
  return mergeSemantics<keyof CardSlots, CardProps>(context, props,
    ['root', 'header', 'body', 'title', 'extra', 'actions', 'cover']);
}

export function cardMetaSemantics(context: CardMetaConfig | undefined, props: CardMetaProps) {
  return mergeSemantics<keyof CardMetaSlots, CardMetaProps>(context, props,
    ['root', 'section', 'avatar', 'title', 'description']);
}
