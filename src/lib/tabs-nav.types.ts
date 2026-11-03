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

/** Атрибуты внешнего узла заголовка; нативная кнопка tab остаётся внутри. */
export type TabsTabAttributes = HTMLAttributes<HTMLElement>;

export type TabsTabNode = Snippet<[attributes?: TabsTabAttributes]>;

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
  /** Замена целиком: отсутствие icon возвращает текст More исходного OperationNode. */
  more?: TabsMoreProps & { transitionName?: string; };
  tabBarGutter?: number;
  /** Native выбор; KeyboardEvent сохраняет публичный MouseEvent contract и cancellation. */
  onTabClick: (key: string, event: MouseEvent | KeyboardEvent) => void;
  onTabScroll?: (info: TabsScrollInfo) => void;
  extra?: TabsExtraContent;
  className?: string;
  /** Callback-ref стандартной панели; null при замене ref/unmount, не вызывается при SSR. */
  ref?: (element: HTMLDivElement | null) => void;
  style?: string;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  popupClassName?: string;
  indicator?: TabsIndicator;
  /** Разрешённые semantic slots; popup — плоская строка. */
  classNames?: TabsBarSlots;
  /** CSS-строки; изменения body/content здесь не меняют панели Tabs. */
  styles?: TabsBarSlots;
  /** Аналог renderWrapper/cloneElement: исходные attributes доступны для merge и attachments. */
  children?: Snippet<[node: TabsTabNode, item: TabsItem, attributes: TabsTabAttributes]>;
}

/** Стандартная навигация с полным набором props; для замены используйте spread исходных props. */
export type TabsDefaultTabBar = Snippet<[props: TabsTabBarProps]>;

/** Custom bar заменяет только навигацию; панели и их lifecycle остаются в Tabs. */
export type TabsRenderTabBar = Snippet<[
  props: TabsTabBarProps,
  DefaultTabBar: TabsDefaultTabBar
]>;

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
