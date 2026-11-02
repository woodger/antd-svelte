import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TabsAnimatedConfig } from './tabs-motion.types';

export type TabsType = 'line' | 'card' | 'editable-card';
export type TabsPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TabsPosition = 'top' | 'right' | 'bottom' | 'left';
export type TabsContent = string | number | boolean | null | Snippet;
export type TabsExtraContent = TabsContent | { left?: TabsContent; right?: TabsContent; };
export type TabsIndicatorSize = number | ((origin: number) => number);

/** Размер и logical выравнивание индикатора активного заголовка. */
export interface TabsIndicator {
  /** Размер в px или чистое вычисление от полной ширины/высоты заголовка. */
  size?: TabsIndicatorSize;
  /** @defaultValue 'center' */
  align?: 'start' | 'center' | 'end';
}

/** Физическое направление изменения native scroll заголовков. */
export interface TabsScrollInfo {
  direction: 'left' | 'right' | 'top' | 'bottom';
}

export type TabsMoreTrigger = 'hover' | 'click' | 'contextMenu' | 'focus';
export type TabsMorePlacement = 'topLeft' | 'top' | 'topRight'
  | 'bottomLeft' | 'bottom' | 'bottomRight';

export interface TabsMoreRenderInfo {
  restTabs: readonly TabsItem[];
  onClose: () => void;
}

/** Параметры меню скрытых вкладок; popupRender получает исходный listbox как snippet. */
export interface TabsMoreProps {
  icon?: TabsContent;
  popupRender?: Snippet<[Snippet, TabsMoreRenderInfo]>;
  /** @defaultValue 'hover' */
  trigger?: TabsMoreTrigger | readonly TabsMoreTrigger[];
  /** @defaultValue 'bottomLeft' */
  placement?: TabsMorePlacement;
  /** Задержки в секундах, как в исходном Dropdown. @defaultValue 0.1 */
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  /** Controlled visibility перекрывает внутреннее состояние, включая закрытие через onClose. */
  visible?: boolean;
  /** Как more в rc-tabs, заменяет внутренний pointer/dismiss callback; для control передавайте visible. */
  onVisibleChange?: (visible: boolean) => void;
  overlayClassName?: string;
  overlayStyle?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  autoFocus?: boolean;
  minOverlayWidthMatchTrigger?: boolean;
  onOverlayClick?: (event: MouseEvent) => void;
}

export interface TabsItem {
  key: string;
  label: TabsContent;
  children?: Snippet;
  icon?: Snippet;
  disabled?: boolean;
  /** В editable-card запрещает удаление; disabled также скрывает кнопку. */
  closable?: boolean;
  /** Null/false скрывают кнопку при не заданном closable; closable=true сохраняет её. */
  closeIcon?: TabsContent;
  forceRender?: boolean;
  /** Настройка панели перекрывает корневую; современное имя перекрывает alias. */
  destroyOnHidden?: boolean;
  /** @deprecated Используйте destroyOnHidden. */
  destroyInactiveTabPane?: boolean;
}

/** Исходные доступные имена управляющих кнопок Tabs. */
export interface TabsLocale {
  addAriaLabel?: string;
  removeAriaLabel?: string;
  /** Имя listbox скрытых вкладок; пустая строка сохраняется. */
  dropdownAriaLabel?: string;
}

/** Имена классов или CSS-строки; popup string сокращает запись popup.root. */
export interface TabsSlots {
  root?: string;
  item?: string;
  remove?: string;
  indicator?: string;
  body?: string;
  content?: string;
  header?: string;
  popup?: string | { root?: string; };
}

/** Props с source size (undefined без явного размера), physical placement и нормализованными items. */
export type TabsSemanticProps = Omit<TabsProps, 'items' | 'size' | 'tabPlacement' | 'nativeElement'> & {
  items: readonly TabsItem[];
  size: ComponentSize | 'medium' | undefined;
  tabPlacement?: TabsPosition;
};

