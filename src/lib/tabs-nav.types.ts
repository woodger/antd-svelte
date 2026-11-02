import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { TabsAnimatedConfig } from './tabs-motion.types';
import type {
  TabsContent,
  TabsExtraContent,
  TabsIndicator,
  TabsItem,
  TabsLocale,
  TabsMoreProps,
  TabsPosition,
  TabsScrollInfo,
  TabsSlots
} from './tabs.types';

/** Настройки добавления и удаления в стандартной панели заголовков. */
export interface TabsEditableConfig {
  onEdit: (
    action: 'add' | 'remove',
    info: { key?: string; event: MouseEvent | KeyboardEvent; }
  ) => void;
  showAdd?: boolean;
  addIcon?: TabsContent;
  removeIcon?: TabsContent;
}

type TabsBarSlots = Omit<TabsSlots, 'popup'> & { popup?: string; };

/** Заголовок вкладки; attributes дополняют или заменяют атрибуты его корневого элемента. */
export type TabsTabNode = Snippet<[attributes?: HTMLAttributes<HTMLElement>]>;

/** Разрешённые настройки TabNavList; popup уже плоский, как в исходном rc-tabs. */
export interface TabsTabBarProps {
  id: string;
  activeKey: string | undefined;
  animated: TabsAnimatedConfig;
  tabPosition: TabsPosition;
  rtl: boolean;
  mobile: boolean;
  editable?: TabsEditableConfig;
  locale?: TabsLocale;
  more?: TabsMoreProps & { transitionName?: string; };
  tabBarGutter?: number;
  onTabClick: (key: string, event: MouseEvent | KeyboardEvent) => void;
  onTabScroll?: (info: TabsScrollInfo) => void;
  extra?: TabsExtraContent;
  className?: string;
  style?: string;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  popupClassName?: string;
  indicator?: TabsIndicator;
  classNames?: TabsBarSlots;
  styles?: TabsBarSlots;
  /** Аналог renderWrapper: node принимает DOM attributes и Svelte attachments. */
  children?: Snippet<[node: TabsTabNode, item: TabsItem]>;
}

export interface TabsNavApi {
  readonly element: HTMLDivElement | undefined;
  focusTab: (key: string | undefined) => void;
}

export interface TabsNavContext {
  readonly items: readonly TabsItem[];
  readonly root: HTMLDivElement | undefined;
  readonly ownerId: string;
  readonly rootPlacement: TabsPosition;
  readonly centered: boolean;
  readonly card: boolean;
  readonly ariaLabel: string | undefined;
  readonly ariaLabelledby: string | undefined;
  readonly themeClassName: string | undefined;
  readonly themeStyle: string | undefined;
  readonly defaultMoreIcon: TabsContent;
  register: (api: TabsNavApi) => () => void;
}
