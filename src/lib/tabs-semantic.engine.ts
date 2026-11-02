import type { TabsConfig, TabsSemantic, TabsSemanticProps, TabsSlots } from './tabs.types';

/** useMergeSemantic Tabs: классы накапливаются, CSS-строки сохраняют порядок слоёв. */
export function tabsSemantics(
  context: TabsConfig | undefined,
  classNames: TabsSemantic | undefined,
  styles: TabsSemantic | undefined,
  props: TabsSemanticProps
) {
  const resolve = (value: TabsSemantic | undefined) =>
    (typeof value === 'function' ? value({ props }) : value) ?? {};
  const contextClasses = resolve(context?.classNames);
  const localClasses = resolve(classNames);
  const contextStyles = resolve(context?.styles);
  const localStyles = resolve(styles);
  const popup = (slots: TabsSlots) => typeof slots.popup === 'string'
    ? slots.popup : slots.popup?.root;
  const join = (values: (string | undefined)[], separator: string) =>
    values.filter(Boolean).join(separator) || undefined;
  const classes: Omit<TabsSlots, 'popup'> = {};
  const mergedStyles: Omit<TabsSlots, 'popup'> = {};

  for (const slot of ['root', 'item', 'remove', 'indicator', 'body', 'content', 'header'] as const) {
    classes[slot] = join([contextClasses[slot], localClasses[slot]], ' ');
    mergedStyles[slot] = join(
      [
        contextStyles[slot],
        slot === 'root' ? context?.style : undefined,
        localStyles[slot],
        slot === 'root' ? props.style : undefined
      ],
      ';'
    );
  }

  return {
    classes: {
      ...classes,
      popup: { root: join([popup(contextClasses), popup(localClasses)], ' ') }
    },
    styles: {
      ...mergedStyles,
      popup: { root: join([popup(contextStyles), popup(localStyles)], ';') }
    }
  };
}