export type TabsSemantic = TabsSlots | ((info: { props: TabsSemanticProps; }) => TabsSlots);

/** Настройки ConfigProvider.tabs; вложенный provider заменяет весь record. */
export interface TabsConfig {
  class?: string;
  style?: string;
  classNames?: TabsSemantic;
  styles?: TabsSemantic;
  indicator?: TabsIndicator;
  /** @deprecated Используйте indicator.size. */
  indicatorSize?: TabsIndicatorSize;
  addIcon?: TabsContent;
  removeIcon?: TabsContent;
  moreIcon?: TabsContent;
  /** Как в 6.6.8, глобальный more использует только icon; остальные поля не меняют trigger. */
  more?: Omit<TabsMoreProps, 'popupRender'>;
}

/** Набор keyed панелей с bind:activeKey, ручной клавиатурной активацией и overflow. */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  items: readonly TabsItem[];
  /** Поддерживает bind:activeKey. */
  activeKey?: string | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string, event: MouseEvent) => void;
  /**
   * Только при изменении scroll на текущей оси;
   * соседние native events могут объединяться браузером.
   */
  onTabScroll?: (info: TabsScrollInfo) => void;
  indicator?: TabsIndicator;
  /** @deprecated Используйте indicator.size; его nullish значение сохраняет этот fallback. */
  indicatorSize?: TabsIndicatorSize;
  type?: TabsType;
  /** Исходный default: inkBar=true, tabPane=false; true включает обе анимации. */
  animated?: boolean | TabsAnimatedConfig;
  /** Запрашивает изменение items у владельца; add получает событие, remove — key. */
  onEdit?: (target: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') => void;
  /** Скрывает добавление только в editable-card. @defaultValue false */
  hideAdd?: boolean;
  /** Falsy значение использует исходную иконку PlusOutlined. */
  addIcon?: TabsContent;
  /** Nullish значение использует CloseOutlined; falsy fallback при удалении — «×». */
  removeIcon?: TabsContent;
  /** По умолчанию исходные Add tab/remove; не заменяет доступное имя tablist. */
  locale?: TabsLocale;
  more?: TabsMoreProps;
  /**
   * Legacy иконка: глобальные tabs.more.icon ?? tabs.moreIcon имеют приоритет.
   * Явное локальное more.icon перекрывает их, включая null/false/undefined.
   */
  moreIcon?: TabsContent;
  /** @deprecated Используйте classNames.popup.root. */
  popupClassName?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** @defaultValue 'top' */
  tabPlacement?: TabsPlacement;
  /** Физическая сторона без RTL-переотражения. @deprecated Используйте tabPlacement. */
  tabPosition?: TabsPosition;
  /**
   * Центрирует горизонтальные заголовки; вертикальный список растягивается как в source.
   * @defaultValue false
   */
  centered?: boolean;
  /** Отступ в px перед каждым заголовком, кроме первого, и кнопкой добавления. */
  tabBarGutter?: number;
  /** CSS-строка для панели заголовков; style по-прежнему относится к корню Tabs. */
  tabBarStyle?: string;
  /** Medium соответствует middle; при отсутствии используется ConfigProvider.componentSize. */
  size?: ComponentSize | 'medium';
  /** @defaultValue false */
  destroyOnHidden?: boolean;
  /** @deprecated Используйте destroyOnHidden; явное современное false перекрывает alias. */
  destroyInactiveTabPane?: boolean;
  tabBarExtraContent?: TabsExtraContent;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Provider и локальные классы накапливаются; callback получает разрешённые props. */
  classNames?: TabsSemantic;
  /** CSS-строки; root style перекрывает styles.root, tabBarStyle перекрывает styles.header. */
  styles?: TabsSemantic;
  /** bind:nativeElement предоставляет корневой HTMLDivElement после mount; SSR refs не заполняются. */
  nativeElement?: HTMLDivElement;
}
