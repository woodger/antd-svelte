interface OverlaySlots {
  root?: string;
  container?: string;
  arrow?: string;
  title?: string;
  content?: string;
  icon?: string;
}

type Semantic<Props> = OverlaySlots | ((info: { props: Props }) => OverlaySlots);

/** useMergeSemantic: классы накапливаются, стили сохраняют порядок source-слоёв. */
export function getOverlaySemantics<Props>(
  context: { classNames?: Semantic<Props>; styles?: Semantic<Props>; style?: string } | undefined,
  classNames: Semantic<Props> | undefined,
  styles: Semantic<Props> | undefined,
  props: Props,
  overlayStyle?: string
) {
  const resolve = (value: Semantic<Props> | undefined) =>
    (typeof value === 'function' ? value({ props }) : value) ?? {};
  const contextClasses = resolve(context?.classNames);
  const localClasses = resolve(classNames);
  const contextStyles = resolve(context?.styles);
  const localStyles = resolve(styles);
  const classes: OverlaySlots = {};
  const mergedStyles: OverlaySlots = {};

  for (const slot of ['root', 'container', 'arrow', 'title', 'content', 'icon'] as const) {
    classes[slot] = [contextClasses[slot], localClasses[slot]].filter(Boolean).join(' ') || undefined;
    mergedStyles[slot] = [
      contextStyles[slot],
      slot === 'root' && context?.style,
      localStyles[slot],
      slot === 'root' && overlayStyle
    ].filter(Boolean).join(';') || undefined;
  }

  return { classNames: classes, styles: mergedStyles };
}
