interface FormListKeys {
  keys: number[];
  nextKey: number;
}

type FormListAction =
  | { type: 'add'; value?: unknown; index?: number }
  | { type: 'remove'; index: number | readonly number[] }
  | { type: 'move'; from: number; to: number };

export function syncFormListKeys(state: FormListKeys, values: readonly unknown[]): FormListKeys {
  let keys = state.keys;
  let nextKey = state.nextKey;

  values.forEach((_, index) => {
    if (keys[index] === undefined) {
      if (keys === state.keys) keys = state.keys.slice();
      keys[index] = nextKey++;
    }
  });

  return keys === state.keys ? state : { keys, nextKey };
}

/** Перенос key management из rc-form 1.8.6 List: внешняя замена сохраняет ключи по индексам. */
export function changeFormList(
  values: readonly unknown[],
  state: FormListKeys,
  action: FormListAction
): { values: unknown[]; state: FormListKeys } | undefined {
  if (action.type === 'add') {
    const index = action.index;
    const insert = index !== undefined && index >= 0 && index <= values.length;

    return {
      values: insert
        ? [...values.slice(0, index), action.value, ...values.slice(index)]
        : [...values, action.value],
      state: {
        keys: insert
          ? [...state.keys.slice(0, index), state.nextKey, ...state.keys.slice(index)]
          : [...state.keys, state.nextKey],
        nextKey: state.nextKey + 1
      }
    };
  }

  if (action.type === 'remove') {
    const removed = new Set(Array.isArray(action.index) ? action.index : [action.index]);
    if (!removed.size) return;

    return {
      values: values.filter((_, index) => !removed.has(index)),
      state: {
        keys: state.keys.filter((_, index) => !removed.has(index)),
        nextKey: state.nextKey
      }
    };
  }

  const { from, to } = action;
  if (!Number.isInteger(from) || !Number.isInteger(to) || from === to
    || from < 0 || to < 0 || from >= values.length || to >= values.length) return;

  const movedValues = [...values];
  const movedKeys = [...state.keys];
  movedValues.splice(to, 0, movedValues.splice(from, 1)[0]);
  movedKeys.splice(to, 0, movedKeys.splice(from, 1)[0]);

  return { values: movedValues, state: { keys: movedKeys, nextKey: state.nextKey } };
}
