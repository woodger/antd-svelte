import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { FormValidationError } from './FormValidationError';
import type { FormInstance } from './form.model.svelte.js';
import type { FormValues } from './validation.engine';
import type { Variant } from './types';
import type { Options, ScrollAction } from './vendor/compute-scroll-into-view';

/**
 * Прокрутка Form: по умолчанию if-needed/nearest, без изменения фокуса.
 * CSS scroll-margin пока не участвует в расчёте.
 */
export interface FormScrollOptions extends Options {
  /** Нативное поведение прокрутки либо callback с рассчитанными actions. */
  behavior?: ScrollBehavior | ((actions: ScrollAction[]) => unknown);
  /** После прокрутки вызывает focusField; пользовательский behavior не ожидается. */
  focus?: boolean;
}

/** Нативная форма для реактивной модели, validation и асинхронного onFinish. */
export interface FormProps<Values extends FormValues> extends Omit<
  HTMLFormAttributes,
  'children' | 'onsubmit' | 'onreset' | 'class'
> {
  /** Изолированная модель, созданная createForm. */
  form: FormInstance<Values>;
  children: Snippet;
  /** @defaultValue 'vertical' */
  layout?: 'vertical' | 'horizontal' | 'inline';
  /** Оформление дочерних полей; undefined сбрасывает внешний Form, сохраняя ConfigProvider. */
  variant?: Variant;
  /** По умолчанию form; false оставляет контекст без native wrapper и DOM-атрибутов. */
  component?: 'form' | false;
  disabled?: boolean;
  /** Вызывается после успешной validation; Promise удерживает submitting до завершения. */
  onFinish?: (values: Values) => void | Promise<void>;
  /** Ошибки validation; outOfDate отличает устаревший результат проверки. */
  onFinishFailed?: (error: FormValidationError<Values>) => void;
  /** Ошибка выполнения onFinish; ошибки validation поступают в onFinishFailed. */
  onError?: (error: unknown) => void;
  class?: string;
}
