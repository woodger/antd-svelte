import type {
  TypographyConfig,
  TypographySemantic,
  TypographySemanticProps,
  TypographySlots
} from './typography.types';

export function typographySemantics(
  context: TypographyConfig | undefined,
  classes: TypographySemantic | undefined,
  styles: TypographySemantic | undefined,
  props: TypographySemanticProps
) {
  const resolve = (value: TypographySemantic | undefined) =>
    (typeof value === 'function' ? value({ props }) : value) ?? {};
  const contextClasses = resolve(context?.classNames);
  const localClasses = resolve(classes);
  const contextStyles = resolve(context?.styles);
  const localStyles = resolve(styles);
  const classNames: TypographySlots = {};
  const mergedStyles: TypographySlots = {};
  for (const name of ['root', 'actions', 'action', 'textarea'] as const) {
    classNames[name] = [name === 'root' && context?.class, contextClasses[name], localClasses[name]]
      .filter(Boolean).join(' ') || undefined;
    mergedStyles[name] = [contextStyles[name], name === 'root' && context?.style, localStyles[name]]
      .filter(Boolean).join(';') || undefined;
  }
  return { classNames, styles: mergedStyles };
}
