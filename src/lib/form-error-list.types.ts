import type { RenderEmptyContent } from './types';

/** Визуальный статус поля/help; '' отключает автоматический статус metadata FormItem. */
export type FormValidateStatus = 'success' | 'warning' | 'error' | 'validating' | '';

/** Сообщения FormList; строки/числа и Svelte snippets заменяют ReactNode. */
export interface FormErrorListProps {
  /** Задаёт id контейнера `${fieldId}_help`; пустая строка не создаёт id. */
  fieldId?: string;
  /** Любое значение, кроме null/undefined, заменяет errors и warnings, включая false/0/''. */
  help?: RenderEmptyContent;
  /** Без status у help нет цветового класса; errors/warnings задают свой status сами. */
  helpStatus?: FormValidateStatus;
  errors?: readonly RenderEmptyContent[];
  warnings?: readonly RenderEmptyContent[];
  class?: string;
  /** После появления/скрытия; не вызывается для исходного пустого списка и после unmount. */
  onVisibleChanged?: (visible: boolean) => void;
}
