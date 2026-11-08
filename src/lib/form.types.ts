import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { FormValidationError } from './FormValidationError';
import type { FormInstance } from './form.model.svelte.js';
import type { ColProps } from './grid.types';
import type { FormValues } from './validation.engine';
import type { ComponentSize, RenderEmptyContent, Variant } from './types';
import type { Options, ScrollAction } from './vendor/compute-scroll-into-view';
import type { TooltipProps } from './tooltip.types';

/** Defaults подсказки label; icon заменяет React element Svelte snippet. */
export interface FormTooltipProps extends Omit<TooltipProps, 'children'> {
  icon?: Snippet | null;
  /** Fallback содержимого значка, если icon не задан. */
  children?: RenderEmptyContent;
}

/** Content включает массивы; объект содержит Tooltip options и локальный icon. */
export type FormItemTooltip = FormTooltipProps | RenderEmptyContent;

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

export interface FormRequiredMarkInfo {
  required: boolean;
}

/**
 * Визуальная отметка label; content после обработки colon включает значок tooltip, если он задан.
 * Bivariant renderer сохраняет совместимость существующих строковых snippets.
 */
export type FormRequiredMark = boolean | 'optional'
  | { render(label: RenderEmptyContent, info: FormRequiredMarkInfo): ReturnType<Snippet> }['render'];

export interface FormLocale {
  /** Пустая строка использует исходный английский fallback. */
  optional?: string;
}

/** Плоские class/CSS slots Form; root относится к Form, остальные — к полям и ErrorList. */
export interface FormSemanticSlots {
  root?: string;
  label?: string;
  content?: string;
  help?: string;
  helpItem?: string;
  extra?: string;
}

/** Callback получает native props с разрешёнными layout/disabled и defaults подписей. */
export type FormSemantic = FormSemanticSlots
  | (<Values extends FormValues>(info: { props: FormProps<Values> }) => FormSemanticSlots | undefined);

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
  /** Добавляет colon к горизонтальной подписи; undefined наследует ConfigProvider.form, затем true. */
  colon?: boolean;
  /** Выравнивание подписи; undefined наследует ConfigProvider.form, затем right. */
  labelAlign?: 'left' | 'right';
  /** Перенос текста подписи; undefined наследует ConfigProvider.form, затем false. */
  labelWrap?: boolean;
  /** Колонки label по ColProps; FormItem заменяет объект целиком, включая {}. */
  labelCol?: ColProps;
  /** Колонки controls по ColProps; вложенный FormItem не наследует колонки внешнего. */
  wrapperCol?: ColProps;
  /** Только оформление label, без изменения required/validation; config, затем true. */
  requiredMark?: FormRequiredMark;
  /** Оформление дочерних полей; undefined сбрасывает внешний Form, сохраняя ConfigProvider. */
  variant?: Variant;
  /** Размер формы и дочерних компонентов; undefined наследует ближайший Form/ConfigProvider. */
  size?: ComponentSize;
  /** Defaults подсказок; не показывают значок без FormItem.tooltip. */
  tooltip?: FormTooltipProps;
  /** По умолчанию form; false оставляет контекст без native wrapper и DOM-атрибутов. */
  component?: 'form' | false;
  disabled?: boolean;
  /** Вызывается после успешной validation; Promise удерживает submitting до завершения. */
  onFinish?: (values: Values) => void | Promise<void>;
  /** Ошибки validation; outOfDate отличает устаревший результат проверки. */
  onFinishFailed?: (error: FormValidationError<Values>) => void;
  /**
   * Прокрутка первой ошибки после onFinishFailed; local prop заменяет config целиком.
   * True прокручивает без фокуса, false отключает действие. Без настройки сохранён native автофокус.
   */
  scrollToFirstError?: boolean | FormScrollOptions;
  /** Ошибка выполнения onFinish; ошибки validation поступают в onFinishFailed. */
  onError?: (error: unknown) => void;
  /** Классы semantic slots накапливаются после ConfigProvider.form.classNames. */
  classNames?: FormSemantic;
  /** CSS-строки semantic slots после config.styles; local style перекрывает root. */
  styles?: FormSemantic;
  /** Дополнительный класс native wrapper; component=false не создаёт корень. */
  rootClassName?: string;
  class?: string;
}

/** Defaults Form; undefined наследует родительский record, {} заменяет его. */
export type FormConfig = Pick<
  FormProps<FormValues>, 'colon' | 'labelAlign' | 'labelWrap' | 'requiredMark'
    | 'class' | 'style' | 'classNames' | 'styles' | 'scrollToFirstError' | 'tooltip'
>;
