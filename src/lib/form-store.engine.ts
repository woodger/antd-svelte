import type { Dayjs } from 'dayjs';

/** Строка — буквальный ключ; только массив задаёт вложенный путь. Число создаёт индекс массива. */
export type NamePath = string | number | readonly (string | number)[];

/** Тип значения известного пути; динамический путь возвращает unknown. */
export type NamePathValue<Values, Path extends NamePath> = Path extends keyof Values
  ? Values[Path]
  : Path extends readonly []
    ? Values
    : Path extends readonly [infer Head, ...infer Tail]
      ? Head extends keyof NonNullable<Values>
        ? Tail extends readonly (string | number)[]
          ? NamePathValue<NonNullable<Values>[Head], Tail>
            | (undefined extends Values ? undefined : null extends Values ? undefined : never)
          : unknown
        : unknown
      : unknown;

/** Plain objects объединяются рекурсивно; массивы и экземпляры классов заменяются целиком. */
export type PartialFormValues<Value> = Value extends
  Date | RegExp | Dayjs | Map<unknown, unknown> | Set<unknown>
  ? Value
  : Value extends readonly unknown[]
    ? Value
    : Value extends object
      ? { [Key in keyof Value]?: PartialFormValues<Value[Key]> }
      : Value;

export function formNamePath(name: NamePath): (string | number)[] {
  return Array.isArray(name) ? [...name] : [name as string | number];
}

export function sameFormPath(first: NamePath, second: NamePath): boolean {
  const left = formNamePath(first);
  const right = formNamePath(second);

  return left.length === right.length && left.every((part, index) => part === right[index]);
}

export function containsFormPath(parent: NamePath, child: NamePath): boolean {
  const prefix = formNamePath(parent);
  const path = formNamePath(child);

  return prefix.length <= path.length && prefix.every((part, index) => part === path[index]);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function defineValue(target: object, key: string | number, value: unknown) {
  Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
}

/** Копирует изменяемые контейнеры, сохраняя Dayjs и другие непрозрачные экземпляры. */
export function copyFormValue<Value>(value: Value, seen = new WeakMap<object, unknown>()): Value {
  if (!Array.isArray(value) && !isPlainObject(value)) return value;
  if (seen.has(value)) return seen.get(value) as Value;

  const copy = Array.isArray(value) ? [] : {};
  if (Array.isArray(copy) && Array.isArray(value)) copy.length = value.length;
  seen.set(value, copy);

  for (const key of Object.keys(value)) {
    defineValue(copy, key, copyFormValue((value as Record<string, unknown>)[key], seen));
  }

  return copy as Value;
}

export function getFormValue(store: unknown, name: NamePath): unknown {
  let current = store;

  for (const part of formNamePath(name)) {
    if (current === null || typeof current !== 'object' || !Object.hasOwn(current, part)) {
      return undefined;
    }

    current = (current as Record<string | number, unknown>)[part];
  }

  return current;
}

export function setFormValue(store: unknown, name: NamePath, value: unknown): unknown {
  const path = formNamePath(name);

  function set(current: unknown, index: number): unknown {
    if (index === path.length) return copyFormValue(value);

    const part = path[index];
    const copy = Array.isArray(current)
      ? [...current]
      : isPlainObject(current)
        ? { ...current }
        : typeof part === 'number' ? [] : {};

    defineValue(copy, part, set(getFormValue(current, [part]), index + 1));

    return copy;
  }

  return set(store, 0);
}

export function mergeFormValues<Values>(store: Values, next: unknown): Values {
  const seen = new WeakMap<object, unknown>();

  function merge(current: unknown, value: unknown): unknown {
    if (!isPlainObject(value)) return copyFormValue(value, seen);
    if (seen.has(value)) return seen.get(value);

    const copy = isPlainObject(current) ? copyFormValue(current) : {};
    seen.set(value, copy);

    for (const key of Object.keys(value)) {
      defineValue(copy, key, merge(getFormValue(copy, key), value[key]));
    }

    return copy;
  }

  return merge(store, next) as Values;
}

/** Plain containers сравниваются по собственным значениям; непрозрачные экземпляры — по identity. */
export function sameFormValue(left: unknown, right: unknown): boolean {
  const pairs = new WeakMap<object, WeakSet<object>>();

  function equal(first: unknown, second: unknown): boolean {
    if (Object.is(first, second)) return true;
    if ((!Array.isArray(first) && !isPlainObject(first))
      || (!Array.isArray(second) && !isPlainObject(second))) return false;
    if (Array.isArray(first) !== Array.isArray(second)) return false;
    if (Array.isArray(first) && Array.isArray(second) && first.length !== second.length) return false;

    const keys = Object.keys(first);
    if (keys.length !== Object.keys(second).length) return false;
    if (pairs.get(first)?.has(second)) return true;

    const matched = pairs.get(first) ?? new WeakSet<object>();
    matched.add(second);
    pairs.set(first, matched);

    return keys.every((key) => Object.hasOwn(second, key) && equal(
      (first as Record<string, unknown>)[key], (second as Record<string, unknown>)[key]
    ));
  }

  return equal(left, right);
}
