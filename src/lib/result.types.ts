import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ResultStatus =
  'success'
  | 'error'
  | 'info'
  | 'warning'
  | 403
  | 404
  | 500
  | '403'
  | '404'
  | '500';
export type ResultContent = string | number | boolean | null | Snippet
  | readonly (ResultContent | undefined)[];
export interface ResultSemanticSlots {
  root?: string;
  title?: string;
  subTitle?: string;
  body?: string;
  extra?: string;
  icon?: string;
}
export interface ResultSemanticInfo {
  props: ResultProps & { status: ResultStatus; };
}
export type ResultSemantic = ResultSemanticSlots
  | ((info: ResultSemanticInfo) => ResultSemanticSlots | undefined);
export interface ResultRef {
  readonly nativeElement: HTMLDivElement;
}
/** Настройки оформления; локальные semantic styles и style приоритетнее. */
export type ResultConfig = Pick<ResultProps, 'class' | 'style' | 'classNames' | 'styles'>;

/** Страница результата со статусом, иллюстрацией, title/subTitle и действиями. */
export interface ResultProps {
  /** @defaultValue 'info' */
  status?: ResultStatus;
  title?: ResultContent;
  subTitle?: ResultContent;
  /** Null/false скрывают обычную иконку; иллюстрации исключений имеют приоритет. */
  icon?: ResultContent;
  extra?: ResultContent;
  children?: ResultContent;
  /** @defaultValue 2 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  /** Явный role приоритетнее native group, создаваемой по aria-label/labelledby. */
  role?: HTMLAttributes<HTMLDivElement>['role'];
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
  prefixCls?: string;
  rootClassName?: string;
  /** Object/function slots; callbacks получают входные props с разрешённым status. */
  classNames?: ResultSemantic;
  styles?: ResultSemantic;
  /** Присваивается после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  ref?: ResultRef;
  [attribute: `aria-${string}`]: unknown;
  [attribute: `data-${string}`]: unknown;
}
