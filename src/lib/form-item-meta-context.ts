import { getContext, setContext } from 'svelte';
import type { FormItemMessages } from './form-no-style.engine';

export interface FormItemMetaContext {
  readonly describedBy: string | undefined;
  register(field: FormItemMessages): () => void;
}

const metaKey = Symbol('ant-design-form-item-meta');

export function useFormItemMeta(): FormItemMetaContext | undefined {
  return getContext(metaKey);
}

export function provideFormItemMeta(meta: FormItemMetaContext) {
  setContext(metaKey, meta);
}
