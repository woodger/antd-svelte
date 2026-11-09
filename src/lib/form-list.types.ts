import type { Snippet } from 'svelte';
import type { NamePath } from './form-store.engine';
import type { ValidationRule } from './validation.engine';

/** Индекс задаёт текущий путь, key сохраняет экземпляр строки при перестановках. */
export interface FormListFieldData {
  name: number;
  key: number;
}

export interface FormListOperation {
  /** Без insertIndex добавляет в конец; отсутствующий defaultValue остаётся undefined. */
  add(defaultValue?: unknown, insertIndex?: number): void;
  remove(index: number | readonly number[]): void;
  /** Перемещает строку вместе с key; неверные индексы не меняют список. */
  move(from: number, to: number): void;
}

export interface FormListMeta {
  errors: readonly string[];
  warnings: readonly string[];
}

/** Правило списка использует прежний Svelte validator(value, values), только custom validation. */
export interface FormListRule {
  validator: NonNullable<ValidationRule['validator']>;
  message?: string;
  /** Предупреждение отображается в meta.warnings и не блокирует submit. */
  warningOnly?: boolean;
}

/** Управляет массивом в ближайшем Form; вложенный name считается от родительского FormList. */
export interface FormListProps {
  /** Префикс FormErrorList внутри списка; empty/undefined наследуют ConfigProvider. */
  prefixCls?: string;
  name: NamePath;
  /** Form initialValues имеет приоритет; значение копируется и участвует в reset. */
  initialValue?: readonly unknown[];
  rules?: readonly FormListRule[];
  /** Ключуйте each по field.key. Bindings модели используют полный путь от корня Form. */
  children: Snippet<[FormListFieldData[], FormListOperation, FormListMeta]>;
}
