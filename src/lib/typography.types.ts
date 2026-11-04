import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
import type { TextAreaProps } from './textarea.types';
import type { TooltipProps } from './tooltip.types';

/** Scalar/array content сохраняет границы текста для JS ellipsis; snippet — цельный узел. */
export type TypographyContent = string | number | bigint | boolean | null | undefined
  | Snippet | readonly TypographyContent[];
export type TypographyType = 'secondary' | 'success' | 'warning' | 'danger';
export type TypographySemanticName = 'root' | 'actions' | 'action' | 'textarea';
export type TypographySlots = Partial<Record<TypographySemanticName, string>>;
export type TypographySemantic = TypographySlots | ((info: {
  props: TypographySemanticProps;
}) => TypographySlots);

/** PrefixCls и direction разрешены до callback; остальные props сохраняют входные значения. */
export interface TypographySemanticProps {
  prefixCls: string;
  direction: 'ltr' | 'rtl';
  component?: keyof HTMLElementTagNameMap;
  children?: TypographyContent;
  [name: string]: unknown;
}

/** Настройки всего семейства Typography; локальные semantic styles имеют приоритет. */
export interface TypographyConfig {
  class?: string;
  style?: string;
  classNames?: TypographySemantic;
  styles?: TypographySemantic;
}

export interface TypographyLocale {
  edit: string;
  copy: string;
  copied: string;
  expand: string;
  collapse: string;
}

/** Async text вызывается при клике; falsy text использует исходный children fallback. */
export interface TypographyCopyConfig {
  text?: string | (() => string | Promise<string>);
  onCopy?: (event?: MouseEvent) => void;
  /** Scalar задаёт обычную иконку; массив — обычную и успешную. Falsy icon включает default. */
  icon?: TypographyContent;
  /**
   * False отключает обе подсказки; массив задаёт обычную и успешную отдельно.
   * Trigger/delays наследуют ConfigProvider.tooltip.
   */
  tooltips?: TypographyContent;
  format?: 'text/plain' | 'text/html';
  tabIndex?: number;
}

/** Editing управляется владельцем при заданном editing; callbacks сами не меняют children. */
export interface TypographyEditConfig {
  text?: string;
  editing?: boolean;
  icon?: TypographyContent;
  /** Заголовок edit Tooltip; false скрывает. Trigger/delays наследуют ConfigProvider.tooltip. */
  tooltip?: TypographyContent;
  onStart?: () => void;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  onEnd?: () => void;
  maxLength?: number;
  /** @defaultValue true */
  autoSize?: TextAreaProps['autoSize'];
  /** @defaultValue ['icon'] */
  triggerType?: readonly ('icon' | 'text')[];
  /** Null скрывает default enter icon. */
  enterIcon?: Exclude<TypographyContent, Snippet> | Snippet<[className: string]>;
  tabIndex?: number;
}

/** Callback symbol возвращает content; для snippet используйте () => snippet. */
export interface TypographyEllipsisConfig {
  /** @defaultValue 1 */
  rows?: number;
  expandable?: boolean | 'collapsible';
  suffix?: string;
  symbol?: Exclude<TypographyContent, Snippet> | ((expanded: boolean) => TypographyContent);
  /** Читается один раз. @defaultValue false */
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpand?: (event: MouseEvent, info: { expanded: boolean; }) => void;
  onEllipsis?: (ellipsis: boolean) => void;
  /** Tooltip усечённого текста; trigger/delays наследуют ConfigProvider.tooltip. */
  tooltip?: TypographyContent | Omit<TooltipProps, 'children'>;
}

/** Нативный typography container; по умолчанию article. Блочные операции — у вариантов ниже. */
export interface TypographyProps extends Omit<
  HTMLAttributes<HTMLElement>, 'children' | 'class' | 'style'
> {
  children?: TypographyContent;
  component?: keyof HTMLElementTagNameMap;
  direction?: 'ltr' | 'rtl';
  prefixCls?: string;
  classNames?: TypographySemantic;
  styles?: TypographySemantic;
  class?: string;
  rootClassName?: string;
  style?: string;
  onClick?: HTMLAttributes<HTMLElement>['onclick'];
  onMouseEnter?: HTMLAttributes<HTMLElement>['onmouseenter'];
  onMouseLeave?: HTMLAttributes<HTMLElement>['onmouseleave'];
  /** Bind:nativeElement указывает на rendered element; во время editing отсутствует. */
  nativeElement?: HTMLElement;
}

/** Общие операции Text/Title/Paragraph/Link, включая исходный порядок decorations. */
export interface TypographyBlockProps extends TypographyProps {
  actions?: { placement?: 'start' | 'end'; };
  editable?: boolean | TypographyEditConfig;
  copyable?: boolean | TypographyCopyConfig;
  type?: TypographyType;
  /** Типографическое оформление; не отключает кнопки действий. */
  disabled?: boolean;
  ellipsis?: boolean | TypographyEllipsisConfig;
  code?: boolean;
  mark?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  keyboard?: boolean;
  italic?: boolean;
}

/** Inline span; ellipsis не поддерживает rows, expandable и onExpand. */
export interface TypographyTextProps extends Omit<TypographyBlockProps, 'component' | 'ellipsis'> {
  ellipsis?: boolean | Omit<TypographyEllipsisConfig, 'rows' | 'expandable' | 'onExpand'>;
}

/** Heading h1–h5; недопустимый runtime level использует h1. */
export interface TypographyTitleProps extends Omit<TypographyBlockProps, 'component' | 'strong'> {
  /** @defaultValue 1 */
  level?: 1 | 2 | 3 | 4 | 5;
}

/** Div с нижним отступом параграфа. */
export interface TypographyParagraphProps extends Omit<TypographyBlockProps, 'component'> {}

/** Native anchor; target=_blank получает rel по умолчанию noopener noreferrer. */
export interface TypographyLinkProps extends Omit<TypographyBlockProps, 'component' | 'ellipsis'>,
  Pick<HTMLAnchorAttributes, 'href' | 'target' | 'rel' | 'download' | 'hreflang' | 'ping' | 'referrerpolicy'> {
  ellipsis?: boolean;
}
