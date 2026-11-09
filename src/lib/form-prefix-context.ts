import { getContext, setContext } from 'svelte';

interface FormPrefixContext {
  readonly prefixCls?: string;
}

const key = Symbol('ant-design-form-prefix');

export function useFormPrefix() {
  return getContext<FormPrefixContext | undefined>(key);
}

export function provideFormPrefix(value: FormPrefixContext) {
  setContext(key, value);
}
