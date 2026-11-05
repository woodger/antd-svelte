import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';
import type {
  CollapseExpandIconInfo, CollapseItem, CollapseProps, CollapseSemanticSlots, CollapseTrigger
} from './collapse.types';

export interface CollapseContext {
  readonly prefix: string;
  readonly direction: 'ltr' | 'rtl';
  readonly headingLevel: NonNullable<CollapseProps['headingLevel']>;
  readonly collapsible?: CollapseTrigger;
  readonly destroyOnHidden: boolean;
  readonly region: boolean;
  readonly classes: CollapseSemanticSlots;
  readonly styles: CollapseSemanticSlots;
  readonly openKeys: readonly string[];
  readonly expandIcon?: Snippet<[CollapseExpandIconInfo]>;
  itemId(key: string, kind: 'header' | 'panel' | 'label'): string;
  toggle(key: string, event?: MouseEvent, item?: CollapseItem): void;
  iconInfo(
    item: CollapseItem & { key: string }, open: boolean,
    classes: CollapseSemanticSlots, styles: CollapseSemanticSlots
  ): CollapseExpandIconInfo;
  register(item: () => CollapseItem & { key: string }, element: () => HTMLDivElement | undefined): {
    index: number;
    mount(): void;
    destroy(): void;
  };
}

const key = Symbol('ant-collapse');
export function provideCollapse(context: CollapseContext) {
  setContext(key, context);
}
export function useCollapse(): CollapseContext | undefined {
  return getContext(key);
}
