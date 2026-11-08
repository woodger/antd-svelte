import { getContext, setContext } from 'svelte';
import type { FormValidateStatus } from './form-error-list.types';

/** Реактивное состояние ближайшего FormItem; ошибки и предупреждения доступны только для чтения. */
export interface FormItemStatus {
  /** '' внутри pristine FormItem; undefined вне Item и за границей вложенного Form. */
  readonly status: FormValidateStatus | undefined;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

const statusKey = Symbol('ant-design-form-item-status');
const defaultStatus: Partial<FormItemStatus> = {};

export function useFormItemStatusContext(): Partial<FormItemStatus> {
  return getContext<Partial<FormItemStatus> | undefined>(statusKey) ?? defaultStatus;
}

export function provideFormItemStatus(status: Partial<FormItemStatus>) {
  setContext(statusKey, status);
}

/**
 * Аналог Form.Item.useStatus; вызывается при инициализации компонента.
 * Читайте getter-поля возвращённого объекта: destructuring фиксирует snapshot.
 */
export function useFormItemStatus(): FormItemStatus {
  const context = useFormItemStatusContext();
  const errors: readonly string[] = [];
  const warnings: readonly string[] = [];

  return {
    get status() { return context.status; },
    get errors() { return context.errors ?? errors; },
    get warnings() { return context.warnings ?? warnings; }
  };
}
