import type { Snippet } from 'svelte';

export type SplitterOrientation = 'horizontal' | 'vertical';
export type SplitterSize = number | string;
export type SplitterContent = string | number | boolean | null | Snippet;
export type SplitterIconVisibility = boolean | 'auto';

/** Svelte-дескриптор React Splitter.Panel; элементы сохраняются по позиции, не по key. */
export interface SplitterPanelProps {
  children?: SplitterContent;
  /** Контролирует всю группу, если хотя бы у одной панели size не null/undefined. */
  size?: SplitterSize;
  /** Читается только при создании Splitter; по умолчанию остаток делится между панелями. */
  defaultSize?: SplitterSize;
  /** Число в px либо процентная строка. */
  min?: SplitterSize;
  max?: SplitterSize;
  /** Обе соседние панели должны разрешать resize; по умолчанию true. */
  resizable?: boolean;
  /** По умолчанию false; у объекта showCollapsibleIcon по умолчанию auto. */
  collapsible?: boolean | {
    start?: boolean;
    end?: boolean;
    showCollapsibleIcon?: SplitterIconVisibility;
  };
  /** Переопределяет Splitter.destroyOnHidden; false сохраняет скрытое содержимое. */
  destroyOnHidden?: boolean;
  class?: string;
  /** Геометрические flex-basis/flex-grow задаются после style. */
  style?: string;
}

export interface SplitterClassSlots {
  root?: string;
  panel?: string;
  /** Строка равнозначна { default: value }. */
  dragger?: string | { default?: string; active?: string; };
}

export interface SplitterStyleSlots {
  root?: string;
  panel?: string;
  /** Как в pinned SplitBar, применяется default; поле active принимается, но не используется. */
  dragger?: { default?: string; active?: string; };
}

/** Callback получает разрешённые orientation и vertical; CSS styles передаются строками. */
export type SplitterSemantic<Value> = Value
  | ((info: { props: SplitterProps; }) => Value | undefined);

/** Наследуемые root/panel/dragger styles; nested config заменяется целиком. */
export interface SplitterConfig {
  class?: string;
  style?: string;
  classNames?: SplitterSemantic<SplitterClassSlots>;
  styles?: SplitterSemantic<SplitterStyleSlots>;
}

/** Splitter с исходными правилами размеров, drag/lazy и collapse Ant Design 6.6.8. */
export interface SplitterProps {
  /** Явная замена анализа React children/Panel; содержимое задаётся scalar или Snippet. */
  items?: SplitterPanelProps[];
  /** Приоритет: orientation, boolean vertical, deprecated layout, horizontal. */
  orientation?: SplitterOrientation;
  vertical?: boolean;
  /** @deprecated Используйте orientation. */
  layout?: SplitterOrientation;
  /** Lazy меняет размеры только на release и вызывает onResizeEnd без onResize. */
  lazy?: boolean;
  /** По умолчанию содержимое collapsed панелей остаётся в DOM. */
  destroyOnHidden?: boolean;
  collapsible?: {
    /** CSS transition; по умолчанию false, на время drag отключается. */
    motion?: boolean;
    /** Новый объект имеет приоритет над deprecated collapsibleIcon целиком. */
    icon?: { start?: SplitterContent; end?: SplitterContent; };
  };
  /** undefined оставляет исходный spinner; null/false создают пустой custom wrapper. */
  draggerIcon?: SplitterContent;
  /** @deprecated Используйте collapsible.icon. */
  collapsibleIcon?: { start?: SplitterContent; end?: SplitterContent; };
  /** Вызывается также у resizable=false; второй mousedown в пределах 300ms не начинает drag. */
  onDraggerDoubleClick?: (index: number) => void;
  onResizeStart?: (sizes: number[]) => void;
  /** Предложенные размеры в px, включая controlled rejection; collapse тоже вызывает callback. */
  onResize?: (sizes: number[]) => void;
  /** Normal drag сообщает текущие размеры, lazy и collapse — предложенные. */
  onResizeEnd?: (sizes: number[]) => void;
  /** После onResize и onResizeEnd; collapsed определяется через abs(size) < Number.EPSILON. */
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: SplitterSemantic<SplitterClassSlots>;
  styles?: SplitterSemantic<SplitterStyleSlots>;
  /** bind:nativeElement заменяет React SplitterRef и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
