import { getContext, setContext } from 'svelte';
import type { MenuEntry } from './menu.engine';
import type { MenuMode, MenuProps, MenuTheme } from './menu.types';

export interface MenuContext {
  readonly prefixCls: string;
  readonly rootPrefixCls: string;
  readonly componentTheme: {
    readonly className: string | undefined;
    readonly style: string | undefined;
    readonly inheritedStyle: string | undefined;
  };
  readonly mode: MenuMode;
  readonly theme: MenuTheme;
  readonly collapsed: boolean;
  readonly disabled: boolean;
  readonly direction: 'ltr' | 'rtl';
  readonly inlineIndent: number;
  readonly selected: readonly string[];
  readonly open: readonly string[];
  readonly active: string | null;
  readonly forceRender: boolean;
  readonly trigger: 'hover' | 'click';
  readonly openDelay: number;
  readonly closeDelay: number;
  readonly nativeElement: HTMLUListElement | undefined;
  readonly getPopupContainer: MenuProps['getPopupContainer'];
  id: (key: string) => string;
  register: (key: string, element: HTMLElement) => () => void;
  registerHover: (key: string, handler: (open: boolean) => void) => () => void;
  hover: (entry: MenuEntry, open: boolean) => void;
  keydown: NonNullable<MenuProps['onkeydown']>;
  activate: (key: string | null) => void;
  click: (entry: MenuEntry, event: MouseEvent | KeyboardEvent) => void;
  titleClick: (entry: MenuEntry, event: MouseEvent) => void;
  setOpen: (entry: MenuEntry, open: boolean) => void;
  keyboard: (entry: MenuEntry | null, event: KeyboardEvent) => void;
  focusItem: (key: string) => void;
}

const key = Symbol('ant-menu');
export function provideMenu(context: MenuContext) {
  setContext(key, context);
}
export function useMenu(): MenuContext {
  return getContext(key);
}
