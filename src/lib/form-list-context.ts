import { getContext, setContext } from 'svelte';

interface FormListContext {
  readonly prefixName: readonly (string | number)[];
}

const listKey = Symbol('ant-design-form-list');

export function provideFormList(list: FormListContext | undefined) {
  setContext(listKey, list);
}

export function useFormList(): FormListContext | undefined {
  return getContext(listKey);
}
